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
package de.jdynameta.base.value;

import de.jdynameta.base.metainfo.AssociationInfo;
import de.jdynameta.base.metainfo.AttributeInfo;
import de.jdynameta.base.objectlist.ObjectList;

public interface TypedValueObject extends ValueObject, TypedClassInfoObject {

    default Object getAttrValue(String attributeName) throws JdyPersistentException {

        AttributeInfo attributeInfo = (getClassInfo() != null) ? getClassInfo().getAttributeInfoForExternalName(attributeName) : null;
        if (attributeInfo != null) {
            return this.getValue(attributeInfo);
        } else {
            throw new JdyPersistentException("Invalid Attribute: " + attributeName);
        }

    }

    default Object getAttrValue(Enum attributeName) throws JdyPersistentException {
        return this.getAttrValue(attributeName.name());
    }

    default ObjectList getAssocValues(String assocName) throws JdyPersistentException {

        AssociationInfo assocInfo = (getClassInfo() != null) ? getClassInfo().getAssoc(assocName) : null;
        if (assocInfo != null) {
            return this.getValue(assocInfo);
        } else {
            throw new JdyPersistentException("Invalid Association " + assocName);
        }
    }

    default ObjectList getAssocValues(Enum assocName) throws JdyPersistentException {
        return this.getAssocValues(assocName.name());
    }
}
