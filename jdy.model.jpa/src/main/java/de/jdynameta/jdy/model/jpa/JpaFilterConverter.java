package de.jdynameta.jdy.model.jpa;

import de.jdynameta.base.metainfo.AttributeInfo;
import de.jdynameta.base.metainfo.ObjectReferenceAttributeInfo;
import de.jdynameta.base.metainfo.PrimitiveAttributeInfo;
import de.jdynameta.base.metainfo.filter.*;
import de.jdynameta.base.metainfo.filter.defaultimpl.DefaultObjectReferenceEqualExpression;
import de.jdynameta.base.value.JdyPersistentException;
import de.jdynameta.base.value.ValueObject;

import javax.persistence.EntityManager;
import javax.persistence.criteria.*;
import javax.persistence.metamodel.EntityType;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;

/**
 * Convert a {@link de.jdynameta.base.metainfo.filter.ClassInfoQuery} into a Jpa Criteria
 */
public class JpaFilterConverter {

    private final EntityManager entityManager;

    public JpaFilterConverter(final EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public CriteriaQuery<Object> convert(final ClassInfoQuery jdyQuery) throws JdyPersistentException {

        final Optional<EntityType<?>> entityTypeHolder = this.getJpaEntityTypeForClassName(jdyQuery.getResultInfo().getInternalName());
        final EntityType entityType = entityTypeHolder.get();
        final CriteriaBuilder criteriaBuilder = this.entityManager.getCriteriaBuilder();
        final CriteriaQuery<Object> query = criteriaBuilder.createQuery(entityType.getJavaType());
        final Root<?> entityRoot = query.from(entityType.getJavaType());


        final ObjectFilterExpression rootExpression = jdyQuery.getFilterExpression();
        final Predicate rootPredicate = rootExpression.visit(new JpaVisitor(criteriaBuilder,entityRoot));
        return query.select(entityRoot).where(rootPredicate);
    }

    private Optional<EntityType<?>> getJpaEntityTypeForClassName(final String className) {

        return this.entityManager.getMetamodel().getEntities()
                .stream()
                .filter(entity -> entity.getName().equals(className)).findFirst();
    }

    private static class JpaVisitor implements ExpressionVisitor<Predicate> {

        final CriteriaBuilder criteriaBuilder;
        final From<?,?> entityRoot;

        public JpaVisitor(final CriteriaBuilder criteriaBuilder, final From<?,?> entityRoot) {
            this.criteriaBuilder = criteriaBuilder;
            this.entityRoot = entityRoot;
        }

        @Override
        public Predicate visitAndExpression(final AndExpression aAndExpr) throws JdyPersistentException {

            final List<Predicate> subPredicates = new ArrayList<>();
            for(final Iterator<ObjectFilterExpression> exprIter = aAndExpr.getExpressionIterator(); exprIter.hasNext();) {

                final Predicate predicate = exprIter.next().visit(this);
                subPredicates.add(predicate);
            }
            return this.criteriaBuilder.and(subPredicates.toArray(new Predicate[subPredicates.size()]));
        }

        @Override
        public Predicate visitOrExpression(final OrExpression aOrExpression) throws JdyPersistentException {

            final List<Predicate> subPredicates = new ArrayList<>();
            for(final Iterator<ObjectFilterExpression> exprIter = aOrExpression.getExpressionIterator(); exprIter.hasNext();) {

                final Predicate predicate = exprIter.next().visit(this);
                subPredicates.add(predicate);
            }
            return this.criteriaBuilder.or(subPredicates.toArray(new Predicate[subPredicates.size()]));
        }

        @Override
        public Predicate visitOperatorExpression(final OperatorExpression aOpExpr) throws JdyPersistentException {

            final JpaOperatorVisitor visitor = new JpaOperatorVisitor(this.entityRoot, this.criteriaBuilder,aOpExpr);
            return aOpExpr.getOperator().visitOperatorHandler(visitor);
        }

        @Override
        public Predicate visitReferenceEqualExpression(final ObjectReferenceEqualExpression aOpExpr) {

            final Join<Object, Object> joinRoot = this.entityRoot.join(aOpExpr.getAttributeInfo().getInternalName());
            final Iterable<? extends AttributeInfo> attrIter = aOpExpr.getAttributeInfo().getReferencedClass().getAttributeInfoIterator();
            final List<Predicate> joinPredicates = new ArrayList<>();
            attrIter.forEach(joinAttr -> {
                if(joinAttr.isKey()) {
                    final Object compareValue = aOpExpr.getCompareValue().getValue(joinAttr);
                    if(joinAttr instanceof PrimitiveAttributeInfo) {
                        final String attrName = aOpExpr.getAttributeInfo().getInternalName();
                        final Path<Object> attrPath = joinRoot.get(attrName);
                        joinPredicates.add(this.criteriaBuilder.equal(attrPath, compareValue));
                    } else if ( joinAttr instanceof ObjectReferenceAttributeInfo){
                        final ObjectReferenceEqualExpression subJoin = new DefaultObjectReferenceEqualExpression((ObjectReferenceAttributeInfo)joinAttr, (ValueObject) compareValue);
                        joinPredicates.add(new JpaVisitor(this.criteriaBuilder,joinRoot).visitReferenceEqualExpression(subJoin));
                    }
                }
            });

            return this.criteriaBuilder.and(joinPredicates.toArray(new Predicate[joinPredicates.size()]));
        }

        @Override
        public Predicate visitAssociationExpression(final AssociationExpression aOpExpr) {

            throw new UnsupportedOperationException("ObjectReferenceSubqueryExpression is not supported at the moment");
        }

        @Override
        public Predicate visitReferenceQueryExpr(final ObjectReferenceSubqueryExpression aExpression)  {

            throw new UnsupportedOperationException("ObjectReferenceSubqueryExpression is not supported at the moment");
        }

    }

    private static class JpaOperatorVisitor implements OperatorVisitor<Predicate>
    {
        final From<?,?> entityRoot;
        private final CriteriaBuilder criteriaBuilder;
        private final Comparable compareValue;
        private final Path<Comparable> attrPath;

        private JpaOperatorVisitor(final From<?,?> entityRoot, final CriteriaBuilder criteriaBuilder, final OperatorExpression aOpExpr) throws JdyPersistentException {

            if (aOpExpr.getAttributeInfo() == null) {
                throw new JdyPersistentException("Operator Attribute Info is null");
            }
            this.entityRoot = entityRoot;
            this.criteriaBuilder = criteriaBuilder;
            final String attrName = aOpExpr.getAttributeInfo().getInternalName();
            this.compareValue = (Comparable) aOpExpr.getCompareValue();
            this.attrPath = entityRoot.get(attrName);

        }

        @Override
        public Predicate visitOperatorEqual(final OperatorEqual aOperator) {

            if(aOperator.isNotEqual()) {
                return this.criteriaBuilder.notEqual(this.attrPath, this.compareValue);
            } else {
                return this.criteriaBuilder.equal(this.attrPath, this.compareValue);
            }
        }

        @Override
        public Predicate visitOperatorGreater(final OperatorGreater aOperator) {

            if(aOperator.isAlsoEqual()) {
                return this.criteriaBuilder.greaterThanOrEqualTo(this.attrPath, this.compareValue);
            } else {
                return this.criteriaBuilder.greaterThan(this.attrPath, this.compareValue);
            }
        }

        @Override
        public Predicate visitOperatorLess(final OperatorLess aOperator) {

            if(aOperator.isAlsoEqual()) {
                return this.criteriaBuilder.lessThanOrEqualTo(this.attrPath, this.compareValue);
            } else {
                return this.criteriaBuilder.lessThan(this.attrPath, this.compareValue);
            }
        }
    }
}
