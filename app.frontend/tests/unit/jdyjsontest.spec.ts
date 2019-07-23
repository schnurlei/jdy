import { JdyObjectList, JdyObjectListImpl, JdyRepository, JdyTypedValueObject } from '@/js/jdy/jdy-base';
import {
    JsonFileReader,
    JsonFileWriter, jsonReaderGetVisitor,
    Operation
} from '@/js/jdy/jdy-json';
import { createAppRepository } from '@/js/jdy/jdy-meta';

test(' jdyjson.getConcreteClass', function () {

    let rep = new JdyRepository('testrep');
    let baseClass = rep.addClassInfo('baseClass', null);
    let subClass1 = rep.addClassInfo('subClass1', baseClass);
    let subClass2 = rep.addClassInfo('subClass2', subClass1);
    let jsonReader = new JsonFileReader();
    let concreteClass;

    concreteClass = jsonReader.getConcreteClass(baseClass, 'testrep', 'subClass2');

    expect(concreteClass.internalName).toBe('subClass2'); // 'Class name exits');
    expect(concreteClass.repoName).toBe('testrep'); // 'repo exists');

});

test(' jdyjson.jsonValueGetVisitor', function () {
    'use strict';

    let visitor = jsonReaderGetVisitor(true);
    let dateUtc;
    let dateParsed;

    expect(visitor.handleBoolean()).toBe(true); //  'handleBoolean');
    visitor = jsonReaderGetVisitor(100.67);
    expect(visitor.handleDecimal()).toBe(100.67); //  'handleDecimal');
    visitor = jsonReaderGetVisitor('2012-06-15T14:57:46Z');
    dateParsed = visitor.handleTimeStamp();
    dateUtc = new Date(Date.UTC(2012, 5, 15, 14, 57, 46, 0));
    expect(dateParsed.getTime()).toBe(dateUtc.getTime()); //  'handleTimeStamp');
    visitor = jsonReaderGetVisitor(1.20932);
    expect(visitor.handleFloat()).toBe(1.20932); //  'handleFloat');
    visitor = jsonReaderGetVisitor(1234567890);
    expect(visitor.handleLong()).toBe(1234567890); //  'handleLong');
    visitor = jsonReaderGetVisitor('test test');
    expect(visitor.handleText()).toBe('test test'); // 'handleText');
    visitor = jsonReaderGetVisitor('varchar test');
    expect(visitor.handleVarChar()).toBe('varchar test'); //, 'handleVarChar');

});

test(' jdyjson.writeObjectList', function () {
    'use strict';

    let jsonWriter = new JsonFileWriter();
    let resultList;

    resultList = jsonWriter.writeObjectList(testAppRepository()[0].$assocs.Classes, Operation.INSERT, null);
    expect(resultList.length).toBe(2);//, 'Empty list');

});

function testAppRepository () {

    let rep = createAppRepository();
    let repositoryObj: JdyTypedValueObject;
    let nameSpace: JdyTypedValueObject;
    let classObj: JdyTypedValueObject;
    let attrObj: JdyTypedValueObject;
    let repositoryList: JdyTypedValueObject[] = [];

    // @ts-ignore
    repositoryObj = new JdyTypedValueObject(rep.getClassInfo('AppRepository'), null, null);
    repositoryObj.setVal('applicationName', 'Plants_sfs');
    repositoryObj.setVal('Name', 'Plants sfs');
    repositoryList.push(repositoryObj);

    // @ts-ignore
    classObj = new JdyTypedValueObject(rep.getClassInfo('AppClassInfo'), null, null);
    classObj['Name'] = 'Plant Family';
    classObj['InternalName'] = 'Plant_Family';
    classObj['isAbstract'] = false;
    classObj['beforeSaveScript'] = '';
    classObj['Superclass'] = null;
    classObj['Repository'] = repositoryObj;
    repositoryObj.$assocs['Classes'].add(classObj);

    // @ts-ignore
    classObj = new JdyTypedValueObject(rep.getClassInfo('AppClassInfo'), null, null);
    classObj['Name'] = 'Plant Test';
    classObj['InternalName'] = 'Plant_Test';
    classObj['isAbstract'] = false;
    classObj['beforeSaveScript'] = 'delegate.first = second + double1';
    classObj['Superclass'] = null;
    classObj['Repository'] = repositoryObj;
    repositoryObj.$assocs['Classes'].add(classObj);

    // @ts-ignore
    attrObj = new JdyTypedValueObject(rep.getClassInfo('AppTextType'), null, null);
    attrObj['Name'] = 'Botanic Name';
    attrObj['InternalName'] = 'Botanic_Name';
    attrObj['isKey'] = true;
    attrObj['isNotNull'] = true;
    attrObj['isGenerated'] = false;
    attrObj['AttrGroup'] = null;
    attrObj['pos'] = 0;
    attrObj['Masterclass'] = classObj;
    attrObj['length'] = 100;
    attrObj['typeHint'] = null;
    classObj.$assocs['Attributes'].add(attrObj);

    // @ts-ignore
    attrObj = new JdyTypedValueObject(rep.getClassInfo('AppLongType'), null, null);
    attrObj['Name'] = 'Heigth in cm';
    attrObj['InternalName'] = 'Heigth_in_cm';
    attrObj['isKey'] = false;
    attrObj['isNotNull'] = true;
    attrObj['isGenerated'] = false;
    attrObj['AttrGroup'] = null;
    attrObj['pos'] = 1;
    attrObj['Masterclass'] = classObj;
    attrObj['MinValue'] = 0;
    attrObj['MaxValue'] = 50000;
    classObj.$assocs['Attributes'].add(attrObj);

    return repositoryList;

};
