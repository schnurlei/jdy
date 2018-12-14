import {JdyPersistentException, JdyTypedValueObject} from "@/js/jdy/jdy-base";
import {META_REPO_NAME} from "@/js/jdy/jdy-meta";

class JsonHttpObjectReader {

	basepath;
	reader = new JDY.json.JsonFileReader();
	writer = new JDY.json.JsonFileWriter();
	filterCreator = new JDY.meta.FilterCreator();
	att2AbbrMap = {};
	jsonWriter;

	constructor(aBasePath, aMetaRepoName) {

		this.basepath = aBasePath;
		this.att2AbbrMap.repoName="rn";
		this.att2AbbrMap.className="cn";
		this.att2AbbrMap.expr="ex";
		this.att2AbbrMap.orSubExpr="ose";
		this.att2AbbrMap.andSubExpr="ase";
		this.att2AbbrMap.attrName="an";
		this.att2AbbrMap.operator="op";
		this.att2AbbrMap.isNotEqual="ne";
		this.att2AbbrMap.isAlsoEqual="ae";
		this.att2AbbrMap.longVal="lv";
		this.att2AbbrMap.textVal="tv";
		this.jsonWriter = new JDY.json.JsonCompactFileWriter(this.att2AbbrMap);

	}

	loadValuesFromDb(aFilter, successFunct, failFunc) {
		"use strict";

		var uri = this.createUriForClassInfo(aFilter.resultType, META_REPO_NAME, this.basepath),
			deferredCall,
			that = this,
			appQuery = this.filterCreator.convertMetaFilter2AppFilter(aFilter),
			expr;

		if (appQuery.expr) {
			expr = this.jsonWriter.writeObjectList( [appQuery.expr],JDY.json.Operation.INSERT);
			uri = uri +"?"+this.fixedEncodeURIComponent(JSON.stringify(expr));
		}

		deferredCall = this.createAjaxGetCall(uri);

		deferredCall.done(function (rtoData) {

			var resultObjects = that.reader.readObjectList(rtoData, aFilter.resultType);
			successFunct(resultObjects);
		});
		deferredCall.error(function (data) {
			if (failFunc) {
				failFunc();
			}
		});

	};

	fixedEncodeURIComponent = function (str) {
		return encodeURIComponent(str).replace(/[!'()]/g, escape).replace(/\*/g, "%2A");
	};

	createAjaxGetCall = function (aUrl) {
		"use strict";

		return $.ajax({
			url : aUrl,
			type : "GET",
			dataType: "json",
			contentType: "application/json"
		});
	};

};






class JsonHttpObjectWriter {

	basepath;
	reader = new JDY.json.JsonFileReader();
	writer = new JDY.json.JsonFileWriter();

	constructor(aBasePath, aMetaModelRepoName) {

		this.basepath = aBasePath;
	}

	deleteObjectInDb  (aObjToDelete, aClassInfo, successFunct, failFunc) {
		"use strict";

		var uri = JDY.http.createUriForClassInfo(aClassInfo, JDY.meta.META_REPO_NAME, this.basepath),
			params = JDY.http.createParametersFor(aObjToDelete, aClassInfo, "");

		uri = uri + "?" + $.param(params);
		this.sendJsonDeleteRequest(uri, successFunct, failFunc);
	};

	insertObjectInDb (aObjToInsert, successFunct, failFunc) {
		"use strict";

		var singleElementList = [],
			result,
			content,
			that = this;


		singleElementList.push(aObjToInsert);

		content = this.writer.writeObjectList(singleElementList, 'INSERT');

		function handleResult(rtoData) {

			result = that.reader.readObjectList(rtoData, aObjToInsert.$typeInfo);
			successFunct(result[0]);

		}
		this.sendJsonPostRequest(JDY.http.createUriForClassInfo(aObjToInsert.$typeInfo, JDY.meta.META_REPO_NAME, this.basepath),
			JSON.stringify(content),
			handleResult,
			failFunc);
	};

	updateObjectInDb (aObjToUpdate, successFunct, failFunc) {
		"use strict";

		var singleElementList = [],
			result,
			content,
			that = this;


		singleElementList.push(aObjToUpdate);

		content = this.writer.writeObjectList(singleElementList, 'UPDATE');

		function handleResult(rtoData) {

			result = that.reader.readObjectList(rtoData, aObjToUpdate.$typeInfo);
			successFunct(result[0]);

		}
		this.sendJsonPutRequest(createUriForClassInfo(aObjToUpdate.$typeInfo, META_REPO_NAME, this.basepath),
			JSON.stringify(content),
			handleResult,
			failFunc);
	};

	executeWorkflowAction = function (actionName, aObjToWorkOn, successFunct, failFunc) {
		"use strict";

		var singleElementList = [],
			result,
			content,
			that = this,
			uri;


		singleElementList.push(aObjToWorkOn);

		content = this.writer.writeObjectList(singleElementList, 'READ');

		function handleResult(rtoData) {

			result = that.reader.readObjectList(rtoData, aObjToWorkOn.$typeInfo);
			successFunct(result[0]);

		}

		uri = JDY.http.createUriForClassInfo(aObjToWorkOn.$typeInfo, JDY.meta.META_REPO_NAME, this.basepath);
		uri = uri +"?"+JDY.http.fixedEncodeURIComponent(actionName);
		this.sendJsonPutRequest(uri,
			JSON.stringify(content),
			handleResult,
			failFunc);

	};

	sendJsonPostRequest (uri, content, successFunct, failFunc) {
		"use strict";

		var deferredCall = this.createAjaxPostCall(uri, content);

		deferredCall.done(function (rtoData) {
			successFunct(rtoData);
		});
		deferredCall.error(function (data) {
			if (failFunc) {
				failFunc();
			}
		});
	};
	sendJsonPutRequest  (uri, content, successFunct, failFunc) {
		"use strict";

		var deferredCall = this.createAjaxPutCall(uri, content);

		deferredCall.done(function (rtoData) {
			successFunct(rtoData);
		});
		deferredCall.error(function (data) {
			if (failFunc) {
				failFunc();
			}
		});
	};


	sendJsonDeleteRequest (uri, successFunct, failFunc) {
		"use strict";

		var deferredCall = this.createAjaxDeleteCall(uri);

		deferredCall.done(function (rtoData) {
			successFunct(rtoData);
		});
		deferredCall.error(function (data) {
			if (failFunc) {
				failFunc();
			}
		});
	};

	createAjaxDeleteCall (aUrl) {
		"use strict";

		return $.ajax({
			url : aUrl,
			type : "DELETE",
			dataType: "json",
			contentType: "application/json"
		});
	};

	createAjaxPostCall (aUrl, content) {
		"use strict";

		return $.ajax({
			url : aUrl,
			type : "POST",
			dataType: "json",
			contentType: "application/json",
			data: content
		});
	};

	JDcreateAjaxPutCall (aUrl, content) {
		"use strict";

		return $.ajax({
			url : aUrl,
			type : "PUT",
			dataType: "json",
			contentType: "application/json",
			data: content
		});
	};


	createUriForClassInfo (aClassInfo, aMetaModelReponame, aBasePath) {
		"use strict";

		var reponame = aClassInfo.repoName,
			repoPart = "@jdy",// pseudo repo for meta information
			infoPath = (aBasePath === null) ?  "" : aBasePath;

		if (reponame !== aMetaModelReponame) {
			repoPart = reponame;
		}
		// check whether path ends with /
		infoPath = (infoPath.charAt(infoPath.length - 1) === "/") ? infoPath : infoPath + "/";
		infoPath += repoPart + "/" + aClassInfo.getInternalName();

		return infoPath;
	};


	createParametersFor(aValueObj, aClassInfo, aPrefix) {

		var nameValuePairs = [],
			refObjParams,
			curValue;

		aClassInfo.forEachAttr(curAttrInfo => {

			if (curAttrInfo.isKey()) {
				if (curAttrInfo.isPrimitive()) {

					curValue = curAttrInfo.getType().handlePrimitiveKey(this.parameterGetVisitor(aValueObj.val(curAttrInfo)));
					nameValuePairs.push({name: aPrefix + curAttrInfo.getInternalName(), value: curValue});
				} else {

					if (typeof aValueObj.val(curAttrInfo) === "object") {
						refObjParams = this.createParametersFor(aValueObj.val(curAttrInfo),
							curAttrInfo.getReferencedClass(),
							aPrefix + curAttrInfo.getInternalName() + ".");
						nameValuePairs = nameValuePairs.concat(refObjParams);
					} else {
						throw new JdyPersistentException("Wrong type for attr value (no object): " + curAttrInfo.getInternalName());
					}
				}
			}
		});

		return nameValuePairs;
	};

	parameterGetVisitor (aAttrValue) {
		"use strict";

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
				throw new JdyPersistentException("Blob Values not supported");
				//return aAttrValue;
			}
		};
	};
};




class JsonHttpPersistentService {

	reader;
	writer;

	constructor(aBasePath, aMetaRepoName) {

		this.reader = new JsonHttpObjectReader(aBasePath, null);
		this.writer =  new JsonHttpObjectWriter(aBasePath, null);

	}


	loadValuesFromDb (aFilter, successFunct, failFunc) {
		"use strict";

		this.reader.loadValuesFromDb(aFilter, successFunct, failFunc);
	};

	deleteObjectInDb  (aObjToDelete, aClassInfo, successFunct, failFunc) {
		"use strict";

		this.writer.deleteObjectInDb(aObjToDelete, aClassInfo, successFunct, failFunc);
	};

	insertObjectInDb (aObjToInsert, successFunct, failFunc) {
		"use strict";

		this.writer.insertObjectInDb(aObjToInsert, successFunct, failFunc);
	};

	updateObjectInDb (aObjToUpdate, successFunct, failFunc) {
		"use strict";

		this.writer.updateObjectInDb(aObjToUpdate, successFunct, failFunc);
	};


	executeWorkflowAction (actionName, aObjToWorkOn, successFunct, failFunc) {
		"use strict";
		this.writer.executeWorkflowAction(actionName, aObjToWorkOn, successFunct, failFunc);

	};

	createNewObject (aTypeInfo) {
		"use strict";
		return new JdyTypedValueObject(aTypeInfo, null, false);
	};


};

