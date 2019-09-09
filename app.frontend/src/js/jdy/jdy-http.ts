import {
    JdyAssociationModel,
    JdyClassInfo,
    JdyClassInfoQuery,
    JdyPersistentException,
    JdyTypedValueObject
} from '@/js/jdy/jdy-base';
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
    private readLocal;

    public constructor (aBasePath, aMetaRepoName, readLocalFlag) {

        this.readLocal = readLocalFlag;
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

    public loadDataForClassInfo (aClassInfo: JdyClassInfo): Promise<any> {

        if (this.readLocal) {
            return this.loadDataFromFile(aClassInfo);
        } else {
            return this.loadDataFromServer(aClassInfo);
        }
    }

    private loadDataFromFile (aClassInfo: JdyClassInfo): Promise<any> {

        let myRequest = new Request('json/' + aClassInfo.getInternalName() + '.json');
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

    private loadDataFromServer (aClassInfo: JdyClassInfo): Promise<any> {

        let myRequest = new Request(this.createUriForClassInfo(aClassInfo));
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

        if (this.readLocal) {
            successFunct(this.plantRepository);
        } else {
            this.loadMetadataFromServer(successFunct, failFunc);
        }
    }

    private loadMetadataFromServer (successFunct, failFunc) {

        let deferredCall: Promise<any>;
        let rep = createAppRepository();
        let appRep = rep.getClassInfo('AppRepository');

        deferredCall = this.createAjaxGetJsonCall('api/jdy/meta');
        deferredCall.then(jsonData => {

            var resultObjects = this.jsonReader.readObjectList(jsonData, appRep);
            convertAppRepositoryToRepository(resultObjects[0], (metaRep) => {
                successFunct(metaRep);
            });
        }).catch(data => {
            if (failFunc) {
                failFunc(data);
            }
        });
    }

    public loadValuesFromDb (aFilter: JdyClassInfoQuery): Promise<any> {
        'use strict';

        let uri = this.createUriForClassInfo(aFilter.getResultInfo());
        let appQuery = this.filterCreator.convertMetaFilter2AppFilter(aFilter);
        let expr;

        if (appQuery && appQuery.val('expr')) {
            expr = this.jsonWriter.writeObjectList([appQuery], Operation.INSERT);
            uri = uri + '?' + 'filter=' + this.fixedEncodeURIComponent(JSON.stringify(expr));
        }

        return this.createAjaxGetJsonCall(uri).then(jsonData => {

            if (jsonData && jsonData.error) {
                throw new Error('Error reading data from server:');
            } else {
                let convertedData = this.jsonReader.readObjectList(jsonData, aFilter.getResultInfo());
                return convertedData;
            }
        });
    };

    private fixedEncodeURIComponent (str) {
        return encodeURIComponent(str).replace(/[!'()]/g, escape).replace(/\*/g, '%2A');
    };

    private createAjaxGetJsonCall (aUrl): Promise<any> {

        let myRequest = new Request(aUrl);

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
            })
    };

    private createUriForClassInfo (aClassInfo: JdyClassInfo) {

        return 'api/jdy/data/' + aClassInfo.getInternalName();
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

export function createParametersFor (aValueObj, aPrefix, searchParams: URLSearchParams, parentIsKey: boolean): void {

    let refObjParams;
    let curValue;

    aValueObj.$typeInfo.forEachAttr(curAttrInfo => {

        if (curAttrInfo.isKey() || parentIsKey) {
            if (curAttrInfo.isPrimitive()) {

                curValue = curAttrInfo.getType().handlePrimitiveKey(parameterGetVisitor(aValueObj.val(curAttrInfo)));
                searchParams.set(aPrefix + curAttrInfo.getInternalName(),  curValue );
            } else {

                if (typeof aValueObj.val(curAttrInfo) === 'object') {
                    refObjParams = createParametersFor(aValueObj.val(curAttrInfo),
                        aPrefix + curAttrInfo.getInternalName() + '.', searchParams, true);
                } else {
                    throw new JdyPersistentException('Wrong type for attr value (no object): ' + curAttrInfo.getInternalName());
                }
            }
        }
    });
}

export class JsonHttpObjectWriter {

    private basepath;
    private reader = new JsonFileReader();
    private writer = new JsonFileWriter();

    public constructor (aBasePath) {

        this.basepath = aBasePath;
    }

    public deleteObjectInDb (aObjToDelete, successFunct, failFunc) {

        let uri = this.createUriForClassInfo(aObjToDelete.$typeInfo);
        const searchParams = new URLSearchParams();
        createParametersFor(aObjToDelete, '', searchParams, false);

        uri = uri + '?' + searchParams.toString();
        this.createAjaxDeleteCall(uri)
            .then(response => {
                successFunct();
            }).catch(data =>{
                if (failFunc) {
                    failFunc(data);
                }
        });
    };

    private createAjaxDeleteCall (aUrl) {

        return fetch(aUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                return response.text();
            } else {
                if (response.json) {
                    return response.json().then(responseJson => {throw new Error('Error reading data from server: ' + responseJson.message)});
                    // @ts-ignore
                } else if (response.error) {
                    // @ts-ignore
                    throw new Error('Error reading data from server: ' + response.error);
                } else {
                    throw new Error('Error reading data from server:');
                }
            }
        });
    };


    public insertObjectInDb (aObjToInsert, successFunct, failFunc) {

        let singleElementList: any[] = [];
        let content;

        singleElementList.push(aObjToInsert);
        content = this.writer.writeObjectList(singleElementList, 'INSERT', null);

        this.createAjaxPostCall(this.createUriForClassInfo(aObjToInsert.$typeInfo), JSON.stringify(content))
            .then(response=>{
                let result = this.reader.readObjectList(response, aObjToInsert.$typeInfo);
                successFunct(result[0]);
            }).catch(data =>{
                if (failFunc) {
                    failFunc(data);
                }
            });
    };

    private createAjaxPostCall (aUrl, content): Promise<any>  {

        return fetch(aUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: content
        }).then(response => {
            if (response.ok) {
                return response.json();
            } else {
                if (response.json) {
                    return response.json().then(responseJson => {throw new Error('Error reading data from server: ' + responseJson.message)});
                // @ts-ignore
                } else if (response.error) {
                    // @ts-ignore
                    throw new Error('Error reading data from server: ' + response.error);
                } else {
                    throw new Error('Error reading data from server:');
                }
            }
        });
    };

    public updateObjectInDb (aObjToUpdate, successFunct, failFunc) {

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

        this.sendJsonPutRequest(this.createUriForClassInfo(aObjToUpdate.$typeInfo),
            JSON.stringify(content),
            handleResult,
            failFunc);
    };

    private fixedEncodeURIComponent (str) {
        return encodeURIComponent(str).replace(/[!'()]/g, escape).replace(/\*/g, '%2A');
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



    private createAjaxPutCall (aUrl, content) {

        return fetch(aUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: content
        });
    };

    private createUriForClassInfo (aClassInfo: JdyClassInfo) {

        return 'api/jdy/data/' + aClassInfo.getInternalName();
    };


};

class JsonHttpPersistentService {

    private reader;
    private writer;

    public constructor (aBasePath, aMetaRepoName, readLocalFlag) {

        this.reader = new JsonHttpObjectReader(aBasePath, null, readLocalFlag);
        this.writer = new JsonHttpObjectWriter(aBasePath);

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
