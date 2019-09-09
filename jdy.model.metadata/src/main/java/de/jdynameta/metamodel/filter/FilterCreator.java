package de.jdynameta.metamodel.filter;

import de.jdynameta.base.metainfo.ClassInfo;
import de.jdynameta.base.metainfo.ClassRepository;
import de.jdynameta.base.metainfo.PrimitiveAttributeInfo;
import de.jdynameta.base.metainfo.filter.*;
import de.jdynameta.base.metainfo.filter.defaultimpl.*;
import de.jdynameta.base.metainfo.primitive.*;
import de.jdynameta.base.objectlist.ChangeableObjectList;
import de.jdynameta.base.objectlist.ObjectList;
import de.jdynameta.base.value.JdyPersistentException;
import de.jdynameta.base.value.TypedValueObject;
import de.jdynameta.metamodel.filter.FilterRepository.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;

public class FilterCreator implements ExpressionVisitor<Object>
{
	private long idCounter = 0;
	private AppFilterExpr curExpr;

	public void resetIdCounter()
	{
		this.idCounter = 0;
	}

	public AppQuery createAppFilter(ClassInfoQuery metaQuery) throws JdyPersistentException
	{
		AppQuery appQuery = new AppQuery();
		appQuery.setFilterId(nextId());
		appQuery.setRepoName(metaQuery.getResultInfo().getRepoName());
		appQuery.setClassName(metaQuery.getResultInfo().getInternalName());
		appQuery.setExpr(createAppExpr(metaQuery.getFilterExpression()));


		return appQuery;
	}

	public AppFilterExpr createAppExpr( ObjectFilterExpression aMetaExpr) throws JdyPersistentException
	{
		aMetaExpr.visit(this);

		AppFilterExpr result = curExpr;

		return result;
	}

	private long nextId()
	{
		return this.idCounter++;
	}

	@Override
	public Object visitAndExpression(AndExpression aAndExpr)	throws JdyPersistentException
	{
		AppAndExpr andExpr = new AppAndExpr();
		andExpr.setExprId(nextId());
		ChangeableObjectList<AppFilterExpr> subExprs = new ChangeableObjectList<AppFilterExpr>();

		for( Iterator<ObjectFilterExpression> exprIter = aAndExpr.getExpressionIterator(); exprIter.hasNext(); ) {
			ObjectFilterExpression subMetaexpr = exprIter.next();
			AppFilterExpr subAppExpr = createAppExpr(subMetaexpr);
			subAppExpr.setAppAndExpr((AppAndExpr) andExpr);
			subExprs.addObject(subAppExpr);
		}

		andExpr.setAndSubExprColl(subExprs );

		curExpr = andExpr;
		return null;

	}

	@Override
	public Object visitOrExpression(OrExpression aOrExpression) throws JdyPersistentException
	{
		AppOrExpr orExpr = new AppOrExpr();
		orExpr.setExprId(nextId());
		ChangeableObjectList<AppFilterExpr> subExprs = new ChangeableObjectList<AppFilterExpr>();

		for( Iterator<ObjectFilterExpression> exprIter = aOrExpression.getExpressionIterator(); exprIter.hasNext(); ) {
			ObjectFilterExpression subMetaexpr = exprIter.next();
			AppFilterExpr subAppExpr = createAppExpr(subMetaexpr);
			subAppExpr.setAppOrExpr(orExpr);
			subExprs.addObject(subAppExpr);
		}

		orExpr.setOrSubExprColl(subExprs );

		curExpr = orExpr;
		return null;

	}

	@Override
	public Object visitOperatorExpression(OperatorExpression aOpExpr)	throws JdyPersistentException
	{
		AppOperatorExpr appOpExpr = new AppOperatorExpr();
		appOpExpr.setExprId(nextId());
		appOpExpr.setAttrName(aOpExpr.getAttributeInfo().getInternalName());
		appOpExpr.setOperator(createAppOperator(aOpExpr.getOperator()));

		setAppCompareValue(appOpExpr, aOpExpr);

		curExpr = appOpExpr;
		return null;

	}

	@Override
	public Object visitReferenceEqualExpression(ObjectReferenceEqualExpression aOpExpr) throws JdyPersistentException
	{
		throw new UnsupportedOperationException("Not impemented yet");
	}

	@Override
	public Object visitAssociationExpression(AssociationExpression aOpExpr) throws JdyPersistentException
	{
		throw new UnsupportedOperationException("Not impemented yet");
	}

	@Override
	public Object visitReferenceQueryExpr( ObjectReferenceSubqueryExpression aExpression)	throws JdyPersistentException
	{
		throw new UnsupportedOperationException("Not impemented yet");
	}

	private Object setAppCompareValue(AppOperatorExpr appOpExpr,	OperatorExpression aOpExpr)
	{
		PrimitiveAttributeInfo aMetaPrim = aOpExpr.getAttributeInfo();

		if(aMetaPrim.getType() instanceof BlobType) {
			throw new RuntimeException("Invalid type " + aMetaPrim.getType());
		} else if(aMetaPrim.getType() instanceof BooleanType)
		{
			appOpExpr.setBooleanVal((Boolean) aOpExpr.getCompareValue());
		} else if(aMetaPrim.getType() instanceof CurrencyType)
		{
			appOpExpr.setDecimalVal((BigDecimal) aOpExpr.getCompareValue());
		} else if(aMetaPrim.getType() instanceof FloatType)
		{
			appOpExpr.setFloatVal((Double) aOpExpr.getCompareValue());
		} else if(aMetaPrim.getType() instanceof LongType)
		{
			appOpExpr.setLongVal((Long) aOpExpr.getCompareValue());
		} else if(aMetaPrim.getType() instanceof TextType)
		{
			appOpExpr.setTextVal((String) aOpExpr.getCompareValue());
		} else if(aMetaPrim.getType() instanceof TimeStampType)
		{
			appOpExpr.setTimestampVal((Date) aOpExpr.getCompareValue());
		} else if(aMetaPrim.getType() instanceof VarCharType)
		{
			throw new RuntimeException("Invalid type " + aMetaPrim.getType());
		} else {
			throw new RuntimeException("Invalid type " + aMetaPrim.getType());
		}
		return null;
	}



	private AppPrimitiveOperator createAppOperator( ExpressionPrimitiveOperator aMetaOper) throws JdyPersistentException
	{
		OperatorVisitorImplementation aVisitor = new OperatorVisitorImplementation();
		aVisitor.init();
		aMetaOper.visitOperatorHandler(aVisitor );

		return aVisitor.getResultOp();
	}


	/**
	 * Convert a ClassInfoQuery object from a application query object
	 * @param appQuery
	 * @param repo
	 * @return
	 * @throws JdyPersistentException
	 */
	public ClassInfoQuery createMetaFilter(TypedValueObject appQuery, ClassRepository repo) throws JdyPersistentException
	{
		String className = (String) appQuery.getAttrValue(AppQueryName.className);
		ClassInfo typeInfo = repo.getClassForName(className);
		assert(repo.getRepoName().equals(typeInfo.getRepoName()) );


		DefaultClassInfoQuery metaQuery = new DefaultClassInfoQuery(typeInfo);
		TypedValueObject expression = (TypedValueObject) appQuery.getAttrValue(AppQueryName.expr);
		if (expression != null) {
			metaQuery.setFilterExpression(createMetaExpr(expression, typeInfo));
		} else {
			metaQuery.setFilterExpression(null);

		}

		return metaQuery;
	}

	private ObjectFilterExpression createMetaExpr(TypedValueObject expr, ClassInfo typeInfo) throws JdyPersistentException {
		ObjectFilterExpression result = null;

		if (expr.getClassInfo().getInternalName().equals(TypeName.AppOperatorExpr.name()))
		{
			DefaultOperatorExpression metaExpr = new DefaultOperatorExpression();
			PrimitiveAttributeInfo attr = (PrimitiveAttributeInfo) typeInfo.getAttributeInfoForExternalName((String)expr.getAttrValue(AppOperatorExprName.attrName));
			metaExpr.setAttributeInfo(attr);
			metaExpr.setCompareValue(getMetaCompareValue(expr, attr));
			metaExpr.setMyOperator(createMetaOperator((TypedValueObject) expr.getAttrValue(AppOperatorExprName.operator)));
			result = metaExpr;
		} else if (expr.getClassInfo().getInternalName().equals(TypeName.AppAndExpr.name()))
		{
			ArrayList<ObjectFilterExpression> subExprs = new ArrayList<ObjectFilterExpression>();
			ObjectList andSubExpressions = expr.getAssocValues(AppAndExprName.andSubExpr);
			for(Object appSubExpr : andSubExpressions )
			{
				subExprs.add(createMetaExpr((TypedValueObject) appSubExpr, typeInfo));
			}
			result = new DefaultExpressionAnd(subExprs);
		} else if (expr.getClassInfo().getInternalName().equals(TypeName.AppOrExpr.name()))
		{
			ArrayList<ObjectFilterExpression> subExprs = new ArrayList<ObjectFilterExpression>();
			ObjectList orSubExpressions = expr.getAssocValues(AppOrExprName.orSubExpr);
			for(Object appSubExpr : orSubExpressions)
			{
				subExprs.add(createMetaExpr((TypedValueObject) appSubExpr, typeInfo));
			}
			result = new DefaultOrExpression(subExprs);
		} else {
			throw new UnsupportedOperationException("Unknown expression type " + expr.getClass());
		}

		return result;
	}

	private Object getMetaCompareValue(TypedValueObject appOpExpr,	PrimitiveAttributeInfo aMetaPrim) throws JdyPersistentException {
		if(aMetaPrim.getType() instanceof BlobType)
		{
			throw new RuntimeException("Invalid type " + aMetaPrim.getType());
		} else if(aMetaPrim.getType() instanceof BooleanType)
		{
			return appOpExpr.getAttrValue(AppOperatorExprName.booleanVal);
		} else if(aMetaPrim.getType() instanceof CurrencyType)
		{
			return appOpExpr.getAttrValue(AppOperatorExprName.decimalVal);
		} else if(aMetaPrim.getType() instanceof FloatType)
		{
			return appOpExpr.getAttrValue(AppOperatorExprName.floatVal);
		} else if(aMetaPrim.getType() instanceof LongType)
		{
			return appOpExpr.getAttrValue(AppOperatorExprName.longVal);
		} else if(aMetaPrim.getType() instanceof TextType)
		{
			return appOpExpr.getAttrValue(AppOperatorExprName.textVal);
		} else if(aMetaPrim.getType() instanceof TimeStampType)
		{
			return appOpExpr.getAttrValue(AppOperatorExprName.timestampVal);
		} else if(aMetaPrim.getType() instanceof VarCharType)
		{
			throw new RuntimeException("Invalid type " + aMetaPrim.getType());
		} else {
			throw new RuntimeException("Invalid type " + aMetaPrim.getType());
		}
	}

	private ExpressionPrimitiveOperator createMetaOperator(	TypedValueObject anAppOperator) throws JdyPersistentException {
		ExpressionPrimitiveOperator result = null;
		if( anAppOperator.getClassInfo().getInternalName().equals(TypeName.AppOperatorEqual.name()) )
		{
			result = ((Boolean)anAppOperator.getAttrValue(AppOperatorExprName.isNotEqual)) ? DefaultOperatorEqual.getNotEqualInstance()
					: DefaultOperatorEqual.getEqualInstance();
		} else if( anAppOperator.getClassInfo().getInternalName().equals(TypeName.AppOperatorGreater.name())) {

			result = ((Boolean)anAppOperator.getAttrValue(AppOperatorExprName.isAlsoEqual)) ? DefaultOperatorGreater.getGreaterOrEqualInstance()
					: DefaultOperatorGreater.getGreateInstance();
		} else if( anAppOperator.getClassInfo().getInternalName().equals(TypeName.AppOperatorLess.name()))
		{
			result = ((Boolean)anAppOperator.getAttrValue(AppOperatorExprName.isAlsoEqual)) ? DefaultOperatorLess.getLessOrEqualInstance()
					: DefaultOperatorLess.getLessInstance();
		}
		return result;
	}


	private final static class OperatorVisitorImplementation implements OperatorVisitor<Object>
	{
		private AppPrimitiveOperator resultOp;

		private void init() {
			resultOp = null;
		}

		public AppPrimitiveOperator getResultOp()
		{
			return resultOp;
		}

		@Override
		public Object visitOperatorLess(OperatorLess aOperator)
		{
			AppOperatorLess appOp = new AppOperatorLess();
			appOp.setIsAlsoEqual(aOperator.isAlsoEqual());
			resultOp = appOp;
			return null;
		}

		@Override
		public Object visitOperatorGreater(OperatorGreater aOperator)
		{
			AppOperatorGreater appOp = new AppOperatorGreater();
			appOp.setIsAlsoEqual(aOperator.isAlsoEqual());
			resultOp = appOp;
			return null;
		}

		@Override
		public Object visitOperatorEqual(OperatorEqual aOperator)
		{
			AppOperatorEqual appOp = new AppOperatorEqual();
			appOp.setIsNotEqual(aOperator.isNotEqual());
			resultOp = appOp;
			return null;
		}
	}


	public static HashMap<String, String> createAbbreviationMap() {
		HashMap<String, String> att2AbbrMap = new HashMap<String, String>();
		att2AbbrMap.put("repoName", "rn");
		att2AbbrMap.put("className", "cn");
		att2AbbrMap.put("expr", "ex");
		att2AbbrMap.put("orSubExpr", "ose");
		att2AbbrMap.put("andSubExpr", "ase");
		att2AbbrMap.put("attrName", "an");
		att2AbbrMap.put("operator", "op");
		att2AbbrMap.put("isNotEqual", "ne");
		att2AbbrMap.put("isAlsoEqual", "ae");
		att2AbbrMap.put("longVal", "lv");
		att2AbbrMap.put("textVal", "tv");
		return att2AbbrMap;
	}

}
