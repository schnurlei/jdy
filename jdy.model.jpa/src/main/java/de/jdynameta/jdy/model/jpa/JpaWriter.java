package de.jdynameta.jdy.model.jpa;

import de.jdynameta.base.metainfo.AttributeHandler;
import de.jdynameta.base.metainfo.ObjectReferenceAttributeInfo;
import de.jdynameta.base.metainfo.PrimitiveAttributeInfo;
import de.jdynameta.base.value.JdyPersistentException;
import de.jdynameta.base.value.ValueObject;
import de.jdynameta.persistence.state.ApplicationObj;

import javax.persistence.EntityManager;
import javax.persistence.metamodel.EntityType;

public class JpaWriter {


    public ApplicationObj insertInDb(final ApplicationObj objToInsert, EntityType<?> entityType, EntityManager entityManager) throws JdyPersistentException {

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
        } catch (InstantiationException | IllegalAccessException ex) {
            throw new JdyPersistentException(ex);
        }

        return null;
    }

}
