package de.jdynameta.jdy.model.jpa;

import de.jdynameta.base.metainfo.AttributeHandler;
import de.jdynameta.base.metainfo.ObjectReferenceAttributeInfo;
import de.jdynameta.base.metainfo.PrimitiveAttributeInfo;
import de.jdynameta.base.metainfo.filter.ObjectFilterExpression;
import de.jdynameta.base.metainfo.filter.defaultimpl.*;
import de.jdynameta.base.value.JdyPersistentException;
import de.jdynameta.base.value.TypedValueObject;
import de.jdynameta.base.value.ValueObject;
import de.jdynameta.persistence.state.ApplicationObj;

import javax.persistence.EntityManager;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.metamodel.EntityType;
import java.util.ArrayList;
import java.util.List;

public class JpaWriter {


    public TypedValueObject insertInDb(final ApplicationObj objToInsert, EntityType<?> entityType, EntityManager entityManager) throws JdyPersistentException {

        try {
            Object jpaObjToInsert = entityType.getJavaType().newInstance();
            TypedReflectionValueObjectWrapper wrappedObj = new TypedReflectionValueObjectWrapper(jpaObjToInsert, objToInsert.getClassInfo());

            objToInsert.getClassInfo().handleAttributes(new AttributeHandler() {
                @Override
                public void handleObjectReference(ObjectReferenceAttributeInfo aInfo, ValueObject objToHandle) throws JdyPersistentException {

                }

                @Override
                public void handlePrimitiveAttribute(PrimitiveAttributeInfo aInfo, Object objToHandle) throws JdyPersistentException {
                    wrappedObj.setValue(aInfo, objToInsert.getValue(aInfo));
                }
            }, wrappedObj);

            entityManager.persist(jpaObjToInsert);
            return wrappedObj;
        } catch (RuntimeException | IllegalAccessException | InstantiationException ex) {
            throw new JdyPersistentException(ex);
        }
    }

    public void deleleteInDb(final ApplicationObj objToDelete, EntityType<?> entityType, EntityManager entityManager) throws JdyPersistentException {

        final List<ObjectFilterExpression> idExprList = new ArrayList<>();

        objToDelete.getClassInfo().handleAttributes(new AttributeHandler() {
            @Override
            public void handleObjectReference(ObjectReferenceAttributeInfo aInfo, ValueObject objToHandle) throws JdyPersistentException {

                if (aInfo.isKey()) {
                    idExprList.add(new DefaultObjectReferenceEqualExpression(aInfo,objToHandle));
                }
            }

            @Override
            public void handlePrimitiveAttribute(PrimitiveAttributeInfo aInfo, Object objToHandle) throws JdyPersistentException {
                if (aInfo.isKey()) {
                    final DefaultOperatorExpression opExpr = new DefaultOperatorExpression();
                    opExpr.setAttributeInfo(aInfo);
                    opExpr.setCompareValue(objToHandle);
                    opExpr.setMyOperator(DefaultOperatorEqual.getEqualInstance());
                    idExprList.add(opExpr);
                }

            }
        }, objToDelete);


        final DefaultClassInfoQuery query = new DefaultClassInfoQuery(objToDelete.getClassInfo(), new DefaultExpressionAnd(idExprList));
        final CriteriaQuery<Object> criteriaQuery = new JpaFilterConverter(entityManager).convert( query);
        final Object jpaObjToDelete = entityManager.createQuery(criteriaQuery).getSingleResult();
        if (jpaObjToDelete != null) {
            entityManager.remove(jpaObjToDelete);
        }
    }
}
