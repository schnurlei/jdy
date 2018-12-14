import './jdy-base';
import {
	JdyAndExpression, JdyAssociationModel,
	JdyClassInfo, JdyFilterCreationException, JdyObjectListImpl,
	JdyRepository,
	JdyTypedValueObject, JdyValidationError,
	ObjectFilterExpression
} from "@/js/jdy/jdy-base";


export const META_REPO_NAME= "ApplicationRepository";

const TextMimeType= [{dbValue:"XML", representation:"text/xml"},
						{dbValue:"HTML", representation:"text/html"},
						{dbValue:"PLAIN", representation:"text/plain"}];
const TypeHint= [{dbValue:"TELEPHONE", representation:"TELEPHONE"},
						{dbValue:"URL", representation:"URL"},
						{dbValue:"EMAIL", representation:"EMAIL"}];

function createAppRepository() {

	let appRep: JdyRepository = new JdyRepository("ApplicationRepository");

	let repositoryModel : JdyClassInfo = appRep.addClassInfo("AppRepository", null).setShortName("REP");
	repositoryModel.addTextAttr("Name", 100).setNotNull(true);
	repositoryModel.addTextAttr("applicationName", 100).setIsKey(true).setGenerated(true);
	repositoryModel.addLongAttr("appVersion" ,0, 9999999).setGenerated(true).setNotNull(true);
	repositoryModel.addBooleanAttr("closed" ).setGenerated(true);

	let classInfoModel : JdyClassInfo  = appRep.addClassInfo("AppClassInfo", null).setShortName("CLM");
	classInfoModel.addTextAttr("Name", 30).setNotNull(true);
	classInfoModel.addTextAttr("InternalName", 35).setIsKey(true).setExternalName("Internal").setGenerated(true);
	classInfoModel.addBooleanAttr("isAbstract").setNotNull(true);
	classInfoModel.addTextAttr("NameSpace", 100).setNotNull(true);
	classInfoModel.addVarCharAttr("beforeSaveScript", 4000);

	let attributeInfoModel : JdyClassInfo = appRep.addClassInfo("AppAttribute", null).setShortName("ATM").setAbstract(true);
	attributeInfoModel.addTextAttr("Name", 30).setNotNull(true);
	attributeInfoModel.addTextAttr("InternalName", 35).setIsKey(true).setGenerated(true);
	attributeInfoModel.addBooleanAttr("isKey").setNotNull(true);
	attributeInfoModel.addBooleanAttr("isNotNull").setNotNull(true);
	attributeInfoModel.addBooleanAttr("isGenerated").setNotNull(true);
	attributeInfoModel.addTextAttr("AttrGroup", 100);
	attributeInfoModel.addLongAttr("pos", 0, 999999999).setNotNull(true);

	let primitiveAttribute : JdyClassInfo = appRep.addClassInfo("AppPrimitiveAttribute", attributeInfoModel).setShortName("PAM").setAbstract(true);

    let objectReferenceInfoModel : JdyClassInfo  = appRep.addClassInfo("AppObjectReference", attributeInfoModel).setShortName("ORM");
	objectReferenceInfoModel.addReference("referencedClass", classInfoModel).setNotNull(true);
	objectReferenceInfoModel.addBooleanAttr("isInAssociation").setNotNull(true).setGenerated(true);
	objectReferenceInfoModel.addBooleanAttr("isDependent").setNotNull(true).setGenerated(false);

    let associationInfoModel : JdyClassInfo = appRep.addClassInfo("AppAssociation", null).setShortName("AIM");
	associationInfoModel.addTextAttr("Name", 40).setNotNull(true);
	associationInfoModel.addTextAttr("nameResource", 45).setIsKey(true).setGenerated(true);
	associationInfoModel.addReference("masterClassReference", objectReferenceInfoModel).setNotNull(true).setIsDependent(true);

    let booleanTypeModel : JdyClassInfo  = appRep.addClassInfo("AppBooleanType", primitiveAttribute).setShortName("BTM");
	booleanTypeModel.addLongAttr("temp", 0, 999999999);

    let blobTypeModel : JdyClassInfo  = appRep.addClassInfo("AppBlobType", primitiveAttribute).setShortName("BLTM");
	blobTypeModel.addLongAttr("TypeHintId", 0, 999999999);

    let decimalTypeModel : JdyClassInfo  = appRep.addClassInfo("AppDecimalType", primitiveAttribute).setShortName("CUM");
	decimalTypeModel.addLongAttr("Scale", 0, 10);
	decimalTypeModel.addDecimalAttr("MinValue", -999999999.99999, 999999999.99999, 3);
	decimalTypeModel.addDecimalAttr("MaxValue", -999999999.99999, 999999999.99999, 3);

    let decimalDomainValuesModel : JdyClassInfo  = appRep.addClassInfo("AppDecimalDomainModel", null).setShortName("DDM");
	decimalDomainValuesModel.addTextAttr("representation", 100);
	decimalDomainValuesModel.addDecimalAttr("dbValue", Number.MIN_VALUE, Number.MAX_VALUE, 3).setIsKey(true);

    let longDomainValuesModel : JdyClassInfo  = appRep.addClassInfo("AppLongDomainModel", null).setShortName("LDM");
	longDomainValuesModel.addTextAttr("representation", 100);
	longDomainValuesModel.addLongAttr("dbValue", -999999999, 99999999).setIsKey(true);

    let stringDomainValuesModel : JdyClassInfo = appRep.addClassInfo("AppStringDomainModel", null).setShortName("SDM");
	stringDomainValuesModel.addTextAttr("representation", 100);
	stringDomainValuesModel.addTextAttr("dbValue", 100).setIsKey(true);


    let floatTypeModel : JdyClassInfo  = appRep.addClassInfo("AppFloatType", primitiveAttribute).setShortName("FTM");
	floatTypeModel.addLongAttr("Scale", 0, 20);
	floatTypeModel.addLongAttr("MaxValue", -999999999.99999, 99999999.99999);

    let longTypeModel : JdyClassInfo  = appRep.addClassInfo("AppLongType", primitiveAttribute).setShortName("LTM");
	longTypeModel.addLongAttr("MinValue", -999999999, 99999999);
	longTypeModel.addLongAttr("MaxValue", -999999999, 99999999);

    let textTypeModel : JdyClassInfo  = appRep.addClassInfo("AppTextType", primitiveAttribute).setShortName("TXM");
	textTypeModel.addLongAttr("length", 1, 1000).setNotNull(true);
	textTypeModel.addTextAttr("typeHint", 20, ['TELEPHONE', 'EMAIL', 'URL']).setNotNull(false);

    let timestampTypeModel : JdyClassInfo = appRep.addClassInfo("AppTimestampType", primitiveAttribute).setShortName("TSM");
	timestampTypeModel.addBooleanAttr("isDatePartUsed").setNotNull(true);
	timestampTypeModel.addBooleanAttr("isTimePartUsed").setNotNull(true);

	let varcharTypeModel : JdyClassInfo = appRep.addClassInfo("AppVarCharType", primitiveAttribute).setShortName("VCM");
	varcharTypeModel.addLongAttr("length", 1, Number.MAX_VALUE);
	varcharTypeModel.addBooleanAttr("isClob").setNotNull(true);
	varcharTypeModel.addTextAttr("mimeType", 20, ['text/xml','text/html', 'text/plain']).setNotNull(false);

	appRep.addAssociation("Attributes", classInfoModel, attributeInfoModel, "Masterclass", "Masterclass", true, true, true);
	appRep.addAssociation("Associations", classInfoModel, associationInfoModel, "Masterclass", "Masterclass", false, true, true);
	appRep.addAssociation("Subclasses", classInfoModel, classInfoModel, "Superclass", "Superclass", false, false, true);
	appRep.addAssociation("Classes", repositoryModel, classInfoModel, "Repository", "Repository", true, true, true);

	appRep.addAssociation("DomainValues", decimalTypeModel, decimalDomainValuesModel, "Type", "Type", true, true, true);
	appRep.addAssociation("DomainValues", textTypeModel, stringDomainValuesModel, "Type", "Type", true, true, true);
	appRep.addAssociation("DomainValues", longTypeModel, longDomainValuesModel, "Type", "Type", true, true, true);

	return appRep;
};

function convertAppRepositoryToRepository(appRepository, callback) {

	appRepository.assocVals("Classes").done( function(appClassInfos: Array<any>) {

	    let newRepository : JdyRepository = new JdyRepository(appRepository.applicationName);
		let	allPromises: Promise<null>[] = [];
		let	i : number;

	    for (i = 0; i < appClassInfos.length; i++) {
		    let appClassInfo = appClassInfos[i];
		    newRepository.addClassInfo(appClassInfo.InternalName, null).setAbstract(appClassInfo.isAbstract);
	    }

	    for (i = 0; i < appClassInfos.length; i++) {
			let appClassInfo : any = appClassInfos[i];
		    allPromises.push(buildAttrForMetaRepo(newRepository, appClassInfo));
	    }

	    for (i = 0; i < appClassInfos.length; i++) {
			let appClassInfo = appClassInfos[i];
		    allPromises.push(buildAssocsForMetaRepo(newRepository, appClassInfo));
	    }

	    for (i = 0; i < appClassInfos.length; i++) {
			let appClassInfo = appClassInfos[i];
		    buildSubclassesForMetaRepo(newRepository, appClassInfo);
	    }
	    
	    Promise.all(allPromises).then(callback(newRepository));
	});
};

function addClassToMetaRepo (metaRepo, anAppClassInfo) {

	var newMetaClass = metaRepo.addClassInfo(anAppClassInfo.InternalName).setAbstract(anAppClassInfo.isAbstract);
	newMetaClass.setAbstract(anAppClassInfo.isAbstract);
	newMetaClass.setExternalName(anAppClassInfo.InternalName);
	newMetaClass.setShortName(anAppClassInfo.InternalName);
};

function buildAssocsForMetaRepo (metaRepo, anAppClassInfo) : Promise<null>	{

	var dfrd : Promise<null> = new Promise( (resolve, reject) => {

		anAppClassInfo.assocVals("Associations").done(function (appAssocs) {

			var i,
				appAssoc,
				metaMasterClass,
				metaClass = metaRepo.getClassInfo(anAppClassInfo.InternalName),
				metaMasterClassRef,
				appAssocName,
				metaAssoc;

			for (i = 0; i < appAssocs.length; i++) {

				appAssoc = appAssocs[i];

				metaMasterClass = metaRepo.getClassInfo(appAssoc.masterClassReference.Masterclass.InternalName);
				metaMasterClassRef = metaMasterClass.getAttr(appAssoc.masterClassReference.InternalName);
				appAssocName = appAssoc.NameResource;
				metaAssoc = new JdyAssociationModel(metaMasterClassRef, metaMasterClass, appAssocName);
				metaClass.addAssociation(metaAssoc);
			}
			resolve();
		});
	});

	return dfrd;
};

function getDetailClass(anAssoc)	{
	return (anAssoc.masterClassReference === null) ? null : anAssoc.masterClassReference.Masterclass;
};

function buildSubclassesForMetaRepo(metaRepo, anAppClassInfo)	{

	var metaClass = metaRepo.getClassInfo(anAppClassInfo.InternalName),
		appSuper = anAppClassInfo.Superclass,
		metaSuper;

	if(appSuper) {
		metaSuper = metaRepo.getClassInfo(appSuper.InternalName);
		metaSuper.addSubclass(metaClass);
	}
};

function buildAttrForMetaRepo(metaRepo : JdyRepository , anAppClassInfo: any): Promise<null>	{

    let metaClass : JdyClassInfo | null = metaRepo.getClassInfo(anAppClassInfo.InternalName);

	var i,j,
		appAttr,
		metaAttr,
		refClass;

    var dfrd : Promise<null> = new Promise( (resolve, reject) => {

		anAppClassInfo.assocVals("Attributes").done(function (appAttributes) {

			var appDomainVals,
				domainVals;

			for (i = 0; i < appAttributes.length; i++) {

				appAttr = appAttributes[i];

				switch (appAttr.$typeInfo.internalName) {

					case 'AppBooleanType':
						metaAttr = (metaClass) ? metaClass.addBooleanAttr(appAttr.InternalName) : null;
						break;
					case 'AppBlobType':
						metaAttr = (metaClass) ? metaClass.addBlobAttr(appAttr.InternalName) : null;
						break;
					case 'AppDecimalType':
						appDomainVals = appAttr.assocVals("DomainValues");
						domainVals = [];
						if (appDomainVals) {
							for (j = 0; j < appDomainVals.length; j++) {
								domainVals.push({
									dbValue: appDomainVals[j].dbValue,
									representation: appDomainVals[j].representation
								});
							}
						}
						metaAttr = (metaClass) ? metaClass.addDecimalAttr(appAttr.InternalName, appAttr.MinValue, appAttr.MaxValue, appAttr.Scale, domainVals) : null;
						break;
					case 'AppFloatType':
						metaAttr = (metaClass) ? metaClass.addFloatAttr(appAttr.InternalName) : null;
						break;
					case 'AppLongType':
						appDomainVals = appAttr.assocVals("DomainValues");
						domainVals = [];
						if (appDomainVals) {
							for (j = 0; j < appDomainVals.length; j++) {
								domainVals.push({
									dbValue: appDomainVals[j].dbValue,
									representation: appDomainVals[j].representation
								});
							}
						}
						metaAttr = (metaClass) ? metaClass.addLongAttr(appAttr.InternalName, appAttr.MinValue, appAttr.MaxValue, domainVals) : null;

						break;
					case 'AppTextType':
						appDomainVals = appAttr.assocVals("DomainValues");
						domainVals = [];
						if (appDomainVals) {
							for (j = 0; j < appDomainVals.length; j++) {
								domainVals.push({
									dbValue: appDomainVals[j].dbValue,
									representation: appDomainVals[j].representation
								});
							}
						}

						metaAttr = (metaClass) ? metaClass.addTextAttr(appAttr.InternalName, appAttr.length, domainVals) : null;
						break;
					case 'AppTimestampType':
						metaAttr = (metaClass) ? metaClass.addTimeStampAttr(appAttr.InternalName, appAttr.isDatePartUsed, appAttr.isTimePartUsed) : null;
						break;
					case 'AppVarCharType':
						metaAttr = (metaClass) ? metaClass.addVarCharAttr(appAttr.InternalName, appAttr.length) : null;
						break;
					case 'AppObjectReference':

						refClass = metaRepo.getClassInfo(appAttr.referencedClass.InternalName);
						if (metaClass) {
							metaAttr = metaClass.addReference(appAttr.InternalName, refClass);
							metaAttr.setIsDependent(appAttr.isDependent);
							metaAttr.setIsInAssociation(appAttr.isInAssociation);
						}
						break;
					default:
						reject("Invalid type: " + appAttr.$typeInfo.internalName);
				}

				metaAttr.setIsKey(appAttr.isKey).setNotNull(appAttr.isNotNull).setGenerated(appAttr.isGenerated);
				metaAttr.setPos(appAttr.pos).setAttrGroup(appAttr.attrGroup);
			}

			resolve();
		});
	});

	return dfrd;
};



function createFilterRepository () : JdyRepository {
	"use strict";
	var filterRep = new JdyRepository("FilterRepository");


	let filterExprModel = filterRep.addClassInfo("AppFilterExpr", null).setShortName("FEX");
	filterExprModel.addLongAttr("ExprId" ,0, 999999999).setIsKey(true).setNotNull(true).setGenerated(true);

    let andExprModel = filterRep.addClassInfo("AppAndExpr",filterExprModel).setShortName("FEA");
	andExprModel.addTextAttr("ExprName" , 100);

    let orExprModel = filterRep.addClassInfo("AppOrExpr",filterExprModel).setShortName("FEO");
	orExprModel.addTextAttr("ExprName" , 100);

    let primitveOperatorModel = filterRep.addClassInfo("AppPrimitiveOperator", null).setShortName("FPO");
	primitveOperatorModel.addLongAttr("OperatorId" ,0, 999999999).setIsKey(true).setNotNull(true).setGenerated(true);

    let operatorEqualModel = filterRep.addClassInfo("AppOperatorEqual",primitveOperatorModel).setShortName("FPE");
	operatorEqualModel.addBooleanAttr("isNotEqual").setNotNull(true);

    let operatorGreaterModel = filterRep.addClassInfo("AppOperatorGreater",primitveOperatorModel).setShortName("FPG");
	operatorGreaterModel.addBooleanAttr("isAlsoEqual").setNotNull(true);

    let operatorLessModel = filterRep.addClassInfo("AppOperatorLess",primitveOperatorModel).setShortName("FPL");
	operatorLessModel.addBooleanAttr("isAlsoEqual").setNotNull(true);

    let operatorExprModel = filterRep.addClassInfo("AppOperatorExpr",filterExprModel).setShortName("OEX");
	operatorExprModel.addTextAttr("attrName" , 100).setNotNull(true);
	operatorExprModel.addReference("operator", primitveOperatorModel).setIsDependent(true).setNotNull(true);
	operatorExprModel.addBooleanAttr("booleanVal"); 
	operatorExprModel.addDecimalAttr("decimalVal", 999999999.9999999,999999999.9999999,9); 
	operatorExprModel.addFloatAttr("floatVal"); 
	operatorExprModel.addLongAttr("longVal", -999999999, 999999999); 
	operatorExprModel.addTextAttr("textVal",1000); 
	operatorExprModel.addTimeStampAttr("timestampVal",true,true);

    let classInfoQueryModel = filterRep.addClassInfo("AppQuery", null).setShortName("FQM");
	classInfoQueryModel.addLongAttr("FilterId" ,0, 999999999).setIsKey(true).setNotNull(true).setGenerated(true);
	classInfoQueryModel.addTextAttr("repoName" ,100).setNotNull(true);
	classInfoQueryModel.addTextAttr("className" , 35).setNotNull(true);
	classInfoQueryModel.addReference("expr", filterExprModel);

	filterRep.addAssociation("andSubExpr", andExprModel, filterExprModel, andExprModel.getInternalName(), andExprModel.getInternalName(),false, false,true);
	filterRep.addAssociation("orSubExpr", orExprModel, filterExprModel, orExprModel.getInternalName(), orExprModel.getInternalName(),false, false,true);

	return filterRep;
};

export class FilterCreator {
	
	rep : JdyRepository = createFilterRepository();
	idCounter : number=0;
	curExpr : JdyTypedValueObject | null = null;

	convertMetaFilter2AppFilter (metaQuery) {

		let classInfo: JdyClassInfo | null = this.rep.getClassInfo("AppQuery");
		if(classInfo) {
			let queryObj : JdyTypedValueObject;
			queryObj = new JdyTypedValueObject(classInfo, null, false);
			queryObj.setVal('FilterId',this.idCounter++);
			queryObj.setVal('repoName',  metaQuery.resultType.getRepoName());
			queryObj.setVal('className', metaQuery.resultType.getInternalName());
			if(metaQuery.getFilterExpression()) {
				queryObj.setVal('expr', this.createAppExpr(metaQuery.getFilterExpression()));
			} else {
				queryObj.setVal('expr', null);
			}
			return queryObj;
		} else {
			return null;
		}

	};

	createAppExpr ( aMetaExpr) {

		aMetaExpr.visit(this);
		var result = this.curExpr;
		return result;
	};

	visitOrExpression (aOrExpr) {

		let classInfo: JdyClassInfo | null = this.rep.getClassInfo("AppOrExpr");
		if(classInfo) {
			var orExpr = new JdyTypedValueObject(classInfo, null, false),
				subExprs = new JdyObjectListImpl(classInfo.getAssoc('orSubExpr')),
				i;

			orExpr.setVal('ExprId', this.idCounter++);

			for (i = 0; i < aOrExpr.expressionVect.length; i++) {
				let subMetaexpr = aOrExpr.expressionVect[i];
				let subAppExpr = this.createAppExpr(subMetaexpr);
				if(subAppExpr) {
					subAppExpr.setVal('AppOrExpr', orExpr);
					subExprs.add(subAppExpr);
				}
			}
			orExpr.$assocs['orSubExpr']  = subExprs;
			this.curExpr = orExpr;
		}
    };

    visitAndExpression (aAndExpr: JdyAndExpression){

		let classInfo: JdyClassInfo | null = this.rep.getClassInfo("AppAndExpr");
		if(classInfo) {
			var andExpr = new JdyTypedValueObject(classInfo, null, false),
				subExprs = new JdyObjectListImpl(classInfo.getAssoc('andSubExpr')),
				i;

			andExpr.setVal('ExprId', this.idCounter++);

			for (i = 0; i < aAndExpr.expressionVect.length; i++) {
				let subMetaexpr: ObjectFilterExpression = aAndExpr.expressionVect[i];
				let subAppExpr = this.createAppExpr(subMetaexpr);
				if(subAppExpr) {
					subAppExpr.setVal('AppAndExpr', andExpr);
					subExprs.add(subAppExpr);
				}
			}

			andExpr.$assocs['andSubExpr'] = subExprs;
			this.curExpr = andExpr;
		}
    };


    visitOperatorExpression ( aOpExpr) {

		let classInfo: JdyClassInfo | null = this.rep.getClassInfo("AppOperatorExpr");
		if(classInfo) {
			var appOpExpr = new JdyTypedValueObject(classInfo, null, false);
			appOpExpr.setVal('ExprId', this.idCounter++);
			appOpExpr.setVal('attrName', aOpExpr.attributeInfo.getInternalName());
			appOpExpr.setVal('operator', this.createAppOperator(aOpExpr.myOperator));
			this.setAppCompareValue(appOpExpr, aOpExpr);
			this.curExpr = appOpExpr;
		}
    };

    createAppOperator (aMetaOper) {

        return aMetaOper.visitOperatorHandler(this );
    };

    visitLessOperator (aOperator) {

		let classInfo: JdyClassInfo | null = this.rep.getClassInfo("AppOperatorLess");
		if(classInfo) {
			var appOp = new JdyTypedValueObject(classInfo, null, false);
			appOp.setVal('isAlsoEqual',  aOperator.isAlsoEqual);
			return appOp;
		}
    };

    visitGreatorOperator ( aOperator) {

		let classInfo: JdyClassInfo | null = this.rep.getClassInfo("AppOperatorGreater");
		if(classInfo) {
			var appOp = new JdyTypedValueObject(classInfo, null, false);
			appOp.setVal('isAlsoEqual',  aOperator.isAlsoEqual);
			return appOp;
		}
    };

    visitEqualOperator ( aOperator) {

		let classInfo: JdyClassInfo | null = this.rep.getClassInfo("AppOperatorEqual");
		if(classInfo) {
			var appOp = new JdyTypedValueObject(classInfo, null, false);
			appOp.setVal('isNotEqual', aOperator.isNotEqual);
			return appOp;
		}
    };

    setAppCompareValue ( appOpExpr,	aOpExpr) {

        switch(aOpExpr.attributeInfo.type.$type) {

            case 'BooleanType':
                appOpExpr.booleanVal = aOpExpr.compareValue;
                break;
            case 'BlobType':
                throw new JdyFilterCreationException("AppBlobType not supported");
                break;
            case 'DecimalType':
                appOpExpr.decimalVal = aOpExpr.compareValue;
                break;
            case 'FloatType':
                appOpExpr.floatVal = aOpExpr.compareValue;
                break;
            case 'LongType':
                appOpExpr.longVal = aOpExpr.compareValue;
                break;
            case 'TextType':
                appOpExpr.textVal = aOpExpr.compareValue;
                break;
            case 'TimestampType':
                appOpExpr.timestampVal = aOpExpr.compareValue;
                break;
            case 'VarCharType':
                throw new JdyFilterCreationException("AppVarCharType not supported");
                break;
            default:
                throw new JdyFilterCreationException("Invalid type: " + aOpExpr.attributeInfo.internalName);
        }

    };
};


function getAppWorkflowManager () {
	"use strict";
	
	return {
		getWorkflowStepsFor: function(aTypeInfo) {
			
			if (aTypeInfo.getInternalName() === "AppRepository") {
				return [{name:"Close Repository",action:"workflow.closeRepository"} , {name:"Open Repository",action:"workflow.openRepository"}];
			} else {
				return null;
			}
		}
	};
};

	