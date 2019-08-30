package de.jdynameta.persistence.manager;

import de.jdynameta.base.metainfo.*;
import de.jdynameta.base.metainfo.filter.defaultimpl.FilterUtil;
import de.jdynameta.base.objectlist.ObjectList;
import de.jdynameta.base.value.JdyPersistentException;
import de.jdynameta.base.value.TypedValueObject;
import de.jdynameta.base.value.ValueObject;
import de.jdynameta.base.value.defaultimpl.TypedHashedWrappedValueObject;

public class ValueObjectHandler {

    private TypedHashedWrappedValueObject<TypedValueObject> resolveObjectReferences(final TypedValueObject typedValueObject, ClassInfo aClassInfo, final PersistentObjectManager<? extends ValueObject, ? extends TypedValueObject> aMetaPersManager) throws JdyPersistentException
    {
        final TypedHashedWrappedValueObject<TypedValueObject> wrapper = new TypedHashedWrappedValueObject<>(aClassInfo, typedValueObject);
        for (AttributeInfo attribute : aClassInfo.getAttributeInfoIterator())
        {
            attribute.handleAttribute(new AttributeHandler()
            {

                @Override
                public void handlePrimitiveAttribute(PrimitiveAttributeInfo aInfo, Object objToHandle) throws JdyPersistentException
                {
                    // Ignorem only replace references
                }

                @Override
                public void handleObjectReference(ObjectReferenceAttributeInfo aInfo, ValueObject objToHandle)
                        throws JdyPersistentException
                {
                    ValueObject referencedObj = (ValueObject) typedValueObject.getValue(aInfo);
                    if (referencedObj != null)
                    {
                        ObjectList<? extends TypedValueObject> resolvedObj = aMetaPersManager.loadObjectsFromDb(FilterUtil.createSearchEqualObjectFilter(aInfo.getReferencedClass(), referencedObj));
                        wrapper.setValue(aInfo, resolvedObj.get(0));
                    }
                }

            }, typedValueObject);

        }

        return wrapper;
    }
}
