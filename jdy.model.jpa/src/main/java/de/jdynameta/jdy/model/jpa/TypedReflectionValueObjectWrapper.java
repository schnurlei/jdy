/**
 *
 * Copyright 2011 (C) Rainer Schneider,Roggenburg <schnurlei@googlemail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
package de.jdynameta.jdy.model.jpa;

import de.jdynameta.base.metainfo.*;
import de.jdynameta.base.metainfo.primitive.LongType;
import de.jdynameta.base.metainfo.primitive.TextType;
import de.jdynameta.base.objectlist.ChangeableObjectList;
import de.jdynameta.base.objectlist.ObjectList;
import de.jdynameta.base.value.JdyPersistentException;
import de.jdynameta.base.value.TypedValueObject;
import de.jdynameta.base.value.ValueObject;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.Collection;
import java.util.Optional;

/**
 *
 * @author Rainer Schneider
 *
 */
public class TypedReflectionValueObjectWrapper implements TypedValueObject
{
    private final Object wrappedObject;
    private ClassInfo classInfo;

    /**
     *
     * @param aObject
     */
    public TypedReflectionValueObjectWrapper(Object aObject, ClassInfo aClassInfo)
    {
        super();
        assert (aObject != null);
        wrappedObject = aObject;
        this.classInfo = aClassInfo;
    }

    @Override
    public ClassInfo getClassInfo() {
        return this.classInfo;
    }

    public Object getWrappedObject()
    {
        return wrappedObject;
    }

    /**
     * @see de.jdynameta.base.value.ValueModel#getValue(AttributeInfo)
     */
    @Override
    public Object getValue(AttributeInfo aInfo)
    {
        try
        {
            Object result = null;

            if (wrappedObject != null)
            {
                if (aInfo instanceof PrimitiveAttributeInfo)
                {
                    Class<? extends Object> me = wrappedObject.getClass();
                    Method getter = me.getMethod("get" + stringWithFirstLetterUppercase(aInfo.getInternalName()), (Class[]) null);
                    result = getter.invoke(wrappedObject, (Object[]) null);
                } else
                {
                    Class<? extends Object> me = wrappedObject.getClass();
                    Method getter = me.getMethod("get" + stringWithFirstLetterUppercase(aInfo.getInternalName()), (Class[]) null);
                    result = getter.invoke(wrappedObject, (Object[]) null);

                    if (!(result instanceof ValueObject) && result != null)
                    {
                        result = new TypedReflectionValueObjectWrapper(result, ((ObjectReferenceAttributeInfo)aInfo).getReferencedClass());
                    }
                }
            }

            return result;
        } catch (NoSuchMethodException | SecurityException | IllegalAccessException | IllegalArgumentException | InvocationTargetException e)
        {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @param aInfo
     * @return
     * @see de.jdynameta.base.value.ValueModel#getValue(AttributeInfo)
     */
    public Collection<Object> getWrappedCollFor(AssociationInfo aInfo)
    {
        try
        {
            ChangeableObjectList<ValueObject> resultColl = new ChangeableObjectList<>();
            Class<? extends Object> me = wrappedObject.getClass();
            Method getter = me.getMethod("get" + stringWithFirstLetterUppercase(aInfo.getDetailClass().getInternalName()) + "Coll", (Class[]) null);
            Collection<Object> assocColl = (Collection<Object>) getter.invoke(wrappedObject, (Object[]) null);
            return assocColl;

        } catch (NoSuchMethodException | SecurityException | IllegalAccessException | IllegalArgumentException | InvocationTargetException e)
        {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @param aInfo
     * @param newColl
     * @see de.jdynameta.base.value.ValueModel#getValue(AttributeInfo)
     */
    public void setWrappedCollFor(AssociationInfo aInfo, Collection<Object> newColl)
    {
        try
        {
            ChangeableObjectList<ValueObject> resultColl = new ChangeableObjectList<>();
            Class<? extends Object> me = wrappedObject.getClass();

            Method setter = null;
            Method[] allMethods = me.getDeclaredMethods();
            for (int i = 0; i < allMethods.length && setter == null; i++)
            {
                if (allMethods[i].getName().equals("set" + stringWithFirstLetterUppercase(aInfo.getDetailClass().getInternalName()) + "Coll")
                        && allMethods[i].getParameterTypes().length == 1)
                {
                    setter = allMethods[i];
                }
            }

            setter.invoke(wrappedObject, new Object[]
            {
                newColl
            });

        } catch (SecurityException | IllegalAccessException | IllegalArgumentException | InvocationTargetException e)
        {
        }
    }

    /**
     * @see de.jdynameta.base.value.ValueModel#getValue(AttributeInfo)
     */
    @Override
    public ObjectList<? extends ValueObject> getValue(AssociationInfo aInfo)
    {
        try
        {
            ChangeableObjectList<ValueObject> resultColl = new ChangeableObjectList<>();
            Class<? extends Object> me = wrappedObject.getClass();
            Method getter = me.getMethod("get" + stringWithFirstLetterUppercase(aInfo.getDetailClass().getInternalName()) + "Coll", (Class[]) null);
            Collection<Object> assocColl = (Collection<Object>) getter.invoke(wrappedObject, (Object[]) null);

            for (Object object : assocColl)
            {
                resultColl.addObject(new TypedReflectionValueObjectWrapper(object, aInfo.getDetailClass()));

            }

            return resultColl;

        } catch (NoSuchMethodException | SecurityException | IllegalAccessException | IllegalArgumentException | InvocationTargetException e)
        {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * @param aInfo
     * @param value
     * Object)
     */
    public void setValue(AttributeInfo aInfo, Object value) throws JdyPersistentException
    {
        try
        {
            Class<? extends Object> targetObjectClass = wrappedObject.getClass();
            Optional<Method> setter = findMethod(targetObjectClass, aInfo);
            if(setter.isPresent()) {

                final Object convertedValue;
                if (value == null) {
                    convertedValue = value;
                }  else if (aInfo instanceof PrimitiveAttributeInfo) {
                    convertedValue = this.convertValue((PrimitiveAttributeInfo)aInfo, value, setter.get());
                } else {
                    convertedValue = value;
                }
                setter.get().invoke(this.wrappedObject,convertedValue);
            } else {
                throw new JdyPersistentException("Setter not found for " + aInfo.getInternalName());
            }
        } catch ( IllegalAccessException | InvocationTargetException excp)
        {
            throw new JdyPersistentException(excp);
        }
    }

    private Optional<Method> findMethod(Class<? extends Object> javaClass, AttributeInfo aInfo) {

        final String methodName = "set" + stringWithFirstLetterUppercase(aInfo.getInternalName());
        return Arrays.stream(javaClass.getMethods())
                .filter(method -> method.getName().equals(methodName)).findFirst();
    }

    private Object convertValue (final PrimitiveAttributeInfo aInfo, final Object givenValue, Method setter) throws JdyPersistentException {

        if(aInfo.getType() instanceof TextType) {

            return ( ((TextType) aInfo.getType()).hasDomainValues() && givenValue != null)
                    ? this.getEnumValue(aInfo, givenValue, setter )
                    : givenValue;
        } else if(aInfo.getType() instanceof LongType){
            return this.convertLongValue(aInfo, givenValue, setter);
        } else {
            return givenValue;
        }

    }

    private Object convertLongValue(PrimitiveAttributeInfo aInfo, Object value, Method setter) throws JdyPersistentException {

        if (setter.getParameterTypes().length != 1) {
            throw new JdyPersistentException("Wrong count of parameters in setter " + setter.getName());
        }

        if (!(value instanceof  Number)) {
            throw new JdyPersistentException("Long type is no Number value " + setter.getName());
        }

        if (setter.getParameterTypes()[0] == Long.class) {
            return ((Number) value).longValue();
        } else if (setter.getParameterTypes()[0] == Integer.class) {
            return ((Number) value).intValue();
        } else if (setter.getParameterTypes()[0] == Short.class) {
            return ((Number) value).shortValue();
        } else {
            throw new JdyPersistentException("Type not supported " + setter.getName());
        }
    }

    private Object getEnumValue(PrimitiveAttributeInfo aInfo, Object value, Method setter) throws JdyPersistentException {

        if (setter.getParameterTypes().length != 1) {
            throw new JdyPersistentException("Wrong count of parameters in setter " + setter.getName());
        }

        if (!(value instanceof  String)) {
            throw new JdyPersistentException("Enum type is no String value " + setter.getName());
        }

        if (setter.getParameterTypes()[0].isEnum()) {
            return Enum.valueOf(((Class<Enum>)setter.getParameterTypes()[0]),(String) value);
        } else {
            throw new JdyPersistentException("Setter should have an enum type parameter " + setter.getName());
        }
    }


    public String stringWithFirstLetterUppercase(String textToAppend)
    {

        return "" + Character.toUpperCase(textToAppend.charAt(0)) + textToAppend.substring(1);
    }

    /* (non-Javadoc)
     * @see de.comafra.model.value.ValueObject#hasValueFor(de.comafra.model.metainfo.AttributeInfo)
     */
    @Override
    public boolean hasValueFor(AttributeInfo aInfo)
    {
        // TODO Auto-generated method stub
        return false;
    }

    /* (non-Javadoc)
     * @see de.comafra.model.value.ValueObject#hasValueFor(de.comafra.model.metainfo.AssociationInfo)
     */
    @Override
    public boolean hasValueFor(AssociationInfo aInfo)
    {
        // TODO Auto-generated method stub
        return false;
    }

    @Override
    public boolean equals(Object obj)
    {
        return (obj != null && obj instanceof TypedReflectionValueObjectWrapper)
                ? ((TypedReflectionValueObjectWrapper) obj).getWrappedObject().equals(this.getWrappedObject())
                : obj == this;
    }

    @Override
    public int hashCode()
    {
        return this.getWrappedObject().hashCode();
    }


}
