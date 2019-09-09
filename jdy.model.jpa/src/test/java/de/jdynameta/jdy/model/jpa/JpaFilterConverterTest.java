package de.jdynameta.jdy.model.jpa;

import de.jdynameta.base.metainfo.ClassInfo;
import de.jdynameta.base.metainfo.ClassRepository;
import de.jdynameta.base.metainfo.filter.defaultimpl.DefaultClassInfoQuery;
import de.jdynameta.base.metainfo.filter.defaultimpl.QueryCreator;
import de.jdynameta.base.value.JdyPersistentException;
import org.hibernate.query.criteria.internal.expression.LiteralExpression;
import org.hibernate.query.criteria.internal.predicate.ComparisonPredicate;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.junit4.SpringRunner;

import javax.persistence.criteria.CriteriaQuery;
import java.math.BigDecimal;

import static org.hamcrest.core.IsEqual.equalTo;
import static org.hamcrest.core.IsInstanceOf.instanceOf;
import static org.junit.Assert.assertThat;

@RunWith(SpringRunner.class)
@DataJpaTest
public class JpaFilterConverterTest {

    @Autowired
    private TestEntityManager entityManager;

    @Test
    public void testConvertBigDecimalEqualExpression() throws JdyPersistentException {

        JpaMetamodelReader reader = new JpaMetamodelReader();
        ClassRepository repo = reader.createMetaRepository(entityManager.getEntityManager().getMetamodel(), "TestApp");
        ClassInfo info = repo.getClassForName("AllAttributeType");

        DefaultClassInfoQuery jdyQuery = QueryCreator.start(info)
                .equal("currencyData", new BigDecimal("483.21")).query();
        CriteriaQuery<Object> jpaQuery = new JpaFilterConverter(this.entityManager.getEntityManager()).convert(jdyQuery);
        assertThat(jpaQuery.getRestriction(), instanceOf(ComparisonPredicate.class));
        ComparisonPredicate comparison = (ComparisonPredicate) jpaQuery.getRestriction();
        assertThat(comparison.getRightHandOperand(), instanceOf(LiteralExpression.class));
        assertThat(((LiteralExpression)comparison.getRightHandOperand()).getLiteral(), equalTo(new BigDecimal("483.21")));
    }
}
