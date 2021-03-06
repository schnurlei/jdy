import { createParametersFor, parameterGetVisitor } from '@/js/jdy/jdy-http';
import { JdyRepository, JdyTypedValueObject } from '@/js/jdy/jdy-base';

test(' jdyhttp.parameterGetVisitor', function () {
    'use strict';

    var visitor;

    visitor = parameterGetVisitor(true);
    expect(visitor.handleBoolean()).toBe('true'); //, 'handleBoolean');
    visitor = parameterGetVisitor(100.67);
    expect(visitor.handleDecimal()).toBe('100.67'); //, 'handleDecimal');
    visitor = parameterGetVisitor(new Date(Date.UTC(2012, 5, 15, 14, 57, 46, 0)));
    expect(visitor.handleTimeStamp()).toBe('2012-06-15T14:57:46.000Z'); // 'handleTimeStamp');
    visitor = parameterGetVisitor(1.20932);
    expect(visitor.handleFloat(1.20932)).toBe('1.20932'); // 'handleFloat');
    visitor = parameterGetVisitor(1234567890);
    expect(visitor.handleLong()).toBe('1234567890'); // 'handleLong');
    visitor = parameterGetVisitor('test test');
    expect(visitor.handleText()).toBe('test test'); // 'handleText');
    visitor = parameterGetVisitor('varchar test');
    expect(visitor.handleVarChar()).toBe('varchar test'); // 'handleVarChar');

});

test(' jdyhttp.createParametersFor', function () {
    'use strict';
    let rep = new JdyRepository('testrep');
    let createdClass = rep.addClassInfo('testclass', null);
    let refClass = rep.addClassInfo('refClass', null);
    let value;
    let refValue;

    createdClass.addTextAttr('testTextAttr', 99).setIsKey(true);
    createdClass.addBooleanAttr('testBooleanAttr');
    createdClass.addLongAttr('testLongAttr', -100, 1000).setIsKey(true);
    createdClass.addReference('masterClassReference', refClass).setIsKey(true);

    refClass.addTextAttr('refTextAttr', 99).setIsKey(true);

    value = new JdyTypedValueObject(createdClass, null, false);
    value.testTextAttr = 'Plant Family';
    value.testBooleanAttr = true;
    value.testLongAttr = 123456;

    refValue = new JdyTypedValueObject(refClass, null, false);
    refValue.refTextAttr = 'Ref text value';

    value.masterClassReference = refValue;

    const searchParams = new URLSearchParams();
    createParametersFor(value, '', searchParams, false);
    let paraString = searchParams.toString();
    expect(searchParams.get('testTextAttr')).toBe('Plant Family'); // 'text attr value');
    expect(searchParams.get('testLongAttr')).toBe('123456'); // 'long attr value');
    expect(searchParams.get('masterClassReference.refTextAttr')).toBe('Ref text value'); // 'ref attr value');

});
