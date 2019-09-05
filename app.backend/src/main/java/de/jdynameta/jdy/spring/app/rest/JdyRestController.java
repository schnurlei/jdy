package de.jdynameta.jdy.spring.app.rest;

import de.jdynameta.base.metainfo.*;
import de.jdynameta.base.metainfo.filter.ClassInfoQuery;
import de.jdynameta.base.metainfo.primitive.*;
import de.jdynameta.base.objectlist.DefaultObjectList;
import de.jdynameta.base.objectlist.ObjectList;
import de.jdynameta.base.value.JdyPersistentException;
import de.jdynameta.base.value.TypedValueObject;
import de.jdynameta.base.value.ValueObject;
import de.jdynameta.jdy.model.jpa.JpaFilterConverter;
import de.jdynameta.jdy.model.jpa.JpaMetamodelReader;
import de.jdynameta.jdy.model.jpa.JpaWriter;
import de.jdynameta.jdy.model.jpa.TypedReflectionValueObjectWrapper;
import de.jdynameta.json.JsonCompactFileReader;
import de.jdynameta.json.JsonFileReader;
import de.jdynameta.json.JsonFileWriter;
import de.jdynameta.metamodel.application.AppRepository;
import de.jdynameta.metamodel.application.ApplicationRepository;
import de.jdynameta.metamodel.application.MetaRepositoryCreator;
import de.jdynameta.metamodel.filter.FilterCreator;
import de.jdynameta.metamodel.filter.FilterRepository;
import de.jdynameta.persistence.manager.PersistentOperation;
import de.jdynameta.persistence.state.ApplicationObj;
import de.jdynameta.persistence.state.ApplicationObjImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.metamodel.EntityType;
import javax.xml.transform.TransformerConfigurationException;
import java.io.StringReader;
import java.io.StringWriter;
import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@RestController
@RequestMapping("api")
public class JdyRestController {

    private static final Logger LOG = LoggerFactory.getLogger(JdyRestController.class);

    @Autowired
    private EntityManager entityManager;


    @RequestMapping(value="about",method= RequestMethod.GET)
    public String about() {
        LOG.info("about");
        return "JDY Rest Service 6667";
    }

    @RequestMapping(value="jdy/meta",method= RequestMethod.GET)
    public String metaModel() {
        LOG.info("metaModel");
        JpaMetamodelReader reader = new JpaMetamodelReader();
        ClassRepository repo = reader.createMetaRepository(entityManager.getMetamodel(), "TestApp");

        try {
            AppRepository appRepository = new MetaRepositoryCreator(null).createAppRepository(repo);
            ClassInfo repoClassInfo = ApplicationRepository.getSingleton().getClassForName("AppRepository");
            DefaultObjectList<TypedValueObject> singleElementList = new DefaultObjectList<>(appRepository);

            JsonFileWriter jsonFileWriter = new JsonFileWriter(new JsonFileWriter.WriteAllDependentStrategy(), true);
            StringWriter writer = new StringWriter();
            jsonFileWriter.writeObjectList(writer,repoClassInfo,singleElementList, PersistentOperation.Operation.READ);
            return writer.toString();
        } catch (JdyPersistentException | TransformerConfigurationException ex) {
            ex.printStackTrace();
            throw new GeneralRestException(ex);
        }
    }

    @GetMapping(value = "jdy/data/{className}")
    public String getDataForEntity( final @PathVariable("className") String className
                            , final @RequestParam(name = "filter", required=false) String filter) {

        final ClassInfo entityClassInfo = this.getMetaInfoClassForClassName(className);
        final Optional<EntityType<?>> jpaEntityForName = this.getJpaEntityTypeForClassName(className);

        if( entityClassInfo != null && jpaEntityForName.isPresent() ) {

            final List<?> allDbObjects;
            try {
                if(filter != null) {
                    allDbObjects =  this.readObjectsFromDbForEntity(jpaEntityForName.get(), filter);
                } else {
                    allDbObjects =  this.readAllObjectsFromDbForEntity(jpaEntityForName.get());
                }

                return this.createJsonResponse(entityClassInfo, allDbObjects);
            } catch(JdyPersistentException ex) {
                throw new GeneralRestException(ex);
            }
        } else {
            return "";
        }
    }

    @PostMapping(path = "jdy/data/{className}", consumes = APPLICATION_JSON_VALUE, produces = APPLICATION_JSON_VALUE)
    public @ResponseBody
    @Transactional
    ResponseEntity<String> insertEntityInDb(final @PathVariable("className") String className
            , @RequestBody String jsonEntity) {

        final ClassInfo entityClassInfo = this.getMetaInfoClassForClassName(className);
        final Optional<EntityType<?>> jpaEntityForName = this.getJpaEntityTypeForClassName(className);

        if( entityClassInfo != null && jpaEntityForName.isPresent() ) {

            try(StringReader  reader = new StringReader(jsonEntity)) {

                JsonFileReader jsonReader = new JsonFileReader();
                ObjectList<ApplicationObj> objectList = jsonReader.readObjectList(reader,entityClassInfo);
                JpaWriter writer = new JpaWriter();
                TypedValueObject insertedObject = writer.insertInDb(objectList.get(0), jpaEntityForName.get(), this.entityManager);
                DefaultObjectList<TypedValueObject> singleElementList = new DefaultObjectList<>(insertedObject);
                JsonFileWriter jsonFileWriter = new JsonFileWriter(new JsonFileWriter.WriteAllDependentStrategy(), true);
                final StringWriter resultWriter = new StringWriter();
                jsonFileWriter.writeObjectList(resultWriter,entityClassInfo,singleElementList, PersistentOperation.Operation.READ);

                return new ResponseEntity<String>(resultWriter.toString(), HttpStatus.OK);

            } catch (JdyPersistentException | TransformerConfigurationException ex) {
                throw new GeneralRestException(ex);
            }

        } else {
            throw new GeneralRestException("Invalid entity type ");
        }
    }

    @DeleteMapping(path = "jdy/data/{className}")
    public @ResponseBody
    @Transactional
    ResponseEntity<String> deleteEntityInDb(final @PathVariable("className") String className
            , @RequestParam Map<String, String> parameters) {

        final ClassInfo entityClassInfo = this.getMetaInfoClassForClassName(className);
        final Optional<EntityType<?>> jpaEntityForName = this.getJpaEntityTypeForClassName(className);

        if( entityClassInfo != null && jpaEntityForName.isPresent() ) {

            try {
                JpaWriter writer = new JpaWriter();

                final ApplicationObj objToDelete = convertParameters(parameters, entityClassInfo);
                writer.deleleteInDb(objToDelete, jpaEntityForName.get(), this.entityManager);

                return new ResponseEntity<String>("Ok", HttpStatus.NO_CONTENT);

            } catch (JdyPersistentException  ex) {
                throw new GeneralRestException(ex);
            }

        } else {
            throw new GeneralRestException("Invalid entity type ");
        }
    }

    private ApplicationObj convertParameters(Map<String, String> parameters, ClassInfo entityClassInfo) throws JdyPersistentException {

        RequestParameterHandler handler = new RequestParameterHandler(parameters, entityClassInfo, null);
        entityClassInfo.handleAttributes(handler, null);
        return  handler.result;

    }


    private Optional<EntityType<?>> getJpaEntityTypeForClassName(final String className) {

        return this.entityManager.getMetamodel().getEntities()
                    .stream()
                    .filter(entity -> entity.getName().equals(className)).findFirst();
    }

    private ClassInfo getMetaInfoClassForClassName(final String className) {

        final ClassRepository metaRepo = new JpaMetamodelReader().createMetaRepository(this.entityManager.getMetamodel(), "TestApp");
        return metaRepo.getClassForName(className);
    }

    private String createJsonResponse(final ClassInfo entityClassInfo, final List<?> allEntities) {

        final List<TypedValueObject> wrappedEnitites = allEntities.stream()
                .map(entity-> new TypedReflectionValueObjectWrapper(entity, entityClassInfo))
                .collect(Collectors.toList());

        final JsonFileWriter jsonFileWriter = new JsonFileWriter(new JsonFileWriter.WriteAllDependentStrategy(), true);
        final StringWriter writer = new StringWriter();
        try {
            jsonFileWriter.writeObjectList(writer, entityClassInfo, new DefaultObjectList<>(wrappedEnitites), PersistentOperation.Operation.READ);
            return writer.toString();
        } catch (JdyPersistentException | TransformerConfigurationException ex) {
            LOG.error("Error creating JSON Response", ex);
            throw new GeneralRestException(ex);
        }
    }

    private List<?> readAllObjectsFromDbForEntity(final EntityType<?> entityType) {

        final CriteriaBuilder criteriaBuilder = this.entityManager.getCriteriaBuilder();
        final CriteriaQuery<?> query = criteriaBuilder.createQuery(entityType.getJavaType());
        query.from(entityType.getJavaType());

        return this.entityManager.createQuery(query).getResultList();
    }

    private List<?> readObjectsFromDbForEntity(final EntityType<?> entityType, final String filter) throws JdyPersistentException {

        final CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
        final CriteriaQuery<?> query = criteriaBuilder.createQuery(entityType.getJavaType());
        query.from(entityType.getJavaType());

        JsonCompactFileReader reader = new JsonCompactFileReader(this.getMapping() , FilterRepository.getSingleton().getRepoName(), null );
        ObjectList<ApplicationObj> appQuery = reader.readObjectList(new StringReader(filter), FilterRepository.getSingleton().getInfoForType(FilterRepository.TypeName.AppQuery));

        final ClassRepository metaRepo = new JpaMetamodelReader().createMetaRepository(this.entityManager.getMetamodel(), "TestApp");

        final FilterCreator creator = new FilterCreator();
        final ClassInfoQuery newQuery = creator.createMetaFilter(appQuery.get(0), metaRepo);

        final JpaFilterConverter filterConverter = new JpaFilterConverter(this.entityManager);
        final CriteriaQuery<Object> criteriaQuery = filterConverter.convert(newQuery);

        return this.entityManager.createQuery(criteriaQuery).getResultList();
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

    public static class RequestParameterHandler implements AttributeHandler
    {
        private final Map<String, String> paraMap;
        private final ApplicationObj result;
        private final List<AttributeInfo> aspectPath;

        public RequestParameterHandler(final Map<String, String> aRequestParaMap, final ClassInfo aConcreteClass, final List<AttributeInfo> anAspectPath)
        {
            super();
            this.result = new ApplicationObjImpl(aConcreteClass, false);
            this.paraMap = aRequestParaMap;
            this.aspectPath = anAspectPath;
        }

        @Override
        public void handleObjectReference(final ObjectReferenceAttributeInfo aInfo, final ValueObject objToHandle)
                throws JdyPersistentException
        {

            if (aInfo.isKey())
            {
                final List<AttributeInfo> refAspectPath = new ArrayList<>();
                if (this.aspectPath != null)
                {
                    refAspectPath.addAll(this.aspectPath);
                }
                refAspectPath.add(aInfo);
                final RequestParameterHandler refHandler = new RequestParameterHandler(this.paraMap, aInfo.getReferencedClass(), refAspectPath);
                aInfo.getReferencedClass().handleAttributes(refHandler, null);
                this.result.setValue(aInfo, refHandler.result);
            }
        }

        @Override
        public void handlePrimitiveAttribute(final PrimitiveAttributeInfo aInfo, final Object objToHandle)
                throws JdyPersistentException
        {
            final String parameterName = this.createParameterName(this.aspectPath, aInfo);
            if (aInfo.isKey())
            {
                final String value = this.paraMap.get(parameterName);
                if (value == null || value.trim().isEmpty())
                {
                    throw new JdyPersistentException("Missing value for type in attr value: " + aInfo.getInternalName());
                } else
                {
                    this.result.setValue(aInfo, aInfo.getType().handlePrimitiveKey(new StringValueGetVisitor(value)));
                }
            }
        }

        private String createParameterName(final List<AttributeInfo> aAspectPath, final PrimitiveAttributeInfo aInfo)
        {
            final StringBuilder resultName = new StringBuilder();
            if (this.aspectPath != null)
            {
                for (final AttributeInfo attributeInfo : aAspectPath)
                {
                    resultName.append(attributeInfo.getInternalName()).append('.');
                }
            }

            resultName.append(aInfo.getInternalName());
            return resultName.toString();
        }
    }

    public static class StringValueGetVisitor implements PrimitiveTypeGetVisitor
    {
        private final String attrValue;

        /**
         *
         */
        public StringValueGetVisitor(final String anAttrValue)
        {
            super();
            this.attrValue = anAttrValue;
        }

        @Override
        public Boolean handleValue(final BooleanType aType) throws JdyPersistentException
        {
            return Boolean.valueOf(this.attrValue);
        }

        @Override
        public BigDecimal handleValue(final CurrencyType aType)
                throws JdyPersistentException
        {
            return new BigDecimal(this.attrValue);
        }

        @Override
        public Date handleValue(final TimeStampType aType) throws JdyPersistentException
        {
            try {
                final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSX");
                final ZonedDateTime zdt = ZonedDateTime.parse(this.attrValue, formatter.withZone(ZoneId.systemDefault()));
                return Date.from(zdt.toInstant());
            } catch (final DateTimeParseException ex) {
                throw new JdyPersistentException(ex);
            }
        }

        @Override
        public Double handleValue(final FloatType aType) throws JdyPersistentException
        {
            return Double.valueOf(this.attrValue);
        }

        @Override
        public Long handleValue(final LongType aType) throws JdyPersistentException
        {
            return Long.valueOf(this.attrValue);
        }

        @Override
        public String handleValue(final TextType aType) throws JdyPersistentException
        {
            return this.attrValue;
        }

        @Override
        public String handleValue(final VarCharType aType) throws JdyPersistentException
        {
            return this.attrValue;
        }

        @Override
        public BlobByteArrayHolder handleValue(final BlobType aType) throws JdyPersistentException
        {
            // TODO Auto-generated method stub
            return null;
        }
    }

}
