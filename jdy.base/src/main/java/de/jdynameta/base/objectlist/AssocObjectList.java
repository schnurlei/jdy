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
package de.jdynameta.base.objectlist;

import de.jdynameta.base.metainfo.AssociationInfo;
import de.jdynameta.base.value.ChangeableTypedValueObject;

/**
 * @author Rainer
 *
 * To change the template for this generated type comment go to
 * Window&gt;Preferences&gt;Java&gt;Code Generation&gt;Code and Comments
 * @param <TListType>
 */
@SuppressWarnings("serial")
public class AssocObjectList<TListType extends ChangeableTypedValueObject> extends DefaultObjectList<TListType> implements EditableObjectList<TListType>
{
    private final AssociationInfo assocInfo;
    private final TListType masterobject;

    /**
     *
     * @param anAssocInfo
     * @param aMasterobject
     */
    public AssocObjectList(AssociationInfo anAssocInfo, TListType aMasterobject)
    {
        super();
        this.assocInfo = anAssocInfo;
        this.masterobject = aMasterobject;

    }

    /**
     *
     * @param anObject
     */
    @Override
    public void addObject(TListType anObject)
    {
        this.getAllObjects().add(anObject);
        anObject.setValue(assocInfo.getMasterClassReference(), masterobject);
    }

    @Override
    public void removeObject(TListType anObject)
    {
        this.getAllObjects().remove(anObject);
        anObject.setValue(assocInfo.getMasterClassReference(), null);
    }

}
