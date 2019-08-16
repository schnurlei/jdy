import {
    convertAppRepositoryToRepository,
    createAppRepository,
    createFilterRepository,
    FilterCreator
} from '@/js/jdy/jdy-meta';
import { JsonCompactFileWriter, JsonFileReader, Operation } from '@/js/jdy/jdy-json';
import {JdyClassInfo, JdyQueryCreator, JdyTypedValueObject} from '@/js/jdy/jdy-base';
import { testCreatePlantShopRepository } from '@/jdy-test';

test(' jdymeta AppRepository creation', function () {

    let rep = createAppRepository();
    let appRep = rep.getClassInfo('AppRepository');
    if (appRep !== null) {
        expect(appRep.getInternalName()).toBe('AppRepository'); //  'Class AppRepository exists'
    }

});

test(' jdymeta.getConcreteClass', function () {

    let rep = createAppRepository();
    let appAttributes = rep.getClassInfo('AppAttribute');
    let jsonReader = new JsonFileReader();
    let concreteClass;

    concreteClass = jsonReader.getConcreteClass(appAttributes, 'ApplicationRepository', 'AppLongType');

    expect(concreteClass.internalName).toBe('AppLongType'); // 'Class name exits'
    expect(concreteClass.repoName).toBe('ApplicationRepository'); // 'namespace exists'

});

test(' jdymeta AppRepository read data', function () {

    'use strict';
    let rep = createAppRepository();
    let appRep = rep.getClassInfo('AppRepository');
    let jsonReader = new JsonFileReader();
    let readedList = jsonReader.readObjectList(testData(), appRep);
    let expectedResult: JdyTypedValueObject[] = testResult();

    expect(readedList[0].applicationName).toBe(expectedResult[0]['applicationName']);

});

test(' jdymeta convertAppRepositoryToRepository', function () {

    'use strict';
    let rep = createAppRepository();
    let appRep = rep.getClassInfo('AppRepository');
    let jsonReader = new JsonFileReader();
    let readedList = jsonReader.readObjectList(testData(), appRep);

    convertAppRepositoryToRepository(readedList[0], function (newRepository) {
        expect(readedList[0].applicationName).toBe(newRepository.repoName);
    });

});


test(' jdymeta transform filter to app filter object ', function () {

    let appRep = createFilterRepository().getClassInfo('AppQuery');
    let plantType: JdyClassInfo | null = testCreatePlantShopRepository().getClassInfo('Plant');

    // @ts-ignore
    expect(appRep.getRepoName()).toBe('FilterRepository'); // 'FilterRepository exists
    // @ts-ignore
    let query = new JdyQueryCreator(plantType)
        .or()
            .equal('BotanicName', 'Iris')
            .and()
                .greater('HeigthInCm', 30)
                .less('HeigthInCm', 100)
            .end()
        .end().query();

    let appQuery = new FilterCreator().convertMetaFilter2AppFilter(query);

    let jsonWriter = new JsonCompactFileWriter(getDefaultFilterNameMapping());
    let resultList = jsonWriter.writeObjectList([appQuery], Operation.INSERT, null);
    let jsonString = JSON.stringify(resultList);
    console.log(jsonString);
});

test(' convert 1 operator filter to json ', function () {

    let plantType: JdyClassInfo | null = testCreatePlantShopRepository().getClassInfo('Plant');

    // @ts-ignore
    let query = new JdyQueryCreator(plantType)
        .greater('HeigthInCm', 30)
        .query();

    let appQuery = new FilterCreator().convertMetaFilter2AppFilter(query);
    let jsonWriter = new JsonCompactFileWriter(getDefaultFilterNameMapping());
    let resultList = jsonWriter.writeObjectList([appQuery], Operation.INSERT, null);
    let jsonString = JSON.stringify(resultList);
    console.log('jsonString');
    expect(jsonString).toBe('[{"@t":"FQM","rn":"PlantShop","cn":"Plant","ex":{"@t":"OEX","an":"HeigthInCm","op":{"@t":"FPG","ae":false},"lv":30}}]');
});

test(' convert and expr + 1 operator filter to json ', function () {

    let plantType: JdyClassInfo | null = testCreatePlantShopRepository().getClassInfo('Plant');

    // @ts-ignore
    let query = new JdyQueryCreator(plantType)
        .and()
            .greater('HeigthInCm', 30)
        .end()
        .query();

    let appQuery = new FilterCreator().convertMetaFilter2AppFilter(query);
    let jsonWriter = new JsonCompactFileWriter(getDefaultFilterNameMapping());
    let resultList = jsonWriter.writeObjectList([appQuery], Operation.INSERT, null);
    let jsonString = JSON.stringify(resultList);
    console.log(jsonString);
    expect(jsonString).toBe('[{"@t":"FQM","rn":"PlantShop","cn":"Plant","ex":{"@t":"FEA","ase":[{"@t":"OEX","an":"HeigthInCm","op":{"@t":"FPG","ae":false},"lv":30}]}}]');
});


function getDefaultFilterNameMapping (): { [name: string]: string } {

    let att2AbbrMap: { [name: string]: string } = {};

    att2AbbrMap.repoName = 'rn';
    att2AbbrMap.className = 'cn';
    att2AbbrMap.expr = 'ex';
    att2AbbrMap.orSubExpr = 'ose';
    att2AbbrMap.andSubExpr = 'ase';
    att2AbbrMap.attrName = 'an';
    att2AbbrMap.operator = 'op';
    att2AbbrMap.isNotEqual = 'ne';
    att2AbbrMap.isAlsoEqual = 'ae';
    att2AbbrMap.longVal = 'lv';
    att2AbbrMap.textVal = 'tv';

    return att2AbbrMap;
}

function testData () {

    return [{
        '@namespace': 'ApplicationRepository',
        '@classInternalName': 'AppRepository',
        '@persistence': 'READ',
        'Name': 'Plants sfs',
        'applicationName': 'Plants_sfs',
        'appVersion': 1,
        'closed': true,
        'Classes': [{
            '@namespace': 'ApplicationRepository',
            '@classInternalName': 'AppClassInfo',
            '@persistence': 'READ',
            'Name': 'Plant Family',
            'InternalName': 'Plant_Family',
            'NameSpace': null,
            'isAbstract': false,
            'beforeSaveScript': null,
            'Superclass': null,
            'Repository': {
                '@namespace': 'ApplicationRepository',
                '@classInternalName': 'AppRepository',
                '@persistence': 'PROXY',
                'applicationName': 'Plants_sfs'
            },
            'Attributes': [],
            'Associations': [],
            'Subclasses': []
        }, {
            '@namespace': 'ApplicationRepository',
            '@classInternalName': 'AppClassInfo',
            '@persistence': 'READ',
            'Name': 'Plant Test',
            'NameSpace': null,
            'InternalName': 'Plant_Test',
            'isAbstract': false,
            'beforeSaveScript': 'delegate.first = second + double1',
            'Superclass': null,
            'Repository': {
                '@namespace': 'ApplicationRepository',
                '@classInternalName': 'AppRepository',
                '@persistence': 'PROXY',
                'applicationName': 'Plants_sfs'
            },
            'Attributes': [{
                '@namespace': 'ApplicationRepository',
                '@classInternalName': 'AppTextType',
                '@persistence': 'READ',
                'Name': 'Botanic Name',
                'InternalName': 'Botanic_Name',
                'isKey': true,
                'isNotNull': true,
                'isGenerated': false,
                'AttrGroup': null,
                'pos': 0,
                'DomainValues': [{
                    '@namespace': 'ApplicationRepository',
                    '@classInternalName': 'AppStringDomainModel',
                    '@persistence': 'READ',
                    'representation': 'Iridaceae',
                    'dbValue': 'Iridaceae',
                    'Type': {
                        '@namespace': 'ApplicationRepository',
                        '@classInternalName': 'AppTextType',
                        '@persistence': 'PROXY',
                        'InternalName': 'PlantFamily',
                        'Masterclass': {
                            '@namespace': 'ApplicationRepository',
                            '@classInternalName': 'AppClassInfo',
                            '@persistence': 'PROXY',
                            'InternalName': 'Plant',
                            'Repository': {
                                '@namespace': 'ApplicationRepository',
                                '@classInternalName': 'AppRepository',
                                '@persistence': 'PROXY',
                                'applicationName': 'PlantShop'
                            }
                        }
                    }
                }, {
                    '@namespace': 'ApplicationRepository',
                    '@classInternalName': 'AppStringDomainModel',
                    '@persistence': 'READ',
                    'representation': 'Malvaceae',
                    'dbValue': 'Malvaceae',
                    'Type': {
                        '@namespace': 'ApplicationRepository',
                        '@classInternalName': 'AppTextType',
                        '@persistence': 'PROXY',
                        'InternalName': 'PlantFamily',
                        'Masterclass': {
                            '@namespace': 'ApplicationRepository',
                            '@classInternalName': 'AppClassInfo',
                            '@persistence': 'PROXY',
                            'InternalName': 'Plant',
                            'Repository': {
                                '@namespace': 'ApplicationRepository',
                                '@classInternalName': 'AppRepository',
                                '@persistence': 'PROXY',
                                'applicationName': 'PlantShop'
                            }
                        }
                    }
                }, {
                    '@namespace': 'ApplicationRepository',
                    '@classInternalName': 'AppStringDomainModel',
                    '@persistence': 'READ',
                    'representation': 'Geraniaceae',
                    'dbValue': 'Geraniaceae',
                    'Type': {
                        '@namespace': 'ApplicationRepository',
                        '@classInternalName': 'AppTextType',
                        '@persistence': 'PROXY',
                        'InternalName': 'PlantFamily',
                        'Masterclass': {
                            '@namespace': 'ApplicationRepository',
                            '@classInternalName': 'AppClassInfo',
                            '@persistence': 'PROXY',
                            'InternalName': 'Plant_Test',
                            'Repository': {
                                '@namespace': 'ApplicationRepository',
                                '@classInternalName': 'AppRepository',
                                '@persistence': 'PROXY',
                                'applicationName': 'Plants_sfs'
                            }
                        }
                    }
                }],
                'Masterclass': {
                    '@namespace': 'ApplicationRepository',
                    '@classInternalName': 'AppClassInfo',
                    '@persistence': 'PROXY',
                    'InternalName': 'Plant_Test',
                    'Repository': {
                        '@namespace': 'ApplicationRepository',
                        '@classInternalName': 'AppRepository',
                        '@persistence': 'PROXY',
                        'applicationName': 'Plants_sfs'
                    }
                },
                'length': 100,
                'typeHint': null
            }, {
                '@namespace': 'ApplicationRepository',
                '@classInternalName': 'AppLongType',
                '@persistence': 'READ',
                'Name': 'Heigth in cm',
                'InternalName': 'Heigth_in_cm',
                'isKey': false,
                'isNotNull': true,
                'isGenerated': false,
                'AttrGroup': null,
                'pos': 1,
                'DomainValues': [],
                'Masterclass': {
                    '@namespace': 'ApplicationRepository',
                    '@classInternalName': 'AppClassInfo',
                    '@persistence': 'PROXY',
                    'InternalName': 'Plant_Test',
                    'Repository': {
                        '@namespace': 'ApplicationRepository',
                        '@classInternalName': 'AppRepository',
                        '@persistence': 'PROXY',
                        'applicationName': 'Plants_sfs'
                    }
                },
                'MinValue': 0,
                'MaxValue': 50000
            }],
            'Associations': [],
            'Subclasses': []
        }]
    }];
}

function testResult (): JdyTypedValueObject[] {

    let rep = createAppRepository();
    let repositoryObj;
    let classObj;
    let attrObj;
    let repositoryList: JdyTypedValueObject[] = [];

    // @ts-ignore
    repositoryObj = new JdyTypedValueObject(rep.getClassInfo('AppRepository'), null, false);
    repositoryObj.applicationName = 'Plants_sfs';
    repositoryObj.Name = 'Plants sfs';
    repositoryObj.appVersion = 1;
    repositoryObj.Classes = [];
    repositoryList.push(repositoryObj);

    // @ts-ignore
    classObj = new JdyTypedValueObject(rep.getClassInfo('AppClassInfo'), null, false);
    classObj.Name = 'Plant Family';
    classObj.InternalName = 'Plant_Family';
    classObj.isAbstract = false;
    classObj.beforeSaveScript = '';
    classObj.Superclass = null;
    classObj.Repository = repositoryObj;
    classObj.Attributes = [];
    classObj.Associations = [];
    classObj.Subclasses = [];
    repositoryObj.Classes.push(classObj);

    // @ts-ignore
    classObj = new JdyTypedValueObject(rep.getClassInfo('AppClassInfo'), null, false);
    classObj.Name = 'Plant Test';
    classObj.InternalName = 'Plant_Test';
    classObj.isAbstract = false;
    classObj.beforeSaveScript = 'delegate.first = second + double1';
    classObj.Superclass = null;
    classObj.Repository = repositoryObj;
    classObj.Attributes = [];
    classObj.Associations = [];
    classObj.Subclasses = [];
    repositoryObj.Classes.push(classObj);

    // @ts-ignore
    attrObj = new JdyTypedValueObject(rep.getClassInfo('AppTextType'), null, false);
    attrObj.Name = 'Botanic Name';
    attrObj.InternalName = 'Botanic_Name';
    attrObj.isKey = true;
    attrObj.isNotNull = true;
    attrObj.isGenerated = false;
    attrObj.AttrGroup = null;
    attrObj.pos = 0;
    attrObj.Masterclass = classObj;
    attrObj.length = 100;
    attrObj.typeHint = null;
    classObj.Attributes.push(attrObj);

    // @ts-ignore
    attrObj = new JdyTypedValueObject(rep.getClassInfo('AppLongType'), null, false);
    attrObj.Name = 'Heigth in cm';
    attrObj.InternalName = 'Heigth_in_cm';
    attrObj.isKey = false;
    attrObj.isNotNull = true;
    attrObj.isGenerated = false;
    attrObj.AttrGroup = null;
    attrObj.pos = 1;
    attrObj.Masterclass = classObj;
    attrObj.MinValue = 0;
    attrObj.MaxValue = 50000;
    classObj.Attributes.push(attrObj);

    return repositoryList;
}
