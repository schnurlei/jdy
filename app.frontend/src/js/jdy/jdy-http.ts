import { JdyAssociationModel, JdyPersistentException, JdyTypedValueObject } from '@/js/jdy/jdy-base';
import { convertAppRepositoryToRepository, createAppRepository, FilterCreator, META_REPO_NAME } from '@/js/jdy/jdy-meta';
import { JsonCompactFileWriter, JsonFileReader, JsonFileWriter, Operation } from '@/js/jdy/jdy-json';
import { testCreatePlantShopRepository } from '@/jdy-test';

export class JsonHttpObjectReader {

    private basepath;
    private jsonReader = new JsonFileReader();
    private writer = new JsonFileWriter();
    private filterCreator = new FilterCreator();
    private att2AbbrMap: { [name: string]: string };
    private jsonWriter;
    private plantRepository = testCreatePlantShopRepository();

    public constructor (aBasePath, aMetaRepoName) {

        this.basepath = aBasePath;
        this.att2AbbrMap = {}
        this.att2AbbrMap.repoName = 'rn';
        this.att2AbbrMap.className = 'cn';
        this.att2AbbrMap.expr = 'ex';
        this.att2AbbrMap.orSubExpr = 'ose';
        this.att2AbbrMap.andSubExpr = 'ase';
        this.att2AbbrMap.attrName = 'an';
        this.att2AbbrMap.operator = 'op';
        this.att2AbbrMap.isNotEqual = 'ne';
        this.att2AbbrMap.isAlsoEqual = 'ae';
        this.att2AbbrMap.longVal = 'lv';
        this.att2AbbrMap.textVal = 'tv';
        this.jsonWriter = new JsonCompactFileWriter(this.att2AbbrMap);

    }

    public loadDataForClassInfo (aClassInfo): Promise<any> {

        return this.loadDataFromServer(aClassInfo);
        // return this.loadDataFromFile(aClassInfo);
    }

    private loadDataFromFile (aClassInfo): Promise<any> {

        let myRequest = new Request('json/' + aClassInfo.internalName + '.json');
        return fetch(myRequest)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    // @ts-ignore
                    if (response.error) {
                        // @ts-ignore
                        throw new Error('Error reading data from server: ' + response.error);
                    } else {
                        throw new Error('Error reading data from server:');
                    }
                }
            }).then(data => {

                if (data && data.error) {
                    throw new Error('Error reading data from server:');
                } else {
                    let convertedData = this.jsonReader.readObjectList(data, aClassInfo);
                    return convertedData;
                }
            });
    }

    private loadDataFromServer (aClassInfo): Promise<any> {

        let myRequest = new Request('api/jdy/data/' + aClassInfo.internalName);
        return fetch(myRequest)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    // @ts-ignore
                    if (response.error) {
                        // @ts-ignore
                        throw new Error('Error reading data from server: ' + response.error);
                    } else {
                        throw new Error('Error reading data from server:');
                    }
                }
            }).then(data => {

                if (data && data.error) {
                    throw new Error('Error reading data from server:');
                } else {
                    let convertedData = this.jsonReader.readObjectList(data, aClassInfo);
                    return convertedData;
                }
            });
    }

    public loadMetadataFromDb (successFunct, failFunc) {

        this.loadMetadataFromServer(successFunct, failFunc);
        // successFunct(this.plantRepository);
    }

    private loadMetadataFromServer (successFunct, failFunc) {

        let deferredCall;
        let rep = createAppRepository();
        let appRep = rep.getClassInfo('AppRepository');

        deferredCall = this.createAjaxGetCall('api/jdy/meta');
        deferredCall.then(rtoData => {

            var resultObjects = this.jsonReader.readObjectList(rtoData, appRep);
            convertAppRepositoryToRepository(resultObjects[0], (metaRep) => {
                successFunct(metaRep);
            });
        }).catch(data => {
            if (failFunc) {
                failFunc(data);
            }
        });
    }

    public loadValuesFromDb (aFilter, successFunct, failFunc) {
        'use strict';

        let uri = this.createUriForClassInfo(aFilter.resultType, META_REPO_NAME, this.basepath);
        let deferredCall;
        let that = this;
        let appQuery = this.filterCreator.convertMetaFilter2AppFilter(aFilter);
        let expr;

        if (appQuery && appQuery.val('expr')) {
            expr = this.jsonWriter.writeObjectList([appQuery.val('expr')], Operation.INSERT);
            uri = uri + '?' + this.fixedEncodeURIComponent(JSON.stringify(expr));
        }

        deferredCall = this.createAjaxGetCall(uri);

        deferredCall.done(function (rtoData) {

            var resultObjects = that.jsonReader.readObjectList(rtoData, aFilter.resultType);
            successFunct(resultObjects);
        });
        deferredCall.error(function (data) {
            if (failFunc) {
                failFunc();
            }
        });

    };

    private fixedEncodeURIComponent (str) {
        return encodeURIComponent(str).replace(/[!'()]/g, escape).replace(/\*/g, '%2A');
    };

    private createAjaxGetCall (aUrl) {
        'use strict';

        var myRequest = new Request(aUrl);
        return fetch(myRequest)
            .then(response => response.json());

    };

    private createUriForClassInfo (aClassInfo, aMetaModelReponame, aBasePath) {
        'use strict';

        let reponame = aClassInfo.repoName;
        let repoPart = '@jdy';// pseudo repo for meta information
        let infoPath = (aBasePath === null) ? '' : aBasePath;

        if (reponame !== aMetaModelReponame) {
            repoPart = reponame;
        }
        // check whether path ends with /
        infoPath = (infoPath.charAt(infoPath.length - 1) === '/') ? infoPath : infoPath + '/';
        infoPath += repoPart + '/' + aClassInfo.getInternalName();

        return infoPath;
    };

};

export function parameterGetVisitor (aAttrValue) {

    return {

        handleBoolean: function (aType) {
            return aAttrValue.toString();
        },

        handleDecimal: function (aType) {
            return aAttrValue.toString();
        },

        handleTimeStamp: function (aType) {
            return aAttrValue.toISOString();
        },

        handleFloat: function (aType) {
            return aAttrValue.toString();
        },

        handleLong: function (aType) {
            return aAttrValue.toString();
        },

        handleText: function (aType) {
            return aAttrValue;
        },

        handleVarChar: function (aType) {
            return aAttrValue;
        },

        handleBlob: function (aType) {
            throw new JdyPersistentException('Blob Values not supported');
        }
    };
};

export function createParametersFor (aValueObj, aClassInfo, aPrefix): { name: string; value: string }[] {

    let nameValuePairs: { name: string; value: string }[] = [];
    let refObjParams;
    let curValue;

    aClassInfo.forEachAttr(curAttrInfo => {

        if (curAttrInfo.isKey()) {
            if (curAttrInfo.isPrimitive()) {

                curValue = curAttrInfo.getType().handlePrimitiveKey(parameterGetVisitor(aValueObj.val(curAttrInfo)));
                nameValuePairs.push({ name: aPrefix + curAttrInfo.getInternalName(), value: curValue });
            } else {

                if (typeof aValueObj.val(curAttrInfo) === 'object') {
                    refObjParams = createParametersFor(aValueObj.val(curAttrInfo),
                        curAttrInfo.getReferencedClass(),
                        aPrefix + curAttrInfo.getInternalName() + '.');
                    nameValuePairs = nameValuePairs.concat(refObjParams);
                } else {
                    throw new JdyPersistentException('Wrong type for attr value (no object): ' + curAttrInfo.getInternalName());
                }
            }
        }
    });

    return nameValuePairs;
};

class JsonHttpObjectWriter {

    private basepath;
    private reader = new JsonFileReader();
    private writer = new JsonFileWriter();

    public constructor (aBasePath, aMetaModelRepoName) {

        this.basepath = aBasePath;
    }

    public deleteObjectInDb (aObjToDelete, aClassInfo, successFunct, failFunc) {
        'use strict';

        let uri = this.createUriForClassInfo(aClassInfo, META_REPO_NAME, this.basepath);
        let params = createParametersFor(aObjToDelete, aClassInfo, '');

        // uri = uri + '?' + $.param(params);
        this.sendJsonDeleteRequest(uri, successFunct, failFunc);
    };

    public insertObjectInDb (aObjToInsert, successFunct, failFunc) {
        'use strict';

        let singleElementList: any[] = [];
        let result;
        let content;
        let that = this;

        singleElementList.push(aObjToInsert);

        content = this.writer.writeObjectList(singleElementList, 'INSERT', null);

        function handleResult (rtoData) {

            result = that.reader.readObjectList(rtoData, aObjToInsert.$typeInfo);
            successFunct(result[0]);

        }

        this.sendJsonPostRequest(this.createUriForClassInfo(aObjToInsert.$typeInfo, META_REPO_NAME, this.basepath),
            JSON.stringify(content),
            handleResult,
            failFunc);
    };

    public updateObjectInDb (aObjToUpdate, successFunct, failFunc) {
        'use strict';

        let singleElementList: any[] = [];
        let result;
        let content;
        let that = this;

        singleElementList.push(aObjToUpdate);

        content = this.writer.writeObjectList(singleElementList, 'UPDATE', null);

        function handleResult (rtoData) {

            result = that.reader.readObjectList(rtoData, aObjToUpdate.$typeInfo);
            successFunct(result[0]);

        }

        this.sendJsonPutRequest(this.createUriForClassInfo(aObjToUpdate.$typeInfo, META_REPO_NAME, this.basepath),
            JSON.stringify(content),
            handleResult,
            failFunc);
    };

    private fixedEncodeURIComponent (str) {
        return encodeURIComponent(str).replace(/[!'()]/g, escape).replace(/\*/g, '%2A');
    };

    private sendJsonPostRequest (uri, content, successFunct, failFunc) {

        var deferredCall = this.createAjaxPostCall(uri, content);

        deferredCall.then(function (rtoData) {
            successFunct(rtoData);
        });
        deferredCall.catch(function (data) {
            if (failFunc) {
                failFunc(data);
            }
        });
    };

    private sendJsonPutRequest (uri, content, successFunct, failFunc) {

        var deferredCall = this.createAjaxPutCall(uri, content);

        deferredCall.then(function (rtoData) {
            successFunct(rtoData);
        });
        deferredCall.catch(function (data) {
            if (failFunc) {
                failFunc(data);
            }
        });
    };

    private sendJsonDeleteRequest (uri, successFunct, failFunc) {

        var deferredCall = this.createAjaxDeleteCall(uri);

        deferredCall.then(function (rtoData) {
            successFunct(rtoData);
        }).catch(failFunc());
    };

    private createAjaxDeleteCall (aUrl) {

        return fetch(aUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    };

    private createAjaxPostCall (aUrl, content) {

        return fetch(aUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: content
        });
    };

    private createAjaxPutCall (aUrl, content) {

        return fetch(aUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: content
        });
    };

    private createUriForClassInfo (aClassInfo, aMetaModelReponame, aBasePath) {

        let reponame = aClassInfo.repoName;
        let repoPart = '@jdy';// pseudo repo for meta information
        let infoPath = (aBasePath === null) ? '' : aBasePath;

        if (reponame !== aMetaModelReponame) {
            repoPart = reponame;
        }
        // check whether path ends with /
        infoPath = (infoPath.charAt(infoPath.length - 1) === '/') ? infoPath : infoPath + '/';
        infoPath += repoPart + '/' + aClassInfo.getInternalName();

        return infoPath;
    };

};

class JsonHttpPersistentService {

    private reader;
    private writer;

    public constructor (aBasePath, aMetaRepoName) {

        this.reader = new JsonHttpObjectReader(aBasePath, null);
        this.writer = new JsonHttpObjectWriter(aBasePath, null);

    }

    public loadValuesFromDb (aFilter, successFunct, failFunc) {

        this.reader.loadValuesFromDb(aFilter, successFunct, failFunc);
    };

    public deleteObjectInDb (aObjToDelete, aClassInfo, successFunct, failFunc) {

        this.writer.deleteObjectInDb(aObjToDelete, aClassInfo, successFunct, failFunc);
    };

    public insertObjectInDb (aObjToInsert, successFunct, failFunc) {

        this.writer.insertObjectInDb(aObjToInsert, successFunct, failFunc);
    };

    public updateObjectInDb (aObjToUpdate, successFunct, failFunc) {

        this.writer.updateObjectInDb(aObjToUpdate, successFunct, failFunc);
    };

    public executeWorkflowAction (actionName, aObjToWorkOn, successFunct, failFunc) {
        this.writer.executeWorkflowAction(actionName, aObjToWorkOn, successFunct, failFunc);

    };

    public createNewObject (aTypeInfo) {
        return new JdyTypedValueObject(aTypeInfo, null, false);
    };

};
