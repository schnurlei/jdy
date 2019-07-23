import construct = Reflect.construct;

export class JdyValidationError extends Error {
    public constructor (m: string) {
        super(m);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, JdyValidationError.prototype);
    }
}

export class JdyRepository {

    private repoName: string;
    private classes: { [name: string]: JdyClassInfo };

    public constructor (repoName: string) {

        this.repoName = repoName;
        this.classes = {};
    }

    public addClassInfo (aInternalName, aSuperclass: JdyClassInfo | null): JdyClassInfo {

        let newClass: JdyClassInfo;
        if (this.classes[aInternalName]) {

            throw new JdyValidationError('Class already exists with name: ' + aInternalName);
        }

        newClass = new JdyClassInfo(this.repoName, aInternalName, aSuperclass);
        this.classes[aInternalName] = newClass;
        return newClass;
    };

    public getClassInfo (aInternalName): JdyClassInfo | null {

        return this.classes[aInternalName];
    };

    public addAssociation (anAssocName: string, aMasterClass: JdyClassInfo, aDetailClass: JdyClassInfo
        , aDetailInternalName: string, aDetailExternalName: string
        , keyInDetail: boolean, notNullInDetail: boolean, aIsDependent: boolean) {
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

    private nameSpace: string | null;
    private repoName: string;
    private internalName: string;
    private externalName: string;
    private shortName: string;
    private isAbstract: boolean;
    private superclass: JdyClassInfo | null;
    private attributes: { [name: string]: JdyAttributeInfo };
    private attrList: JdyAttributeInfo[];
    private associations: { [name: string]: JdyAssociationModel };
    private assocList: JdyAssociationModel[];
    private subclasses: JdyClassInfo[];

    public constructor (repoName: string, internalName: string, superclass: JdyClassInfo | null) {
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

    public forEachAttr (callbackfn: (value: JdyAttributeInfo, index: number, array: JdyAttributeInfo[]) => void, thisArg?: any) {
        this.getAllAttributeList().forEach(callbackfn);
    };

    public forEachAssoc (callbackfn: (value: JdyAssociationModel, index: number, array: JdyAssociationModel[]) => void, thisArg?: any) {
        this.getAllAssociationList().forEach(callbackfn);
    };

    public getAllAttributeList (): JdyAttributeInfo[] {
        let tmpAttrList: JdyAttributeInfo[] = this.attrList;

        if (this.superclass) {
            tmpAttrList = tmpAttrList.concat(this.superclass.getAllAttributeList());
        }

        return tmpAttrList;
    };

    public getAllAssociationList (): JdyAssociationModel[] {
        let tmpAssocList: JdyAssociationModel[] = this.assocList;

        if (this.superclass) {
            tmpAssocList = tmpAssocList.concat(this.superclass.getAllAssociationList());
        }

        return tmpAssocList;
    };

    public addAssociation (aAssoc: JdyAssociationModel) {
        if (this.associations[aAssoc.getAssocName()]) {
            throw new JdyValidationError('Associtaion already exists with name: ' + aAssoc.getAssocName());
        }

        this.associations[aAssoc.getAssocName()] = aAssoc;
        this.assocList.push(aAssoc);
        return aAssoc;
    };

    public addReference (anInternalName, aReferencedClass) {
        let newAttr;
        newAttr = new JdyObjectReferenceInfo(anInternalName, anInternalName, false, false, aReferencedClass);
        this.addReferenceToAttrList(newAttr);
        return newAttr;
    };

    public addReferenceToAttrList (aObjRef) {
        if (this.attributes[aObjRef.getInternalName()]) {
            throw new JdyValidationError('Attribute already exists with name: ' + aObjRef.getInternalName());
        }

        this.attributes[aObjRef.getInternalName()] = aObjRef;
        this.attrList.push(aObjRef);
    };

    public addPrimitiveAttr (aInternalName: string, aPrimitiveType) {
        let newAttr;
        if (this.attributes[aInternalName]) {
            throw new Error('Attribute already exists with name: ' + aInternalName);
        }

        newAttr = new JdyPrimitiveAttributeInfo(aInternalName, aInternalName, false, false, aPrimitiveType);
        this.attributes[aInternalName] = newAttr;
        this.attrList.push(newAttr);
        return newAttr;
    };

    public addTextAttr (aInternalName, aLength, aDomainValueList?: null | string[]) {
        return this.addPrimitiveAttr(aInternalName, new JdyTextType(aLength, null, aDomainValueList));
    };

    public addEmailAttr (aInternalName, aLength, aDomainValueList) {
        return this.addPrimitiveAttr(aInternalName, new JdyTextType(aLength, JdyTextTypeHint.EMAIL, aDomainValueList));
    };

    public addUrlAttr (aInternalName, aLength, aDomainValueList) {
        return this.addPrimitiveAttr(aInternalName, new JdyTextType(aLength, JdyTextTypeHint.URL, aDomainValueList));
    };

    public addTelephoneAttr (aInternalName, aLength, aDomainValueList) {
        return this.addPrimitiveAttr(aInternalName, new JdyTextType(aLength, JdyTextTypeHint.TELEPHONE, aDomainValueList));
    };

    public addBooleanAttr (aInternalName) {
        return this.addPrimitiveAttr(aInternalName, new JdyBooleanType());
    };

    public addVarCharAttr (aInternalName, aLength) {
        return this.addPrimitiveAttr(aInternalName, new JdyVarCharType(aLength, '', false));
    };

    public addDecimalAttr (aInternalName, aMinValue, aMaxValue, aScale, aDomainValueList = null) {
        return this.addPrimitiveAttr(aInternalName, new JdyDecimalType(aMinValue, aMaxValue, aScale, aDomainValueList));
    };

    public addLongAttr (aInternalName, aMinValue, aMaxValue, aDomainValueList = null) {
        return this.addPrimitiveAttr(aInternalName, new JdyLongType(aMinValue, aMaxValue, aDomainValueList));
    };

    public addTimeStampAttr (aInternalName, isDatePartUsed, isTimePartUsed) {
        return this.addPrimitiveAttr(aInternalName, new JdyTimeStampType(isDatePartUsed, isTimePartUsed));
    };

    public addFloatAttr (aInternalName) {
        return this.addPrimitiveAttr(aInternalName, new JdyFloatType());
    };

    public addBlobAttr (aInternalName) {
        return this.addPrimitiveAttr(aInternalName, new JdyBlobType(''));
    };

    public getShortName () {
        return this.shortName;
    };

    public setShortName (aShortName) {
        this.shortName = aShortName;
        return this;
    };

    public setAbstract (newValue) {
        this.isAbstract = newValue;
        return this;
    };

    public getInternalName () {
        return this.internalName;
    };

    public getAssoc (aAssocName) {
        return this.associations[aAssocName];
    };

    public getAttr (aInternalName): JdyAttributeInfo {
        return this.attributes[aInternalName];
    };

    public getNameSpace () {
        return this.nameSpace;
    };

    public getRepoName () {
        return this.repoName;
    };

    public getAllSubclasses () {
        return this.subclasses;
    }
}

export class JdyAssociationModel {

    private detailClass: JdyClassInfo;
    private assocName: string;
    private masterClassReference: JdyObjectReferenceInfo;

    public constructor (aMasterClassRef: JdyObjectReferenceInfo, aDetailClass: JdyClassInfo, anAssocName: string) {
        this.detailClass = aDetailClass;
        this.masterClassReference = aMasterClassRef;
        this.assocName = anAssocName;
    }

    public getAssocName () {
        return this.assocName;
    };

    public getDetailClass () {
        return this.detailClass;
    };

    public getMasterClassReference () {
        return this.masterClassReference;
    };

}

export class JdyAttributeInfo {

    private internalName: string;
    private externalName: string;
    private key: boolean;
    private isNotNull: boolean;
    private generated: boolean;
    private attrGroup: string | null;
    private pos: null;
    protected primitive: boolean;

    public constructor (aInternalName: string, aExternalName: string, isKey: boolean, isNotNull: boolean) {
        this.internalName = aInternalName;
        this.externalName = aExternalName;
        this.key = isKey;
        this.isNotNull = isNotNull;
        this.generated = false;
        this.attrGroup = null;
        this.pos = null;
        this.primitive = false;
    }

    public getInternalName () {
        return this.internalName;
    };

    public isPrimitive () {
        return (this.primitive) ? this.primitive : false;
    };

    public isKey () {
        return (this.key) ? this.key : false;
    };

    public isGenerated () {
        return (this.isGenerated) ? this.isGenerated : false;
    };

    public setIsKey (isKey) {
        this.key = isKey;
        return this;
    };

    public getNotNull () {
        return (this.isNotNull) ? this.isNotNull : false;
    };

    public setNotNull (isNotNull) {
        this.isNotNull = isNotNull;
        return this;
    };

    public setGenerated (isGenerated) {
        this.isGenerated = isGenerated;
        return this;
    };

    public setExternalName (aExternalName) {
        this.externalName = aExternalName;
        return this;
    };

    public setAttrGroup (anAttrGroup) {
        this.attrGroup = anAttrGroup;
        return this;
    };

    public setPos (aPos) {
        this.pos = aPos;
        return this;
    };
}

export class JdyObjectReferenceInfo extends JdyAttributeInfo {
    private referencedClass: JdyClassInfo;
    private inAssociation: boolean;
    private dependent: boolean;

    public constructor (aInternalName: string, aExternalName: string, isKeyFlag: boolean, isNotNullFlag: boolean, aReferencedClass: JdyClassInfo) {
        super(aInternalName, aExternalName, isKeyFlag, isNotNullFlag);
        this.referencedClass = aReferencedClass;
        this.inAssociation = false;
        this.dependent = false;
        this.primitive = false;
    };

    public getReferencedClass () {
        return this.referencedClass;
    };

    public setIsDependent (isDependent) {
        this.dependent = isDependent;
        return this;
    };

    public setIsInAssociation (inAssociation) {
        this.inAssociation = inAssociation;
        return this;
    };
}

export class JdyPrimitiveAttributeInfo extends JdyAttributeInfo {

    private type: JdyPrimitiveType;

    public constructor (aInternalName: string, aExternalName: string, isKey: boolean, isNotNull: boolean, aType: JdyPrimitiveType) {
        super(aInternalName, aExternalName, isKey, isNotNull);
        this.type = aType;
        this.primitive = true;
    }

    public getType (): JdyPrimitiveType {
        return this.type;
    };
}

export enum JdyDataType {

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

    handleBoolean (aType: JdyBooleanType): boolean | null | void;

    handleDecimal (aType: JdyDecimalType): number | null | void;

    handleTimeStamp (aType: JdyTimeStampType): Date | null | void;

    handleFloat (aType: JdyFloatType): number | null | void;

    handleLong (aType: JdyLongType): number | null | void;

    handleText (aType: JdyTextType): string | null | void;

    handleVarChar (aType: JdyVarCharType): string | null | void;

    handleBlob (aType: JdyBlobType): object | null | void;
}

export abstract class JdyPrimitiveType {

    private $type: JdyDataType;

    public constructor ($type: JdyDataType) {
        this.$type = $type;
    }

    abstract handlePrimitiveKey (aHandler: JdyPrimitiveTypeVisitor);

    public getType () {
        return this.$type;
    }
}

export class JdyBlobType extends JdyPrimitiveType {

    private typeHint: string;

    public constructor (typeHint: string) {
        super(JdyDataType.JDY_BLOB);
        this.typeHint = typeHint;
    }

    public handlePrimitiveKey (aHandler: JdyPrimitiveTypeVisitor) {
        return aHandler.handleBlob(this);
    };
}

export class JdyFloatType extends JdyPrimitiveType {

    public constructor () {
        super(JdyDataType.JDY_FLOAT);
    }

    public handlePrimitiveKey (aHandler: JdyPrimitiveTypeVisitor) {
        return aHandler.handleFloat(this);
    };
}

export class JdyBooleanType extends JdyPrimitiveType {

    public constructor () {
        super(JdyDataType.JDY_BOOLEAN);
    }

    public handlePrimitiveKey (aHandler: JdyPrimitiveTypeVisitor) {
        return aHandler.handleBoolean(this);
    };
}

export class JdyLongType extends JdyPrimitiveType {

    private minValue: number;
    private maxValue: number;
    private domainValues: any;

    public constructor (aMinValue: number, aMaxValue: number, aDomainValueList) {
        super(JdyDataType.JDY_LONG);
        this.minValue = aMinValue;
        this.maxValue = aMaxValue;
        this.domainValues = aDomainValueList;
    }

    public handlePrimitiveKey (aHandler: JdyPrimitiveTypeVisitor) {
        return aHandler.handleLong(this);
    };

    public getMinValue () {
        return this.minValue;
    }

    public getMaxValue () {
        return this.maxValue;
    }
}

export class JdyDecimalType extends JdyPrimitiveType {

    private minValue: number;
    private maxValue: number;
    private scale: number;
    private domainValues: any;

    public constructor (aMinValue: number, aMaxValue: number, aScale: number, aDomainValueList) {
        super(JdyDataType.JDY_DECIMAL);
        this.minValue = aMinValue;
        this.maxValue = aMaxValue;
        this.scale = aScale;
        this.domainValues = aDomainValueList;
    }

    public handlePrimitiveKey (aHandler: JdyPrimitiveTypeVisitor) {
        return aHandler.handleDecimal(this);
    };

    public getMinValue () {
        return this.minValue;
    }

    public getMaxValue () {
        return this.maxValue;
    }

    public getScale () {
        return this.scale;
    }
}

export class JdyTextType extends JdyPrimitiveType {
    private length: number;
    private typeHint: JdyTextTypeHint | null;
    private domainValues: string[] | null | undefined;

    public constructor (aLength: number, aTypeHint: JdyTextTypeHint | null, aDomainValueList?: string[] | null) {
        super(JdyDataType.JDY_TEXT);
        this.length = aLength;
        this.typeHint = aTypeHint;
        this.domainValues = aDomainValueList;
    }

    public handlePrimitiveKey (aHandler: JdyPrimitiveTypeVisitor) {
        return aHandler.handleText(this);
    };

    public getLength (): number {
        return this.length;
    }

    public getTypeHint (): JdyTextTypeHint | null {
        return this.typeHint;
    }
}

export enum JdyTextTypeHint {

    EMAIL = 'EMAIL',
    TELEPHONE = 'TELEPHONE',
    URL = 'URL',
}

export class JdyTimeStampType extends JdyPrimitiveType {

    private datePartUsed: boolean;
    private timePartUsed: boolean;

    public constructor (isDatePartUsed: boolean, isTimePartUsed: boolean) {
        super(JdyDataType.JDY_TIMESTAMP);
        this.datePartUsed = isDatePartUsed;
        this.timePartUsed = isTimePartUsed;
    }

    public handlePrimitiveKey (aHandler: JdyPrimitiveTypeVisitor) {
        return aHandler.handleTimeStamp(this);
    };
}

export class JdyVarCharType extends JdyPrimitiveType {

    private length: number;
    private mimeType: null;
    private clob: boolean;

    public constructor (aLength: number, mimeType: string, isClobFlag: boolean) {
        super(JdyDataType.JDY_VARCHAR);
        this.length = aLength;
        this.mimeType = null;
        this.clob = isClobFlag;
    }

    public handlePrimitiveKey (aHandler: JdyPrimitiveTypeVisitor) {
        return aHandler.handleVarChar(this);
    };
}

export class JdyClassInfoQuery {

    private resultInfo: JdyClassInfo;
    private filterExpression: ObjectFilterExpression | null;

    public constructor (aTypeInfo: JdyClassInfo, aFilterExpr: ObjectFilterExpression | null) {
        this.resultInfo = aTypeInfo;
        this.filterExpression = aFilterExpr;
    }

    public getResultInfo () {
        return this.resultInfo;
    };

    public matchesObject (aModel) {
        return this.filterExpression === null || this.filterExpression.matchesObject(aModel);
    };

    public getFilterExpression () {
        return this.filterExpression;
    };

    public setFilterExpression (aExpression) {
        this.filterExpression = aExpression;
    };
}

export class ObjectFilterExpression {

    private $exprType: string;

    public constructor (aType: string) {
        this.$exprType = aType;
    }

    public matchesObject (aModel): boolean {
        return true;
    }

    public visit (aModel): void {
    }
}

export class JdyAndExpression extends ObjectFilterExpression {

    public expressionVect: ObjectFilterExpression[];

    public constructor (aExprVect: ObjectFilterExpression[]) {
        super('AndExpression');
        this.expressionVect = aExprVect;
    }

    public visit (aVisitor) {
        return aVisitor.visitAndExpression(this);
    };

    public matchesObject (aModel) {
        let matches = true;
        for (let i = 0; i < this.expressionVect.length; i++) {
            matches = this.expressionVect[i].matchesObject(aModel);
        }
        return matches;
    };
}

export class JdyOrExpression extends ObjectFilterExpression {

    private expressionVect: ObjectFilterExpression[];

    public constructor (aExprVect: ObjectFilterExpression[]) {
        super('OrExpression');

        this.expressionVect = aExprVect;
    }

    public visit (aVisitor) {
        return aVisitor.visitOrExpression(this);
    };

    public matchesObject (aModel) {
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

    public constructor (aOperator: ExpressionPrimitiveOperator, aAttributeInfo: JdyAttributeInfo, aCompareValue) {
        super('OperatorExpression');
        this.myOperator = aOperator;
        this.attributeInfo = aAttributeInfo;
        this.compareValue = aCompareValue;
    }

    public visit (aVisitor) {
        return aVisitor.visitOperatorExpression(this);
    };

    public matchesObject (aModel) {
        let modelValue = aModel.getValue(this.attributeInfo);
        return this.myOperator.compareValues(modelValue, this.compareValue, this.attributeInfo);
    };

    public getOperator () {
        return this.myOperator;
    };

}

export class ExpressionPrimitiveOperator {

    public visitOperatorHandler (aVisitor) {
        return aVisitor.visitEqualOperator(this);
    };

    public compareValues (value1, value2, attributeInfo): boolean {
        return true;
    }
}

export class JdyEqualOperator extends ExpressionPrimitiveOperator {

    private isNotEqual: boolean;

    public constructor (notEqual: boolean) {
        super();
        this.isNotEqual = notEqual;
    }

    public visitOperatorHandler (aVisitor) {
        return aVisitor.visitEqualOperator(this);
    };

    public compareValues (value1, value2, attributeInfo) {
        let result = false;
        if (value1 !== null && value2 !== null) {
            result = attributeInfo.compareObjects(value1, value2) === 0;
            if (this.isNotEqual) {
                result = !result;
            }
        }
        return result;
    };

    public toString () {
        return (this.isNotEqual) ? '<>' : '=';
    };
}

export class JdyGreatorOperator extends ExpressionPrimitiveOperator {

    private isAlsoEqual: boolean;

    public constructor (alsoEqual: boolean) {
        super();
        this.isAlsoEqual = alsoEqual;
    }

    public visitOperatorHandler (aVisitor) {
        return aVisitor.visitGreatorOperator(this);
    };

    public compareValues (value1, value2, attributeInfo) {
        let result = false;
        if (value1 !== null && value2 !== null) {
            result = attributeInfo.compareObjects(value1, value2) > 0;
            if (this.isAlsoEqual) {
                result = result && attributeInfo.compareObjects(value1, value2) === 0;
            }
        }
        return result;
    };

    public toString () {
        return (this.isAlsoEqual) ? '>=' : '>';
    };

}

export class JdyLessOperator extends ExpressionPrimitiveOperator {

    private isAlsoEqual: boolean;

    public constructor (alsoEqual: boolean) {
        super();
        this.isAlsoEqual = alsoEqual;
    }

    public visitOperatorHandler (aVisitor) {
        return aVisitor.visitLessOperator(this);
    };

    public compareValues (value1, value2, attributeInfo) {
        let result = false;
        if (value1 !== null && value2 !== null) {
            result = attributeInfo.compareObjects(value1, value2) < 0;
            if (this.isAlsoEqual) {
                result = result && attributeInfo.compareObjects(value1, value2) === 0;
            }
        }
        return result;
    };

    public toString () {
        return (this.isAlsoEqual) ? '<=' : '<';
    };
}

export class JdyFilterCreationException extends Error {

    public constructor (m: string) {
        super(m);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, JdyValidationError.prototype);
    }
}

export class JdyPersistentException extends Error {

    public constructor (m: string) {
        super(m);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, JdyValidationError.prototype);
    }
}

export class JdyQueryCreator {

    protected resultInfo: JdyClassInfo;
    private createdExpr: ObjectFilterExpression | null;

    public constructor (aResultInfo: JdyClassInfo) {
        this.resultInfo = aResultInfo;
        this.createdExpr = null;
    }

    public query (): JdyClassInfoQuery {
        return new JdyClassInfoQuery(this.resultInfo, this.createdExpr);
    };

    public greater (anExAttrName, aCompareValue) {
        this.addOperatorExpression(anExAttrName, aCompareValue, new JdyGreatorOperator(false));
        return this;
    };

    public greaterOrEqual (anExAttrName, aCompareValue) {
        this.addOperatorExpression(anExAttrName, aCompareValue, new JdyGreatorOperator(true));
        return this;
    };

    public less (anExAttrName, aCompareValue) {
        this.addOperatorExpression(anExAttrName, aCompareValue, new JdyLessOperator(false));
        return this;
    };

    public lessOrEqual (anExAttrName, aCompareValue) {
        this.addOperatorExpression(anExAttrName, aCompareValue, new JdyLessOperator(true));
        return this;
    };

    public equal (anExAttrName, aCompareValue) {
        this.addOperatorExpression(anExAttrName, aCompareValue, new JdyEqualOperator(false));
        return this;
    };

    public notEqual (anExAttrName, aCompareValue) {
        this.addOperatorExpression(anExAttrName, aCompareValue, new JdyEqualOperator(true));
        return this;
    };

    public addOperatorExpression (anAttrName: string, aCompareValue, aOperator: ExpressionPrimitiveOperator) {
        let attributeInfo: JdyAttributeInfo = this.resultInfo.getAttr(anAttrName);
        let opExpr = new JdyOperatorExpression(aOperator, attributeInfo, aCompareValue);
        this.addExpression(opExpr);
        return this;
    };

    public addExpression (anExpr: ObjectFilterExpression): JdyQueryCreator {
        this.createdExpr = anExpr;
        return this;
    };

    public and () {
        return new JdyAndQueryCreator(this.resultInfo, this);
    };

    public or () {
        return new JdyOrQueryCreator(this.resultInfo, this);
    };

    public end (): JdyQueryCreator {
        throw new JdyFilterCreationException('No Multiple Expression open');
    };
}

export class JdyAndQueryCreator extends JdyQueryCreator {

    private parentCreator: JdyQueryCreator;
    private expressions: ObjectFilterExpression[];

    public constructor (aResultInfo: JdyClassInfo, aParentCreator: JdyQueryCreator) {
        super(aResultInfo);
        // JdyAttributeInfo.apply(this, arguments);
        this.parentCreator = aParentCreator;
        this.expressions = [];
    }

    public addExpression (anExpr: ObjectFilterExpression): JdyQueryCreator {
        this.expressions.push(anExpr);
        return this;
    };

    public query (): JdyClassInfoQuery {
        throw new JdyFilterCreationException('And not closes');
    };

    public end () {
        this.parentCreator.addExpression(new JdyAndExpression(this.expressions));
        return this.parentCreator;
    };
}

export class JdyOrQueryCreator extends JdyQueryCreator {

    private parentCreator: JdyQueryCreator;
    private expressions: ObjectFilterExpression[];

    public constructor (aResultInfo, aParentCreator) {
        super(aResultInfo);
        // JdyAttributeInfo.apply(this, arguments);
        this.parentCreator = aParentCreator;
        this.expressions = [];
    }

    public addExpression (anExpr): JdyQueryCreator {
        this.expressions.push(anExpr);
        return this;
    };

    public query (): JdyClassInfoQuery {
        throw new JdyFilterCreationException('Or not closes');
    };

    public end () {
        this.parentCreator.addExpression(new JdyOrExpression(this.expressions));
        return this.parentCreator;
    };
}

export interface JdyObjectList {

    done (anCallback);

    add (anValueObject);
}

export class JdyObjectListImpl implements JdyObjectList {

    private assocObj: JdyAssociationModel;
    private objects: any[] = [];

    public constructor (anAssocInfo: JdyAssociationModel) {

        this.assocObj = anAssocInfo;
    }

    public done (anCallback) {
        anCallback(this.objects);
    }

    public add (anValueObject) {
        this.objects.push(anValueObject);
    }

};

export class JdyProxyObjectList implements JdyObjectList {

    private objects: any[] = [];
    private assocObj: JdyAssociationModel;
    private proxyResolver;
    private masterObject: JdyTypedValueObject;
    private promise: null | any;

    public constructor (anAssocInfo: JdyAssociationModel, aProxyResolver: any, aMasterObj: JdyTypedValueObject) {

        this.assocObj = anAssocInfo;
        this.masterObject = aMasterObj;
        this.proxyResolver = aProxyResolver;
    }

    public done (anCallback) {
        let dfrd;
        let that = this;

        if (!this.promise) {

            this.promise = new Promise((resolve, reject) => {
                resolve(123);
            });

            if (this.proxyResolver) {

                this.proxyResolver.resolveAssoc(that.assocObj, that.masterObject, aAssocList => {
                    this.objects = aAssocList;
                    this.promise.resolve(aAssocList);
                });
            } else {
                this.promise.reject('Proxy Error: no proxy resolver ' + this.assocObj.getAssocName());
            }
        }

        this.promise.done(anCallback);
    }

    public add (anValueObject) {
        this.objects.push(anValueObject);
    }

};

export class JdyTypedValueObject {

    public $typeInfo: JdyClassInfo;
    public $assocs: { [name: string]: JdyObjectList } = {};
    private $proxyResolver;
    private $proxy: any = null;

    public constructor (aClassInfo: JdyClassInfo, aProxyResolver: any | null, asProxy: boolean) {

        this.$typeInfo = aClassInfo;
        this.$proxyResolver = aProxyResolver;

        if (asProxy) {
            this.$proxy = {};
        }

        aClassInfo.forEachAttr(
            curAttrInfo => {
                this[curAttrInfo.getInternalName()] = null;
            }
        );

        aClassInfo.forEachAssoc(
            curAssocInfo => {
                if (aProxyResolver) {
                    this.$assocs[curAssocInfo.getAssocName()] = new JdyProxyObjectList(curAssocInfo, aProxyResolver, this);
                } else {
                    this.$assocs[curAssocInfo.getAssocName()] = new JdyObjectListImpl(curAssocInfo);
                }
            }
        );
    }

    public setAssocVals (anAssoc, anObjectList: JdyObjectList) {

        let assocName = (typeof anAssoc === 'string') ? anAssoc : anAssoc.getAssocName();
        this.$assocs[assocName] = anObjectList;
    };

    public assocVals (anAssoc): JdyObjectList {

        let assocName = (typeof anAssoc === 'string') ? anAssoc : anAssoc.getAssocName();
        let assocObj = this.$assocs[assocName];
        return assocObj;
    };

    public val (anAttr) {

        return this[(typeof anAttr === 'string') ? anAttr : anAttr.getInternalName()];
    };

    public setVal (anAttr, aValue) {

        if (typeof anAttr === 'string') {
            this[anAttr] = aValue;
        } else {
            this[anAttr.getInternalName()] = aValue;
        }
    };

    public setProxyVal (anAttr, aValue) {

        this.$proxy[anAttr.getInternalName()] = aValue;
    };

};
