// jdynameta,
// Copyright (c)2012 Rainer Schneider, Roggenburg.
// Distributed under Apache 2.0 license
// http://jdynameta.de

import {
    JdyAssociationModel, JdyAttributeInfo,
    JdyClassInfo,
    JdyObjectList,
    JdyObjectListImpl, JdyObjectReferenceInfo,
    JdyPersistentException, JdyPrimitiveAttributeInfo,
    JdyTypedValueObject
} from '@/js/jdy/jdy-base';

const CLASS_INTERNAL_NAME_TAG = '@classInternalName';
const NAMESPACE_TAG = '@namespace';
const PERSISTENCE_TAG = '@persistence';

const COMPACT_TYPE_TAG = '@t';
const COMPACT_PERSISTENCE_TAG = '@p';

export function jsonReaderGetVisitor (aAttrValue) {

    return {

        handleBoolean: function () {

            if (typeof aAttrValue !== 'boolean') {
                throw new JdyPersistentException('Wrong type boolean : ' + aAttrValue);
            }
            return aAttrValue;
        },

        handleDecimal: function () {
            if (typeof aAttrValue !== 'number') {
                throw new JdyPersistentException('Wrong type long : ' + aAttrValue);
            }
            return aAttrValue;
        },

        handleTimeStamp: function () {
            return new Date(aAttrValue);
        },

        handleFloat: function () {
            return aAttrValue;
        },

        handleLong: function () {

            if (typeof aAttrValue !== 'number') {
                throw new JdyPersistentException('Wrong type long : ' + aAttrValue);
            }
            return aAttrValue;
        },

        handleText: function () {
            return aAttrValue;
        },

        handleVarChar: function () {
            return aAttrValue;
        },

        handleBlob: function () {
            throw new JdyPersistentException('Blob Values not supported');
            // return aAttrValue;
        }
    };
};

export function jsonWriterValueGetVisitor (aAttrValue) {
    'use strict';

    return {

        handleBoolean: function () {

            if (typeof aAttrValue !== 'boolean') {
                throw new JdyPersistentException('Wrong type boolean : ' + aAttrValue);
            }
            return aAttrValue;
        },

        handleDecimal: function (aType) {
            if (typeof aAttrValue !== 'number') {
                throw new JdyPersistentException('Wrong type long : ' + aAttrValue);
            }
            return aAttrValue;
        },

        handleTimeStamp: function () {
            return aAttrValue.toISOString();
        },

        handleFloat: function () {
            return aAttrValue;
        },

        handleLong: function () {

            if (typeof aAttrValue !== 'number') {
                throw new JdyPersistentException('Wrong type long : ' + aAttrValue);
            }
            return aAttrValue;
        },

        handleText: function () {
            return aAttrValue;
        },

        handleVarChar: function () {
            return aAttrValue;
        },

        handleBlob: function () {
            throw new JdyPersistentException('Blob Values not supported');
        }
    };
};

export enum Operation {

    PROXY = 'PROXY',
    INSERT = 'INSERT',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    READ = 'READ'
}

export class JsonFileReader {

    public readObjectList (aJsonNode, aClassInfo) {
        'use strict';

        let resultList: any[] = [];
        let i;

        if (Array.isArray(aJsonNode)) {

            for (i = 0; i < aJsonNode.length; i++) {

                if (typeof aJsonNode[i] === 'object') {
                    resultList.push(this.createModelForJsonObj(aJsonNode[i], aClassInfo));
                } else {
                    throw new JdyPersistentException('Error parsing JSON. No JSONObject: ' + aJsonNode[i].toString());
                }
            }
        }
        return resultList;
    };

    private createModelForJsonObj (aJsonNode, aClassInfo) {
        'use strict';

        let concreteClass = this.createClassInfoFromMeta(aJsonNode, aClassInfo);
        let persistenceType = aJsonNode[PERSISTENCE_TAG];
        let result: JdyTypedValueObject;
        let attrValue;
        let isNew;
        let that = this;

        if (concreteClass != null) {

            result = new JdyTypedValueObject(concreteClass, null, false);
            concreteClass.forEachAttr(function (curAttrInfo: JdyAttributeInfo) {

                if (persistenceType !== Operation.PROXY || curAttrInfo.isKey()) {
                    attrValue = aJsonNode[curAttrInfo.getInternalName()];

                    if (attrValue === undefined) {
                        throw new JdyPersistentException('Missing value for type in attr value: ' + curAttrInfo.getInternalName());
                    } else {
                        if (attrValue !== null) {

                            if (curAttrInfo.isPrimitive()) {

                                let primAttrType = curAttrInfo as JdyPrimitiveAttributeInfo;
                                result[curAttrInfo.getInternalName()] = primAttrType.getType().handlePrimitiveKey(jsonReaderGetVisitor(attrValue));
                            } else {

                                if (typeof attrValue === 'object') {
                                    let refType = curAttrInfo as JdyObjectReferenceInfo;
                                    result[curAttrInfo.getInternalName()] = that.createModelForJsonObj(attrValue, refType.getReferencedClass());
                                } else {
                                    throw new JdyPersistentException('Wrong type for attr value (no object): ' + curAttrInfo.getInternalName());
                                }
                            }
                        } else {
                            result[curAttrInfo.getInternalName()] = null;
                        }
                    }
                }
            });
            if (persistenceType !== Operation.PROXY) {

                concreteClass.forEachAssoc(function (curAssoc) {

                    result.$assocs[curAssoc.getAssocName()] = that.createAssociationList(aJsonNode, result, curAssoc);
                });
            }

            return result;
        }
    };

    private createAssociationList (aMasterNode, aMasterObj, curAssoc): JdyObjectList {
        'use strict';

        let objList: JdyObjectList | [] | null = [];
        let i;
        let assocNode = aMasterNode[curAssoc.getAssocName()];

        if (assocNode === null) {
            objList = new JdyObjectListImpl(curAssoc);
        } else {
            objList = new JdyObjectListImpl(curAssoc);
            if (Array.isArray(assocNode)) {
                for (i = 0; i < assocNode.length; i++) {
                    if (typeof assocNode[i] === 'object') {
                        objList.add(this.createModelForJsonObj(assocNode[i], curAssoc.getDetailClass()));
                    } else {
                        throw new JdyPersistentException('Error parsing JSON. No JSONObject: ');
                    }
                }
            } else {
                throw new JdyPersistentException('Wrong type for assoc value (no array): ' + curAssoc.assocName);
            }
        }

        return objList;
    };

    private createClassInfoFromMeta (jsonObj, aClassInfo): JdyClassInfo | null {
        'use strict';

        let repoName = jsonObj[NAMESPACE_TAG];
        let classInternalName = jsonObj[CLASS_INTERNAL_NAME_TAG];
        return this.getConcreteClass(aClassInfo, repoName, classInternalName);
    };

    public getConcreteClass (aClassInfo, aRepoName, classInternalName): JdyClassInfo | null {
        'use strict';

        let concreteClass: JdyClassInfo | null = null;
        let i;
        let curClassInfo;

        if (aClassInfo.getInternalName() === classInternalName &&
            aClassInfo.getRepoName() === aRepoName) {
            concreteClass = aClassInfo;
        } else {
            for (i = 0; i < aClassInfo.getAllSubclasses().length; i++) {

                curClassInfo = aClassInfo.getAllSubclasses()[i];
                concreteClass = this.getConcreteClass(curClassInfo, aRepoName, classInternalName);
                if (concreteClass) {
                    break;
                }
            }
        }

        return concreteClass;
    };

};

export class JsonFileWriter {

    private writeStrategy = {
        isWriteAsProxy: function () {
            return true;
        }
    };

    public writeObjectList (aJsonNode: any[] | JdyObjectList, aPersistenceType, aAssocInfo) {
        'use strict';

        let resultList: any[] = [];
        if (Array.isArray(aJsonNode)) {

            resultList = this.writeObjectArray(aJsonNode, aPersistenceType, aAssocInfo);
        } else {
            aJsonNode.done(objects => {
                resultList = this.writeObjectArray(objects, aPersistenceType, aAssocInfo)
            });
        }
        return resultList;
    };

    private writeObjectArray (objects: any[], aPersistenceType, aAssocInfo) {
        'use strict';

        let resultList: any[] = [];
        let i;

        for (i = 0; i < objects.length; i++) {

            if (typeof objects[i] === 'object') {
                resultList.push(this.writeObjectToJson(objects[i], aPersistenceType));
            } else {
                throw new JdyPersistentException('Error parsing JSON. No JSONObject: ' + objects[i].toString());
            }
        }
        return resultList;
    };

    private writeObjectToJson (objToWrite, aPersistenceType) {
        'use strict';

        var jsonObject = this.createClassInfoNode(objToWrite, aPersistenceType, false);
        return jsonObject;
    };

    private createClassInfoNode (objToWrite, aPersistenceType, asProxy) {

        let jsonObject = {};
        let attrValue;
        let that = this;
        let isProxy;
        let refJsonNode;

        this.addMetaDataFields(jsonObject, objToWrite.$typeInfo, (asProxy) ? 'PROXY' : aPersistenceType);

        objToWrite.$typeInfo.forEachAttr(function (curAttrInfo) {

            if (!asProxy || curAttrInfo.isKey()) {
                attrValue = objToWrite[curAttrInfo.getInternalName()];

                if (attrValue === undefined) {
                    throw new JdyPersistentException('Missing value for type in attr value: ' + curAttrInfo.getInternalName());
                } else {
                    if (attrValue !== null) {

                        if (curAttrInfo.isPrimitive()) {

                            jsonObject[curAttrInfo.getInternalName()] = curAttrInfo.getType().handlePrimitiveKey(jsonWriterValueGetVisitor(attrValue));
                        } else {
                            isProxy = asProxy || that.writeStrategy.isWriteAsProxy();
                            refJsonNode = that.createClassInfoNode(attrValue, aPersistenceType, isProxy);
                            jsonObject[curAttrInfo.getInternalName()] = refJsonNode;
                        }
                    } else {
                        jsonObject[curAttrInfo.getInternalName()] = null;
                    }
                }
            }
        });

        objToWrite.$typeInfo.forEachAssoc(function (curAssoc) {
            if (!asProxy && !that.writeStrategy.isWriteAsProxy()) {
                jsonObject[curAssoc.getAssocName()] = that.writeObjectList(objToWrite.assocVals(curAssoc), aPersistenceType, curAssoc);
            }
        });

        return jsonObject;
    };

    private addMetaDataFields (jsonObject, aClassInfo, aPersistenceType) {
        'use strict';

        jsonObject[NAMESPACE_TAG] = aClassInfo.getRepoName();
        jsonObject[CLASS_INTERNAL_NAME_TAG] = aClassInfo.getInternalName();
        jsonObject[PERSISTENCE_TAG] = aPersistenceType;
    };

};

export class JsonCompactFileWriter {

    private writeStrategy = {
        isWriteAsProxy: function () {
            return false;
        }
    };

    private writeNullValues = false;
    private writeGenreatedAtr = false;
    private writePersistence = false;
    private name2Abbr: { [name: string]: string };

    public constructor (aName2Abbr: { [name: string]: string }) {

        this.name2Abbr = aName2Abbr;
    }

    public writeObjectList (aJsonNode, aPersistenceType, aAssocInfo) {
        'use strict';

        let resultList: any[] = [];
        let i;

        if (Array.isArray(aJsonNode)) {

            for (i = 0; i < aJsonNode.length; i++) {

                if (typeof aJsonNode[i] === 'object') {
                    resultList.push(this.writeObjectToJson(aJsonNode[i], aPersistenceType, this.createAssocClmnVisibility(aAssocInfo)));
                } else {
                    throw new JdyPersistentException('Error parsing JSON. No JSONObject: ' + aJsonNode[i].toString());
                }
            }
        } else if (aJsonNode instanceof JdyObjectListImpl) {
            let objList: JdyObjectListImpl = aJsonNode;
            objList.getObjects().forEach(curNode => {
                if (typeof curNode === 'object') {
                    resultList.push(this.writeObjectToJson(curNode, aPersistenceType, this.createAssocClmnVisibility(aAssocInfo)));
                } else {
                    throw new JdyPersistentException('Error parsing JSON. No JSONObject: ' +curNode.toString());
                }
            })
        }
        return resultList;
    };

    private writeObjectToJson (objToWrite, aPersistenceType, clmnVisibility) {
        'use strict';

        var jsonObject = this.createClassInfoNode(objToWrite, aPersistenceType, false, clmnVisibility);
        return jsonObject;
    };

    private createClassInfoNode (objToWrite: JdyTypedValueObject, aPersistenceType, asProxy, aClmnVisibility) {
        'use strict';

        let jsonObject = {};
        let attrValue;
        let that = this;
        let isProxy;
        let refJsonNode;
        let clmnVisib = aClmnVisibility;

        this.addMetaDataFields(jsonObject, objToWrite.$typeInfo, (asProxy) ? 'PROXY' : aPersistenceType);
        objToWrite.$typeInfo.forEachAttr(function (curAttrInfo) {

            if (!clmnVisib || clmnVisib.isAttributeVisible(curAttrInfo)) {

                if (!asProxy || curAttrInfo.isKey()) {
                    attrValue = objToWrite[curAttrInfo.getInternalName()];

                    if (attrValue === undefined) {
                        throw new JdyPersistentException('Missing value for type in attr value: ' + curAttrInfo.getInternalName());
                    } else {
                        if (attrValue !== null) {

                            if (curAttrInfo.isPrimitive()) {

                                if (!curAttrInfo.isGenerated() || that.writeGenreatedAtr) {
                                    let primAttrType = curAttrInfo as JdyPrimitiveAttributeInfo;
                                    jsonObject[that.nameForAttr(curAttrInfo)] = primAttrType.getType().handlePrimitiveKey(jsonWriterValueGetVisitor(attrValue));
                                }
                            } else {

                                isProxy = asProxy || that.writeStrategy.isWriteAsProxy();
                                refJsonNode = that.createClassInfoNode(attrValue, aPersistenceType, isProxy, null);
                                jsonObject[that.nameForAttr(curAttrInfo)] = refJsonNode;
                            }
                        } else {
                            if (that.writeNullValues) {
                                jsonObject[that.nameForAttr(curAttrInfo)] = null;
                            }
                        }
                    }
                }
            }
        });

        objToWrite.$typeInfo.forEachAssoc(function (curAssoc) {
            if (!asProxy && !that.writeStrategy.isWriteAsProxy()) {

                jsonObject[that.nameForAssoc(curAssoc)] = that.writeObjectList(objToWrite.assocVals(curAssoc), aPersistenceType, curAssoc);
            }
        });

        return jsonObject;
    };

    private addMetaDataFields (jsonObject, aClassInfo, aPersistenceType) {
        'use strict';

        jsonObject[COMPACT_TYPE_TAG] = aClassInfo.getShortName();

        if (this.writePersistence) {
            jsonObject[COMPACT_PERSISTENCE_TAG] = aPersistenceType;
        }
    };

    private nameForAssoc (anAssocInfo) {

        return (this.name2Abbr[anAssocInfo.getAssocName()])
            ? this.name2Abbr[anAssocInfo.getAssocName()]
            : anAssocInfo.getAssocName();
    };

    private nameForAttr (attrInfo) {

        return (this.name2Abbr[attrInfo.getInternalName()])
            ? this.name2Abbr[attrInfo.getInternalName()]
            : attrInfo.getInternalName();
    };

    private createAssocClmnVisibility (aAssocInfo) {

        return {

            isAttributeVisible: function (aAttrInfo) {

                return (!aAssocInfo) || (aAssocInfo.getMasterClassReference() !== aAttrInfo);
            }
        };
    };
};
