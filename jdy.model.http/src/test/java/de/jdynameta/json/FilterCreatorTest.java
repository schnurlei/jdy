package de.jdynameta.json;

import de.jdynameta.base.creation.AbstractReflectionCreator;
import de.jdynameta.base.creation.ObjectTransformator;
import de.jdynameta.base.metainfo.*;
import de.jdynameta.base.metainfo.filter.AndExpression;
import de.jdynameta.base.metainfo.filter.ClassInfoQuery;
import de.jdynameta.base.metainfo.filter.ObjectFilterExpression;
import de.jdynameta.base.metainfo.filter.OperatorExpression;
import de.jdynameta.base.metainfo.filter.defaultimpl.DefaultClassInfoQuery;
import de.jdynameta.base.metainfo.filter.defaultimpl.QueryCreator;
import de.jdynameta.base.metainfo.primitive.LongType;
import de.jdynameta.base.objectlist.ChangeableObjectList;
import de.jdynameta.base.objectlist.ObjectList;
import de.jdynameta.base.test.PlantShopRepository;
import de.jdynameta.base.value.*;
import de.jdynameta.base.value.defaultimpl.ReflectionChangeableValueObject;
import de.jdynameta.base.value.defaultimpl.TypedWrappedValueObject;
import de.jdynameta.json.JsonCompactFileReader.GeneratedValueCreator;
import de.jdynameta.json.client.JsonHttpObjectReader;
import de.jdynameta.metamodel.filter.AppFilterExpr;
import de.jdynameta.metamodel.filter.AppQuery;
import de.jdynameta.metamodel.filter.FilterCreator;
import de.jdynameta.metamodel.filter.FilterRepository;
import de.jdynameta.persistence.manager.PersistentOperation;
import de.jdynameta.persistence.state.ApplicationObj;
import org.junit.Assert;
import org.junit.Test;

import javax.xml.transform.TransformerConfigurationException;
import java.io.StringReader;
import java.io.StringWriter;
import java.util.HashMap;

public class FilterCreatorTest
{

	@Test
	public void testCreateAppFilter() throws JdyPersistentException, TransformerConfigurationException, ObjectCreationException
	{
		final ClassRepository plantShop = PlantShopRepository.createPlantShopRepository();
		final ClassInfo plantType = plantShop.getClassForName(PlantShopRepository.Type.Plant.name());

		// create filter
		final DefaultClassInfoQuery query = QueryCreator.start(plantType)
				.or()
					.equal("BotanicName", "Iris")
					.and()
						.greater("HeigthInCm", new Long(30L))
						.less("HeigthInCm", new Long(100L))
					.end()
				.end().query();

		// convert filter to applcation filter
		final FilterCreator creator = new FilterCreator();
		final AppQuery appQuery = creator.createAppFilter(query);

		// write filter expressionto json string
		final StringWriter writerOut = new StringWriter();
		final HashMap<String, String> att2AbbrMap = writExpreToJsonString(appQuery, writerOut);
		System.out.println(writerOut.toString());

		final GeneratedValueCreator valueGenerator = new GeneratedValueCreator()
		{
			public long nextValue = 0;
			@Override
			public Object createValue(final ClassInfo aClassInfo, final AttributeInfo aAttrInfo)
			{
				return new Long(nextValue++);
			}

			@Override
			public boolean canGenerateValue(final ClassInfo aClassInfo, final AttributeInfo aAttrInfo)
			{
				return (aAttrInfo instanceof PrimitiveAttributeInfo)
						&& ((PrimitiveAttributeInfo) aAttrInfo).getType() instanceof LongType
						&& ((PrimitiveAttributeInfo) aAttrInfo).isGenerated();
			}
		};
		// convert filter string back to expr
		final JsonCompactFileReader reader = new JsonCompactFileReader(att2AbbrMap, FilterRepository.getSingleton().getRepoName(), valueGenerator );
		final ObjectList<ApplicationObj> result = reader.readObjectList(new StringReader(writerOut.toString()), FilterRepository.getSingleton().getInfoForType(FilterRepository.TypeName.AppFilterExpr));

		final FilterTransformator  transformator = new FilterTransformator(FilterRepository.NAME_CREATOR);
		final ObjectList<ReflectionChangeableValueObject> convertedList = JsonHttpObjectReader.convertValObjList(result, transformator);

		final AppFilterExpr expr =  (AppFilterExpr) convertedList.get(0);
		final AppQuery newAppQuery = new AppQuery();
		newAppQuery.setExpr(expr);
		newAppQuery.setRepoName(plantShop.getRepoName());
		newAppQuery.setClassName(plantType.getInternalName());

		final ClassInfoQuery resultQuery = creator.createMetaFilter(newAppQuery, plantShop);
		System.out.println(resultQuery);

	}

	private HashMap<String, String> writExpreToJsonString(final AppQuery appQuery,
														  final StringWriter writerOut) throws TransformerConfigurationException,
			JdyPersistentException
	{
		final ObjectList<? extends TypedValueObject> queryColl = new ChangeableObjectList<TypedValueObject>(appQuery.getExpr());
		final HashMap<String, String> att2AbbrMap = new HashMap<String, String>();
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
		new JsonCompactFileWriter(new JsonFileWriter.WriteAllStrategy(), true, att2AbbrMap)
			.writeObjectList(writerOut, appQuery.getClassInfo(), queryColl, PersistentOperation.Operation.READ);
		return att2AbbrMap;
	}

	@Test
	public void readCompactfilterExpression() throws JdyPersistentException
	{
		final String aFilterExpr = "[{\"@t\":\"FEA\",\"ase\":[{\"@t\":\"OEX\",\"an\":\"HeigthInCm\",\"op\":{\"@t\":\"FPG\",\"ae\":false},\"lv\":100}]}]";

		final GeneratedValueCreator valueGenerator = new GeneratedValueCreator()
		{
			public long nextValue = 0;
			@Override
			public Object createValue(final ClassInfo aClassInfo, final AttributeInfo aAttrInfo)
			{
				return new Long(nextValue++);
			}

			@Override
			public boolean canGenerateValue(final ClassInfo aClassInfo, final AttributeInfo aAttrInfo)
			{
				return (aAttrInfo instanceof PrimitiveAttributeInfo)
						&& ((PrimitiveAttributeInfo) aAttrInfo).getType() instanceof LongType
						&& ((PrimitiveAttributeInfo) aAttrInfo).isGenerated();
			}
		};

		final HashMap<String, String> att2AbbrMap = FilterCreator.createAbbreviationMap();
		final JsonCompactFileReader reader = new JsonCompactFileReader(att2AbbrMap, FilterRepository.getSingleton().getRepoName(), valueGenerator );
		final ObjectList<ApplicationObj> result = reader.readObjectList(new StringReader(aFilterExpr), FilterRepository.getSingleton().getInfoForType(FilterRepository.TypeName.AppFilterExpr));
		final ApplicationObj exprObj = result.get(0);

		final ObjectList<? extends TypedValueObject> exprList = exprObj.getValues("andSubExpr");
		final ApplicationObj operatorExpr = (ApplicationObj) exprList.get(0);
		Assert.assertEquals("HeigthInCm", operatorExpr.getValue("attrName"));
		Assert.assertEquals(100L, operatorExpr.getValue("longVal"));
		Assert.assertEquals(Boolean.FALSE, ((ApplicationObj) operatorExpr.getValue("operator")).getValue("isAlsoEqual"));

	}

	@Test
	public void testReadAppFilterFromJson_SimpleOperator() throws JdyPersistentException {

		String jsonFilterText = "[{\"@t\":\"FQM\",\"rn\":\"PlantShop\",\"cn\":\"Plant\",\"ex\":{\"@t\":\"OEX\",\"an\":\"HeigthInCm\",\"op\":{\"@t\":\"FPG\",\"ae\":false},\"lv\":30}}]";
		JsonCompactFileReader reader = new JsonCompactFileReader(this.getMapping() , FilterRepository.getSingleton().getRepoName(), null );
		ObjectList<ApplicationObj> appQuery = reader.readObjectList(new StringReader(jsonFilterText), FilterRepository.getSingleton().getInfoForType(FilterRepository.TypeName.AppQuery));

		ClassRepository plantShop = PlantShopRepository.createPlantShopRepository();
		FilterCreator creator = new FilterCreator();
		ClassInfoQuery newQuery = creator.createMetaFilter(appQuery.get(0), plantShop);
		Assert.assertEquals(30L, ((OperatorExpression)newQuery.getFilterExpression()).getCompareValue());
		Assert.assertEquals("HeigthInCm", ((OperatorExpression)newQuery.getFilterExpression()).getAttributeInfo().getInternalName());
		Assert.assertEquals(">", ((OperatorExpression)newQuery.getFilterExpression()).getOperator().toString());
	}

	@Test
	public void testReadAppFilterFromJson_SimpleAndExpr() throws JdyPersistentException {


		String jsonFilterText = "[{\"@t\":\"FQM\",\"rn\":\"PlantShop\",\"cn\":\"Plant\",\"ex\":{\"@t\":\"FEA\",\"ase\":[{\"@t\":\"OEX\",\"an\":\"HeigthInCm\",\"op\":{\"@t\":\"FPG\",\"ae\":false},\"lv\":30}]}}]";
		JsonCompactFileReader reader = new JsonCompactFileReader(this.getMapping() , FilterRepository.getSingleton().getRepoName(), null );
		ObjectList<ApplicationObj> appQuery = reader.readObjectList(new StringReader(jsonFilterText), FilterRepository.getSingleton().getInfoForType(FilterRepository.TypeName.AppQuery));

		ClassRepository plantShop = PlantShopRepository.createPlantShopRepository();
		FilterCreator creator = new FilterCreator();
		ClassInfoQuery newQuery = creator.createMetaFilter(appQuery.get(0), plantShop);

		ObjectFilterExpression operatorInAnd = ((AndExpression)newQuery.getFilterExpression()).getExpressionIterator().next();
		Assert.assertEquals(30L, ((OperatorExpression)operatorInAnd).getCompareValue());
		Assert.assertEquals("HeigthInCm", ((OperatorExpression)operatorInAnd).getAttributeInfo().getInternalName());
		Assert.assertEquals(">", ((OperatorExpression)operatorInAnd).getOperator().toString());
	}


	private HashMap<String, String> getMapping()
	{
		final HashMap<String, String> att2AbbrMap = new HashMap<>();
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

	@SuppressWarnings("serial")
	private static class FilterTransformator extends AbstractReflectionCreator<ReflectionChangeableValueObject>
		implements ObjectTransformator<ValueObject, ReflectionChangeableValueObject> {


		public FilterTransformator(final ClassNameCreator aNameCreator)
		{
			super(aNameCreator);
		}

		@Override
		public TypedValueObject getValueObjectFor(final ClassInfo aClassinfo,
												  final ValueObject aObjectToTransform)
		{
			return new TypedWrappedValueObject(aObjectToTransform, aClassinfo);
		}

		@Override
		protected ReflectionChangeableValueObject createProxyObjectFor(
				final TypedValueObject aObjToHandle)
		{
			return null;
		}


		@Override
		protected void setProxyListForAssoc(final AssociationInfo aCurAssocInfo,
											final ReflectionChangeableValueObject aObjoSetVals,
											final TypedValueObject aObjToGetVals) throws ObjectCreationException
		{

		}
	}

}
