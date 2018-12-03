import './jdy-base';
import {JdyAndExpression, JdyClassInfo, JdyRepository, ObjectFilterExpression} from "@/js/jdy/jdy-base";


const META_REPO_NAME= "ApplicationRepository";

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
	textTypeModel.addTextAttr("typeHint", 20, JDY.meta.TypeHint).setNotNull(false);

    let timestampTypeModel : JdyClassInfo = appRep.addClassInfo("AppTimestampType", primitiveAttribute).setShortName("TSM");
	timestampTypeModel.addBooleanAttr("isDatePartUsed").setNotNull(true);
	timestampTypeModel.addBooleanAttr("isTimePartUsed").setNotNull(true);

	let varcharTypeModel : JdyClassInfo = appRep.addClassInfo("AppVarCharType", primitiveAttribute).setShortName("VCM");
	varcharTypeModel.addLongAttr("length", 1, Number.MAX_VALUE);
	varcharTypeModel.addBooleanAttr("isClob").setNotNull(true);
	varcharTypeModel.addTextAttr("mimeType", 20, JDY.meta.TextMimeType).setNotNull(false);

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

	appRepository.assocVals("Classes").done( function(appClassInfos) {

	    var newRepository : JdyRepository = new JdyRepository(appRepository.applicationName),
			appClassInfo,
			allPromises = [],
			i;

	    for (i = 0; i < appClassInfos.length; i++) {
		    appClassInfo = appClassInfos[i];		
		    newRepository.addClassInfo(appClassInfo.InternalName, null).setAbstract(appClassInfo.isAbstract);
	    }

	    for (i = 0; i < appClassInfos.length; i++) {
		    appClassInfo = appClassInfos[i];		
		    allPromises.push(buildAttrForMetaRepo(newRepository, appClassInfo));
	    }

	    for (i = 0; i < appClassInfos.length; i++) {
		    appClassInfo = appClassInfos[i];		
		    allPromises.push(buildAssocsForMetaRepo(newRepository, appClassInfo));
	    }

	    for (i = 0; i < appClassInfos.length; i++) {
		    appClassInfo = appClassInfos[i];		
		    buildSubclassesForMetaRepo(newRepository, appClassInfo);
	    }
	    
	    $.when.apply(allPromises).then(callback(newRepository));
	});
};

function addClassToMetaRepo (metaRepo, anAppClassInfo) {

	var newMetaClass = metaRepo.addClassInfo(anAppClassInfo.InternalName).setAbstract(anAppClassInfo.isAbstract);
	newMetaClass.setAbstract(anAppClassInfo.isAbstract);
	newMetaClass.setExternalName(anAppClassInfo.InternalName);
	newMetaClass.setShortName(anAppClassInfo.InternalName);
};

function buildAssocsForMetaRepo (metaRepo, anAppClassInfo)	{

	var dfrd = $.Deferred();

	anAppClassInfo.assocVals("Associations").done( function(appAssocs) {

		var i,
			appAssoc,
			metaMasterClass,
			metaClass = metaRepo.getClassInfo(anAppClassInfo.InternalName),
			metaMasterClassRef,
			appAssocName,
			metaAssoc;

		for (i = 0; i < appAssocs.length; i++) {

			appAssoc = appAssocs[i];

			metaMasterClass =  metaRepo.getClassInfo(appAssoc.masterClassReference.Masterclass.InternalName); 
			metaMasterClassRef = metaMasterClass.getAttr(appAssoc.masterClassReference.InternalName);
			appAssocName = appAssoc.NameResource;			
			metaAssoc = new JDY.base.AssociationModel(metaMasterClassRef, metaMasterClass, appAssocName);
			metaClass.addAssociation(metaAssoc);
		}
		dfrd.resolve();
	});
	
	return dfrd.promise();
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

function buildAttrForMetaRepo(metaRepo : JdyRepository , anAppClassInfo)	{

    let metaClass : JdyClassInfo | null = metaRepo.getClassInfo(anAppClassInfo.InternalName);

	var i,j,
		appAttr,
		metaAttr,
		refClass;

    var dfrd = $.Deferred();

	anAppClassInfo.assocVals("Attributes").done( function(appAttributes) {

		var appDomainVals,
			domainVals;

	    for (i = 0; i < appAttributes.length; i++) {

			appAttr = appAttributes[i];

			switch(appAttr.$typeInfo.internalName) {

				case 'AppBooleanType':
						metaAttr = metaClass.addBooleanAttr(appAttr.InternalName);
					break;
				case 'AppBlobType':
						metaAttr = metaClass.addBlobAttr(appAttr.InternalName);
					break;
				case 'AppDecimalType':
						appDomainVals = appAttr.assocVals("DomainValues");
						domainVals = [];
						if (appDomainVals) {
							for (j = 0; j < appDomainVals.length; j++) {
								domainVals.push({dbValue:appDomainVals[j].dbValue, representation:appDomainVals[j].representation});
							}
						}
						metaAttr = metaClass.addDecimalAttr(appAttr.InternalName, appAttr.MinValue , appAttr.MaxValue, appAttr.Scale, domainVals);
					break;
				case 'AppFloatType':
						metaAttr = metaClass.addFloatAttr(appAttr.InternalName);
					break;
				case 'AppLongType':
						appDomainVals = appAttr.assocVals("DomainValues");
						domainVals = [];
						if (appDomainVals) {
							for (j = 0; j < appDomainVals.length; j++) {
								domainVals.push({dbValue:appDomainVals[j].dbValue, representation:appDomainVals[j].representation});
							}
						}
						metaAttr = metaClass.addLongAttr(appAttr.InternalName, appAttr.MinValue , appAttr.MaxValue, domainVals);

					break;
				case 'AppTextType':
						appDomainVals = appAttr.assocVals("DomainValues");
						domainVals = [];
						if (appDomainVals) {
							for (j = 0; j < appDomainVals.length; j++) {
								domainVals.push({dbValue:appDomainVals[j].dbValue, representation:appDomainVals[j].representation});
							}
						}

						metaAttr = metaClass.addTextAttr(appAttr.InternalName, appAttr.length, domainVals);
					break;
				case 'AppTimestampType':
						metaAttr = metaClass.addTimeStampAttr(appAttr.InternalName, appAttr.isDatePartUsed, appAttr.isTimePartUsed);
					break;
				case 'AppVarCharType':
						metaAttr = metaClass.addVarCharAttr(appAttr.InternalName, appAttr.length);
					break;
				case 'AppObjectReference':

					refClass = metaRepo.getClassInfo(appAttr.referencedClass.InternalName);
					metaAttr = metaClass.addReference(appAttr.InternalName, refClass);
					metaAttr.setIsDependent(appAttr.isDependent);
					metaAttr.setIsInAssociation(appAttr.isInAssociation);
					break;
				default:
					throw new JDY.base.ValidationError("Invalid type: " + appAttr.$typeInfo.internalName);
			}

			metaAttr.setIsKey(appAttr.isKey).setNotNull(appAttr.isNotNull).setGenerated(appAttr.isGenerated);
			metaAttr.setPos(appAttr.pos).setAttrGroup(appAttr.attrGroup);
		}
		
		dfrd.resolve();
	});

	return dfrd.promise();
};



function createFilterRepository  () {
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
	
	rep = JDY.meta.createFilterRepository();
	idCounter=0;

};

JDY.meta.FilterCreator.prototype.convertMetaFilter2AppFilter = function(metaQuery) {
	
	var queryObj;
	queryObj = new JDY.base.TypedValueObject(this.rep.getClassInfo("AppQuery"));
	queryObj.FilterId = this.idCounter++;
	queryObj.repoName = metaQuery.resultType.getRepoName();
	queryObj.className = metaQuery.resultType.getInternalName();
	if(metaQuery.getFilterExpression()) {
		queryObj.expr = this.createAppExpr(metaQuery.getFilterExpression());
	} else {
		queryObj.expr = null;
	}

	return queryObj;
	
};

JDY.meta.FilterCreator.prototype.visitOrExpression = function(aOrExpr) {

	var orExpr = new JDY.base.TypedValueObject(this.rep.getClassInfo("AppOrExpr")),
		subExprs = [],
		subMetaexpr,
		subAppExpr,
		i;

	orExpr.ExprId = this.idCounter++;

	for (i = 0; i < aOrExpr.expressionVect.length; i++) {
		subMetaexpr = aOrExpr.expressionVect[i];
		subAppExpr = this.createAppExpr(subMetaexpr);
		subAppExpr.AppOrExpr = orExpr;
		subExprs.push(subAppExpr);
	}
	orExpr.$assocs.orSubExpr = subExprs;
	this.curExpr = orExpr;
};

JDY.meta.FilterCreator.prototype.createAppExpr =	function ( aMetaExpr) {
		
	aMetaExpr.visit(this);
	var result = this.curExpr;
	return result;
};

JDY.meta.FilterCreator.prototype.visitAndExpression = function(aAndExpr: JdyAndExpression){

	var andExpr = new JDY.base.TypedValueObject(this.rep.getClassInfo("AppAndExpr")),
		subExprs = [],
		i;

	andExpr.ExprId = this.idCounter++;

	for (i = 0; i < aAndExpr.expressionVect.length; i++) {
		let subMetaexpr : ObjectFilterExpression = aAndExpr.expressionVect[i];
		let subAppExpr = this.createAppExpr(subMetaexpr);
		subAppExpr.AppAndExpr = andExpr;
		subExprs.push(subAppExpr);
	}

	andExpr.$assocs.andSubExpr = subExprs;
	this.curExpr = andExpr;
};


JDY.meta.FilterCreator.prototype.visitOperatorExpression = function( aOpExpr) {

	var appOpExpr = new JDY.base.TypedValueObject(this.rep.getClassInfo("AppOperatorExpr")); 
	appOpExpr.ExprId = this.idCounter++;
	appOpExpr.attrName = aOpExpr.attributeInfo.getInternalName();
	appOpExpr.operator = this.createAppOperator(aOpExpr.myOperator);
	this.setAppCompareValue(appOpExpr, aOpExpr);
	this.curExpr = appOpExpr;
};

JDY.meta.FilterCreator.prototype.createAppOperator = function(aMetaOper) {

	return aMetaOper.visitOperatorHandler(this );
};

JDY.meta.FilterCreator.prototype.visitLessOperator = function(aOperator) {

	var appOp =  new JDY.base.TypedValueObject(this.rep.getClassInfo("AppOperatorLess"));
	appOp.isAlsoEqual = aOperator.isAlsoEqual;
	return appOp;
};
		
JDY.meta.FilterCreator.prototype.visitGreatorOperator = function( aOperator) {

	var appOp =  new JDY.base.TypedValueObject(this.rep.getClassInfo("AppOperatorGreater"));
	appOp.isAlsoEqual = aOperator.isAlsoEqual;
	return appOp;
};
		
JDY.meta.FilterCreator.prototype.visitEqualOperator = function( aOperator) {

	var appOp =  new JDY.base.TypedValueObject(this.rep.getClassInfo("AppOperatorEqual"));
	appOp.isNotEqual = aOperator.isNotEqual;
	return appOp;
};

JDY.meta.FilterCreator.prototype.setAppCompareValue = function( appOpExpr,	aOpExpr) {

	switch(aOpExpr.attributeInfo.type.$type) {

		case 'BooleanType':
				appOpExpr.booleanVal = aOpExpr.compareValue;
			break;
		case 'BlobType':
				throw new JDY.base.FilterCreationException("AppBlobType not supported");
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
				throw new JDY.base.FilterCreationException("AppVarCharType not supported");
			break;
		default:
			throw new JDY.base.FilterCreationException("Invalid type: " + appAttribute.$typeInfo.internalName);
	}

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

	