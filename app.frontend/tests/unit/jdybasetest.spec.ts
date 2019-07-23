import {
    JdyClassInfo,
    JdyClassInfoQuery,
    JdyQueryCreator,
    JdyRepository,
    JdyValidationError
} from '../../src/js/jdy/jdy-base';
import { testCreatePlantShopRepository } from '@/jdy-test';

test(' Repository creation', () => {

    let rep = new JdyRepository('testrep');
    let createdClass: JdyClassInfo | null = rep.addClassInfo('testclass', null);
    expect(createdClass.getInternalName()).toBe('testclass') // 'Class name exits'
    expect(createdClass.getRepoName()).toBe('testrep'); //  'namespace exists'

    expect(() => { rep.addClassInfo('testclass', null) })
        .toThrow('Class already exists with name: testcla');

    createdClass = rep.getClassInfo('testclass');
    expect(createdClass).not.toBeNull();
    if (createdClass !== null) {
        expect(createdClass.getInternalName()).toBe('testclass'); // 'Class name exits'
        expect(createdClass.getRepoName()).toBe('testrep'); // 'namespace exists'
    }
});

test(' Add attributes to class', () => {

    let rep = new JdyRepository('testrep');
    let createdClass = rep.addClassInfo('testclass', null);
    let createdTextAttr = createdClass.addTextAttr('testTextAttr', 99);
    let createdBooleanAttr = createdClass.addBooleanAttr('testBooleanAttr');
    let createdVarCharAttr = createdClass.addVarCharAttr('testVarCharAttr', 22);
    let createdDecimalAttr = createdClass.addDecimalAttr('testDecimalAttr', -10.22, 10.44, 3);
    let createdLongAttr = createdClass.addLongAttr('testLongAttr', -100, 1000);
    let createdTimeStampAttr = createdClass.addTimeStampAttr('testTimeStampAttr', true, true);
    let createdFloatAttr = createdClass.addBooleanAttr('testFloatAttr');
    let createdBlobAttr = createdClass.addBlobAttr('testBlobAttr');

    expect(createdTextAttr.getInternalName()).toBe('testTextAttr'); // 'Text Attribute exits');
    expect(createdBooleanAttr.getInternalName()).toBe('testBooleanAttr'); // 'Boolean Attribute exits');
    expect(createdVarCharAttr.getInternalName()).toBe('testVarCharAttr'); // 'VarChar Attribute exits');
    expect(createdDecimalAttr.getInternalName()).toBe('testDecimalAttr'); // 'Decimal Attribute exits');
    expect(createdLongAttr.getInternalName()).toBe('testLongAttr'); // 'Long Attribute exits');
    expect(createdTimeStampAttr.getInternalName()).toBe('testTimeStampAttr'); // 'TimeStamp Attribute exits');
    expect(createdFloatAttr.getInternalName()).toBe('testFloatAttr'); // 'Float Attribute exits');
    expect(createdBlobAttr.getInternalName()).toBe('testBlobAttr'); // 'Blob Attribute exits');

    expect(() => { createdClass.addTextAttr('testBooleanAttr', null) })
        .toThrow('Attribute already exists with name: testBooleanAttr');

});

test(' Add association to class', function () {

    let rep = new JdyRepository('testrep');
    let masterclass = rep.addClassInfo('Masterclass', null);
    let detailclass = rep.addClassInfo('Detailclass', null);
    let assoc;
    let backReference;
    rep.addAssociation('AssocName', masterclass, detailclass, 'Masterclass', 'Masterclass', true, true, true);
    assoc = masterclass.getAssoc('AssocName');
    backReference = detailclass.getAttr('Masterclass');
    expect(assoc.getAssocName()).toBe('AssocName') // 'Association exits');
    expect(backReference.getInternalName()).toBe('Masterclass') // 'Backreference exits');

});

test(' Subclass creation', () => {

    let rep = new JdyRepository('testrep');
    let baseClass = rep.addClassInfo('baseClass', null);
    let subClass1 = rep.addClassInfo('subClass1', baseClass);
    let subClass2 = rep.addClassInfo('subClass2', subClass1);
    let allAttr;

    baseClass.addTextAttr('baseTextAttr', 50);
    subClass1.addTextAttr('sub1TextAttr', 100);
    subClass2.addTextAttr('sub2TextAttr', 100);

    allAttr = subClass2.getAllAttributeList();

    expect(allAttr.length).toBe(3) // 'Sublass has aslo Suberclass attributes');

});

test(' Filter creation', () => {

    let query: JdyClassInfoQuery;
    let rep = testCreatePlantShopRepository();
    let plantType = rep.getClassInfo('Plant');

    expect(plantType).not.toBeNull();
    if (plantType !== null) {
        query = new JdyQueryCreator(plantType)
            .or()
            .equal('BotanicName', 'Iris')
            .and().greater('HeigthInCm', 30).less('HeigthInCm', 100).end()
            .end().query();
        expect(query.getResultInfo().getInternalName()).toBe('Plant');
    }
});
