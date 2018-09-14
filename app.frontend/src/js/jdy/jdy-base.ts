export class JdyValidationError extends Error {
    constructor (m: string) {
        super(m);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, JdyValidationError.prototype);
    }
}

export class JdyRepository {

    repoName: string;
    private classes: { [name: string]: JdyClassInfo };

    constructor (repoName: string) {
        this.repoName = repoName;
        this.classes = {};
    }

    addClassInfo (aInternalName, aSuperclass: JdyClassInfo | null) {
        let newClass: JdyClassInfo;
        if (this.classes[aInternalName]) {
            throw new JdyValidationError('Class already exists with name: ' + aInternalName);
        }

        newClass = new JdyClassInfo(this.repoName, aInternalName, aSuperclass);
        this.classes[aInternalName] = newClass;
        return newClass;
    };

    getClassInfo (aInternalName): JdyClassInfo | null {
        return this.classes[aInternalName];
    };

    addAssociation (anAssocName: string, aMasterClass: JdyClassInfo, aDetailClass: JdyClassInfo,
        aDetailInternalName: string, aDetailExternalName: string,
        keyInDetail: boolean, notNullInDetail: boolean, aIsDependent: boolean) {
        let newAssoc,
            detailToMasterAssoc;

        detailToMasterAssoc = new JdyObjectReferenceInfo(aDetailInternalName, aDetailExternalName,
            keyInDetail, notNullInDetail, aMasterClass);
        detailToMasterAssoc.setIsDependent(aIsDependent);
        detailToMasterAssoc.setIsInAssociation(true);
        aDetailClass.addReferenceToAttrList(detailToMasterAssoc);
        newAssoc = new JdyAssociationModel(detailToMasterAssoc, aDetailClass, anAssocName);
        aMasterClass.addAssociation(newAssoc);
    }
}

export class JdyClassInfo {

    nameSpace: string | null;
    repoName: string;
    internalName: string;
    externalName: string;
    shortName: string;
    isAbstract: boolean;
    superclass: JdyClassInfo | null;
    attributes: { [name: string]: JdyAttributeInfo };
    attrList: JdyAttributeInfo[];
    associations: { [name: string]: JdyAssociationModel };
    assocList: JdyAssociationModel[];
    subclasses: JdyClassInfo[];

    constructor (repoName: string, internalName: string, superclass: JdyClassInfo | null) {
        this.nameSpace = null;
        this.repoName = repoName;
        this.internalName = internalName;
        this.superclass = superclass;
        if (this.superclass) {
            this.superclass.subclasses.push(this);
        }

        this.shortName = internalName;
        this.externalName = internalName;
        this.attributes = {};
        this.attrList = [];
        this.associations = {};
        this.assocList = [];
        this.subclasses = [];
        this.isAbstract = false;
    }

    forEachAttr (aFunc) {
        this.getAllAttributeList().forEach(aFunc);
    };

    forEachAssoc (aFunc) {
        this.getAllAssociationList().forEach(aFunc);
    };

    getAllAttributeList () {
        let tmpAttrList = this.attrList;

        if (this.superclass) {
            tmpAttrList = tmpAttrList.concat(this.superclass.getAllAttributeList());
        }

        return tmpAttrList;
    };

    getAllAssociationList () {
        let tmpAssocList: JdyAssociationModel[] = this.assocList;

        if (this.superclass) {
            tmpAssocList = tmpAssocList.concat(this.superclass.getAllAssociationList());
        }

        return tmpAssocList;
    };

    addAssociation (aAssoc: JdyAssociationModel) {
        if (this.associations[aAssoc.getAssocName()]) {
            throw new JdyValidationError('Associtaion already exists with name: ' + aAssoc.getAssocName());
        }

        this.associations[aAssoc.getAssocName()] = aAssoc;
        this.assocList.push(aAssoc);
        return aAssoc;
    };

    addReference (anInternalName, aReferencedClass) {
        let newAttr;
        newAttr = new JdyObjectReferenceInfo(anInternalName, anInternalName, false, false, aReferencedClass);
        this.addReferenceToAttrList(newAttr);
        return newAttr;
    };

    addReferenceToAttrList (aObjRef) {
        if (this.attributes[aObjRef.getInternalName()]) {
            throw new JdyValidationError('Attribute already exists with name: ' + aObjRef.getInternalName());
        }

        this.attributes[aObjRef.getInternalName()] = aObjRef;
        this.attrList.push(aObjRef);
    };

    addPrimitiveAttr (aInternalName: string, aPrimitiveType) {
        let newAttr;
        if (this.attributes[aInternalName]) {
            throw new JdyValidationError('Attribute already exists with name: ' + aInternalName);
        }

        newAttr = new JdyPrimitiveAttributeInfo(aInternalName, aInternalName, false, false, aPrimitiveType);
        this.attributes[aInternalName] = newAttr;
        this.attrList.push(newAttr);
        return newAttr;
    };

    addTextAttr (aInternalName, aLength, aDomainValueList? :null | string[]) {
        return this.addPrimitiveAttr(aInternalName, new JdyTextType(aLength, null, aDomainValueList));
    };

    addEmailAttr (aInternalName, aLength, aDomainValueList) {
        return this.addPrimitiveAttr(aInternalName, new JdyTextType(aLength, JdyTextTypeHint.EMAIL, aDomainValueList));
    };

    addUrlAttr (aInternalName, aLength, aDomainValueList) {
        return this.addPrimitiveAttr(aInternalName, new JdyTextType(aLength, JdyTextTypeHint.URL, aDomainValueList));
    };

    addTelephoneAttr (aInternalName, aLength, aDomainValueList) {
        return this.addPrimitiveAttr(aInternalName, new JdyTextType(aLength, JdyTextTypeHint.TELEPHONE, aDomainValueList));
    };

    addBooleanAttr (aInternalName) {
        return this.addPrimitiveAttr(aInternalName, new JdyBooleanType());
    };

    addVarCharAttr (aInternalName, aLength) {
        return this.addPrimitiveAttr(aInternalName, new JdyVarCharType(aLength, '', false));
    };

    addDecimalAttr (aInternalName, aMinValue, aMaxValue, aScale, aDomainValueList = null) {
        return this.addPrimitiveAttr(aInternalName, new JdyDecimalType(aMinValue, aMaxValue, aScale, aDomainValueList));
    };

    addLongAttr (aInternalName, aMinValue, aMaxValue, aDomainValueList = null) {
        return this.addPrimitiveAttr(aInternalName, new JdyLongType(aMinValue, aMaxValue, aDomainValueList));
    };

    addTimeStampAttr (aInternalName, isDatePartUsed, isTimePartUsed) {
        return this.addPrimitiveAttr(aInternalName, new JdyTimeStampType(isDatePartUsed, isTimePartUsed));
    };

    addFloatAttr (aInternalName) {
        return this.addPrimitiveAttr(aInternalName, new JdyFloatType());
    };

    addBlobAttr (aInternalName) {
        return this.addPrimitiveAttr(aInternalName, new JdyBlobType(''));
    };

    getShortName () {
        return this.shortName;
    };

    setShortName (aShortName) {
        this.shortName = aShortName;
        return this;
    };

    setAbstract (newValue) {
        this.isAbstract = newValue;
        return this;
    };

    getInternalName () {
        return this.internalName;
    };

    getAssoc (aAssocName) {
        return this.associations[aAssocName];
    };

    getAttr (aInternalName): JdyAttributeInfo {
        return this.attributes[aInternalName];
    };

    getNameSpace () {
        return this.nameSpace;
    };

    getRepoName () {
        return this.repoName;
    };

    getAllSubclasses () {
        return this.subclasses;
    }
}

export class JdyAssociationModel {

    private detailClass: JdyClassInfo;
    private assocName: string;
    private masterClassReference: JdyObjectReferenceInfo;

    constructor (aMasterClassRef: JdyObjectReferenceInfo, aDetailClass: JdyClassInfo, anAssocName: string) {
        this.detailClass = aDetailClass;
        this.masterClassReference = aMasterClassRef;
        this.assocName = anAssocName;
    }

    getAssocName () {
        return this.assocName;
    };

    getDetailClass () {
        return this.detailClass;
    };

    getMasterClassReference () {
        return this.masterClassReference;
    };

}

export class JdyAttributeInfo {

    internalName: string;
    externalName: string;
    key: boolean;
    isNotNull: boolean;
    isGenerated: Boolean;
    attrGroup: string | null;
    pos: null;
    primitive: boolean;

    constructor (aInternalName: string, aExternalName: string, isKey: boolean, isNotNull: boolean) {
        this.internalName = aInternalName;
        this.externalName = aExternalName;
        this.key = isKey;
        this.isNotNull = isNotNull;
        this.isGenerated = false;
        this.attrGroup = null;
        this.pos = null;
        this.primitive = false;
    }

    getInternalName () {
        return this.internalName;
    };

    isPrimitive () {
        return (this.primitive) ? this.primitive : false;
    };

    isKey () {
        return (this.key) ? this.key : false;
    };

    setIsKey (isKey) {
        this.key = isKey;
        return this;
    };

    setNotNull (isNotNull) {
        this.isNotNull = isNotNull;
        return this;
    };

    setGenerated (isGenerated) {
        this.isGenerated = isGenerated;
        return this;
    };

    setExternalName (aExternalName) {
        this.externalName = aExternalName;
        return this;
    };

    setAttrGroup (anAttrGroup) {
        this.attrGroup = anAttrGroup;
        return this;
    };

    setPos (aPos) {
        this.pos = aPos;
        return this;
    };
}

export class JdyObjectReferenceInfo extends JdyAttributeInfo {
    private referencedClass: JdyClassInfo;
    private inAssociation: boolean;
    private dependent: boolean;

    constructor (aInternalName: string, aExternalName: string, isKeyFlag: boolean, isNotNullFlag: boolean, aReferencedClass: JdyClassInfo) {
        super(aInternalName, aExternalName, isKeyFlag, isNotNullFlag);
        this.referencedClass = aReferencedClass;
        this.inAssociation = false;
        this.dependent = false;
        this.primitive = false;
    };

    getReferencedClass () {
        return this.referencedClass;
    };

    setIsDependent (isDependent) {
        this.dependent = isDependent;
        return this;
    };

    setIsInAssociation (inAssociation) {
        this.inAssociation = inAssociation;
        return this;
    };
}

export class JdyPrimitiveAttributeInfo extends JdyAttributeInfo {

    private type: JdyPrimitiveType;

    constructor (aInternalName: string, aExternalName: string, isKey: boolean, isNotNull: boolean, aType: JdyPrimitiveType) {
        super(aInternalName, aExternalName, isKey, isNotNull);
        this.type = aType;
        this.primitive = true;
    }

    getType () : JdyPrimitiveType {
        return this.type;
    };
}

enum JdyDataType {

    JDY_BOOLEAN = 'BOOLEAN',
    JDY_DECIMAL = 'DECIMAL',
    JDY_TIMESTAMP = 'TIMESTAMP',
    JDY_FLOAT = 'FLOAT',
    JDY_LONG = 'LONG',
    JDY_TEXT = 'TEXT',
    JDY_VARCHAR = 'VARCHAR',
    JDY_BLOB = 'BLOB',
}

export interface JdyPrimitiveTypeVisitor {

    handleBoolean (aType: JdyBooleanType): boolean|null|void,
    handleDecimal (aType: JdyDecimalType): number|null|void,
    handleTimeStamp (aType: JdyTimeStampType): Date|null|void,
    handleFloat (aType: JdyFloatType): number|null|void,
    handleLong (aType: JdyLongType): number|null|void,
    handleText (aType: JdyTextType): string|null|void,
    handleVarChar (aType: JdyVarCharType): string|null|void,
    handleBlob (aType: JdyBlobType): object|null|void
}

export abstract class JdyPrimitiveType {

    $type: JdyDataType;

    constructor ($type: JdyDataType) {
        this.$type = $type;
    }

    abstract handlePrimitiveKey (aHandler: JdyPrimitiveTypeVisitor);

    getType () {
        return this.$type;
    }
}

export class JdyBlobType extends JdyPrimitiveType {

    typeHint: string;

    constructor (typeHint: string) {
        super(JdyDataType.JDY_BLOB);
        this.typeHint = typeHint;
    }

    handlePrimitiveKey (aHandler: JdyPrimitiveTypeVisitor) {
        return aHandler.handleBlob(this);
    };
}

export class JdyFloatType extends JdyPrimitiveType {

    constructor () {
        super(JdyDataType.JDY_FLOAT);
    }

    handlePrimitiveKey (aHandler: JdyPrimitiveTypeVisitor) {
        return aHandler.handleFloat(this);
    };
}

export class JdyBooleanType extends JdyPrimitiveType {

    constructor () {
        super(JdyDataType.JDY_BOOLEAN);
    }

    handlePrimitiveKey (aHandler: JdyPrimitiveTypeVisitor) {
        return aHandler.handleBoolean(this);
    };
}

export class JdyLongType extends JdyPrimitiveType {

    private minValue: number;
    private maxValue: number;
    private domainValues: any;

    constructor (aMinValue: number, aMaxValue: number, aDomainValueList) {
        super(JdyDataType.JDY_LONG);
        this.minValue = aMinValue;
        this.maxValue = aMaxValue;
        this.domainValues = aDomainValueList;
    }

    handlePrimitiveKey (aHandler: JdyPrimitiveTypeVisitor) {
        return aHandler.handleLong(this);
    };
}

export class JdyDecimalType extends JdyPrimitiveType {

    private minValue: number;
    private maxValue: number;
    private scale: number;
    private domainValues: any;

    constructor (aMinValue: number, aMaxValue: number, aScale: number, aDomainValueList) {
        super(JdyDataType.JDY_DECIMAL);
        this.minValue = aMinValue;
        this.maxValue = aMaxValue;
        this.scale = aScale;
        this.domainValues = aDomainValueList;
    }

    handlePrimitiveKey (aHandler: JdyPrimitiveTypeVisitor) {
        return aHandler.handleDecimal(this);
    };
}

export class JdyTextType extends JdyPrimitiveType {
    private length: number;
    private typeHint: JdyTextTypeHint | null;
    private domainValues: string[] | null | undefined;

    constructor (aLength: number, aTypeHint: JdyTextTypeHint | null, aDomainValueList?: string[] | null) {
        super(JdyDataType.JDY_TEXT);
        this.length = aLength;
        this.typeHint = aTypeHint;
        this.domainValues = aDomainValueList;
    }

    handlePrimitiveKey (aHandler: JdyPrimitiveTypeVisitor) {
        return aHandler.handleText(this);
    };

    getLength (): number {
        return this.length;
    }
}

enum JdyTextTypeHint {

    EMAIL = 'EMAIL',
    TELEPHONE = 'TELEPHONE',
    URL = 'URL',
}

export class JdyTimeStampType extends JdyPrimitiveType {

    private datePartUsed: boolean;
    private timePartUsed: boolean;

    constructor (isDatePartUsed: boolean, isTimePartUsed: boolean) {
        super(JdyDataType.JDY_TIMESTAMP);
        this.datePartUsed = isDatePartUsed;
        this.timePartUsed = isTimePartUsed;
    }

    handlePrimitiveKey (aHandler: JdyPrimitiveTypeVisitor) {
        return aHandler.handleTimeStamp(this);
    };
}

export class JdyVarCharType extends JdyPrimitiveType {

    private length: number;
    private mimeType: null;
    private clob: boolean;

    constructor (aLength: number, mimeType: string, isClobFlag: boolean) {
        super(JdyDataType.JDY_VARCHAR);
        this.length = aLength;
        this.mimeType = null;
        this.clob = isClobFlag;
    }

    handlePrimitiveKey (aHandler: JdyPrimitiveTypeVisitor) {
        return aHandler.handleVarChar(this);
    };
}

export class JdyClassInfoQuery {

    private resultInfo: JdyClassInfo;
    private filterExpression: ObjectFilterExpression | null;

    constructor (aTypeInfo: JdyClassInfo, aFilterExpr: ObjectFilterExpression | null) {
        this.resultInfo = aTypeInfo;
        this.filterExpression = aFilterExpr;
    }

    getResultInfo () {
        return this.resultInfo;
    };

    matchesObject (aModel) {
        return this.filterExpression === null || this.filterExpression.matchesObject(aModel);
    };

    getFilterExpression () {
        return this.filterExpression;
    };

    setFilterExpression (aExpression) {
        this.filterExpression = aExpression;
    };
}

export class ObjectFilterExpression {
    $exprType: string;

    constructor (aType: string) {
        this.$exprType = aType;
    }

    matchesObject (aModel): boolean {
        return true;
    }

    visit (aModel): void {
    }
}

export class JdyAndExpression extends ObjectFilterExpression {

    private expressionVect: ObjectFilterExpression[];

    constructor (aExprVect: ObjectFilterExpression[]) {
        super('AndExpression');
        this.expressionVect = aExprVect;
    }

    visit (aVisitor) {
        return aVisitor.visitAndExpression(this);
    };

    matchesObject (aModel) {
        let matches = true;
        for (let i = 0; i < this.expressionVect.length; i++) {
            matches = this.expressionVect[i].matchesObject(aModel);
        }
        return matches;
    };
}

export class JdyOrExpression extends ObjectFilterExpression {

    private expressionVect: ObjectFilterExpression[];

    constructor (aExprVect: ObjectFilterExpression[]) {
        super('OrExpression');

        this.expressionVect = aExprVect;
    }

    visit (aVisitor) {
        return aVisitor.visitOrExpression(this);
    };

    matchesObject (aModel) {
        let matches = true;
        for (let i = 0; i < this.expressionVect.length; i++) {
            matches = this.expressionVect[i].matchesObject(aModel);
        }
        return matches;
    };
}

export class JdyOperatorExpression extends ObjectFilterExpression {

    private myOperator: ExpressionPrimitiveOperator;
    private attributeInfo: JdyAttributeInfo;
    private compareValue: any;

    constructor (aOperator: ExpressionPrimitiveOperator, aAttributeInfo: JdyAttributeInfo, aCompareValue) {
        super('OperatorExpression');
        this.myOperator = aOperator;
        this.attributeInfo = aAttributeInfo;
        this.compareValue = aCompareValue;
    }

    visit (aVisitor) {
        return aVisitor.visitOperatorExpression(this);
    };

    matchesObject (aModel) {
        let modelValue = aModel.getValue(this.attributeInfo);
        return this.myOperator.compareValues(modelValue, this.compareValue, this.attributeInfo);
    };

    getOperator () {
        return this.myOperator;
    };

}

export class ExpressionPrimitiveOperator {

    visitOperatorHandler (aVisitor) {
        return aVisitor.visitEqualOperator(this);
    };

    compareValues (value1, value2, attributeInfo): boolean {
        return true;
    }
}

export class JdyEqualOperator extends ExpressionPrimitiveOperator {

    private isNotEqual: boolean;

    constructor (notEqual: boolean) {
        super();
        this.isNotEqual = notEqual;
    }

    visitOperatorHandler (aVisitor) {
        return aVisitor.visitEqualOperator(this);
    };

    compareValues (value1, value2, attributeInfo) {
        let result = false;
        if (value1 !== null && value2 !== null) {
            result = attributeInfo.compareObjects(value1, value2) === 0;
            if (this.isNotEqual) {
                result = !result;
            }
        }
        return result;
    };

    toString () {
        return (this.isNotEqual) ? '<>' : '=';
    };
}

export class JdyGreatorOperator extends ExpressionPrimitiveOperator {

    private isAlsoEqual: boolean;

    constructor (alsoEqual: boolean) {
        super();
        this.isAlsoEqual = alsoEqual;
    }

    visitOperatorHandler (aVisitor) {
        return aVisitor.visitGreatorOperator(this);
    };

    compareValues (value1, value2, attributeInfo) {
        let result = false;
        if (value1 !== null && value2 !== null) {
            result = attributeInfo.compareObjects(value1, value2) > 0;
            if (this.isAlsoEqual) {
                result = result && attributeInfo.compareObjects(value1, value2) === 0;
            }
        }
        return result;
    };

    toString () {
        return (this.isAlsoEqual) ? '>=' : '>';
    };

}

export class JdyLessOperator extends ExpressionPrimitiveOperator {

    private isAlsoEqual: boolean;

    constructor (alsoEqual: boolean) {
        super();
        this.isAlsoEqual = alsoEqual;
    }

    visitOperatorHandler (aVisitor) {
        return aVisitor.visitLessOperator(this);
    };

    compareValues (value1, value2, attributeInfo) {
        let result = false;
        if (value1 !== null && value2 !== null) {
            result = attributeInfo.compareObjects(value1, value2) < 0;
            if (this.isAlsoEqual) {
                result = result && attributeInfo.compareObjects(value1, value2) === 0;
            }
        }
        return result;
    };

    toString () {
        return (this.isAlsoEqual) ? '<=' : '<';
    };
}

export class JdyFilterCreationException extends Error {

    constructor (m: string) {
        super(m);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, JdyValidationError.prototype);
    }
}

export class JdyQueryCreator {

    protected resultInfo: JdyClassInfo;
    private createdExpr: ObjectFilterExpression | null;

    constructor (aResultInfo: JdyClassInfo) {
        this.resultInfo = aResultInfo;
        this.createdExpr = null;
    }

    query (): JdyClassInfoQuery {
        return new JdyClassInfoQuery(this.resultInfo, this.createdExpr);
    };

    greater (anExAttrName, aCompareValue) {
        this.addOperatorExpression(anExAttrName, aCompareValue, new JdyGreatorOperator(false));
        return this;
    };

    greaterOrEqual (anExAttrName, aCompareValue) {
        this.addOperatorExpression(anExAttrName, aCompareValue, new JdyGreatorOperator(true));
        return this;
    };

    less (anExAttrName, aCompareValue) {
        this.addOperatorExpression(anExAttrName, aCompareValue, new JdyLessOperator(false));
        return this;
    };

    lessOrEqual (anExAttrName, aCompareValue) {
        this.addOperatorExpression(anExAttrName, aCompareValue, new JdyLessOperator(true));
        return this;
    };

    equal (anExAttrName, aCompareValue) {
        this.addOperatorExpression(anExAttrName, aCompareValue, new JdyEqualOperator(false));
        return this;
    };

    notEqual (anExAttrName, aCompareValue) {
        this.addOperatorExpression(anExAttrName, aCompareValue, new JdyEqualOperator(true));
        return this;
    };

    addOperatorExpression (anAttrName: string, aCompareValue, aOperator: ExpressionPrimitiveOperator) {
        let attributeInfo: JdyAttributeInfo = this.resultInfo.getAttr(anAttrName);
        let opExpr = new JdyOperatorExpression(aOperator, attributeInfo, aCompareValue);
        this.addExpression(opExpr);
        return this;
    };

    addExpression (anExpr: ObjectFilterExpression): JdyQueryCreator {
        this.createdExpr = anExpr;
        return this;
    };

    and () {
        return new JdyAndQueryCreator(this.resultInfo, this);
    };

    or () {
        return new JdyOrQueryCreator(this.resultInfo, this);
    };

    end () {
        throw new JdyFilterCreationException('No Multiple Expression open');
    };
}

export class JdyAndQueryCreator extends JdyQueryCreator {

    private parentCreator: JdyQueryCreator;
    private expressions: ObjectFilterExpression[];

    constructor (aResultInfo: JdyClassInfo, aParentCreator: JdyQueryCreator) {
        super(aResultInfo);
        JdyAttributeInfo.apply(this, arguments);
        this.parentCreator = aParentCreator;
        this.expressions = [];
    }

    addExpression (anExpr: ObjectFilterExpression): JdyQueryCreator {
        this.expressions.push(anExpr);
        return this;
    };

    query (): JdyClassInfoQuery {
        throw new JdyFilterCreationException('And not closes');
    };

    end () {
        this.parentCreator.addExpression(new JdyAndExpression(this.expressions));
        return this.parentCreator;
    };
}

export class JdyOrQueryCreator extends JdyQueryCreator {

    private parentCreator: JdyQueryCreator;
    private expressions: ObjectFilterExpression[];

    constructor (aResultInfo, aParentCreator) {
        super(aResultInfo);
        JdyAttributeInfo.apply(this, arguments);
        this.parentCreator = aParentCreator;
        this.expressions = [];
    }

    addExpression (anExpr): JdyQueryCreator {
        this.expressions.push(anExpr);
        return this;
    };

    query (): JdyClassInfoQuery {
        throw new JdyFilterCreationException('Or not closes');
    };

    end () {
        this.parentCreator.addExpression(new JdyOrExpression(this.expressions));
        return this.parentCreator;
    };
}
