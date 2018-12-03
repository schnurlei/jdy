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
package de.jdynameta.base.value.defaultimpl;

import de.jdynameta.base.metainfo.ClassInfo;
import de.jdynameta.base.objectlist.ObjectList;
import de.jdynameta.base.value.ChangeableTypedValueObject;

@SuppressWarnings("serial")
public class TypedHashedValueObject extends HashedValueObject implements ChangeableTypedValueObject
{
    private ClassInfo classInfo;

    public TypedHashedValueObject()
    {
        super();
    }

    public TypedHashedValueObject(ClassInfo aClassInfo)
    {
        super();
        this.classInfo = aClassInfo;
    }

    @Override
    public ClassInfo getClassInfo()
    {
        return classInfo;
    }

    public void setClassInfo(ClassInfo classInfo)
    {
        this.classInfo = classInfo;
    }

    @Override
    public Object getValue(String anExternlName)
    {
        assert (this.classInfo.getAttributeInfoForExternalName(anExternlName) != null);
        return (this.classInfo == null) ? null : getValue(this.classInfo.getAttributeInfoForExternalName(anExternlName));
    }

    @Override
    public void setValue(String anExternlName, Object aValue)
    {
        assert (this.classInfo.getAttributeInfoForExternalName(anExternlName) != null);
        setValue(this.classInfo.getAttributeInfoForExternalName(anExternlName), aValue);
    }

    @Override
    public void setValues(String anAssocName, ObjectList<? extends ChangeableTypedValueObject> aValue)
    {
        assert (this.classInfo.getAssoc(anAssocName) != null);
        setValue(this.classInfo.getAssoc(anAssocName), aValue);
    }

    @Override
    public ObjectList<? extends ChangeableTypedValueObject> getValues(String anAssocName)
    {
        assert (this.classInfo.getAssoc(anAssocName) != null);
        return getValue(this.classInfo.getAssoc(anAssocName));

    }

}
