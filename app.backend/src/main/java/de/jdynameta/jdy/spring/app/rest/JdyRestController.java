package de.jdynameta.jdy.spring.app.rest;

import de.jdynameta.base.metainfo.ClassInfo;
import de.jdynameta.base.metainfo.ClassRepository;
import de.jdynameta.base.objectlist.DefaultObjectList;
import de.jdynameta.base.objectlist.ObjectList;
import de.jdynameta.base.value.JdyPersistentException;
import de.jdynameta.base.value.TypedValueObject;
import de.jdynameta.jdy.model.jpa.JpaMetamodelReader;
import de.jdynameta.json.JsonCompactFileReader;
import de.jdynameta.json.JsonFileWriter;
import de.jdynameta.metamodel.application.AppRepository;
import de.jdynameta.metamodel.application.ApplicationRepository;
import de.jdynameta.metamodel.application.MetaRepositoryCreator;
import de.jdynameta.metamodel.filter.FilterRepository;
import de.jdynameta.persistence.manager.PersistentOperation;
import de.jdynameta.persistence.state.ApplicationObj;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;
import javax.persistence.metamodel.EntityType;
import javax.xml.transform.TransformerConfigurationException;
import java.io.StringReader;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
                            , final @RequestParam("filter") String filter) {

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

        return this.entityManager.createQuery(query).getResultList();
    }

    private List<?> readObjectsFromDbForEntity(final EntityType<?> entityType, String filter) throws JdyPersistentException {

        final CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
        final CriteriaQuery<?> query = criteriaBuilder.createQuery(entityType.getJavaType());
        final Root<?> entityRoot = query.from(entityType.getJavaType());

        JsonCompactFileReader reader = new JsonCompactFileReader(this.getMapping() , FilterRepository.getSingleton().getRepoName(), null );
        ObjectList<ApplicationObj> result = reader.readObjectList(new StringReader(filter), FilterRepository.getSingleton().getInfoForType(FilterRepository.TypeName.AppFilterExpr));


/*
        Path<String> emailPath = user.get("email");
        List<Predicate> predicates = new ArrayList<>();
        for (String email : emails) {
            predicates.add(cb.like(emailPath, email));
        }
        query.select(user)
                .where(cb.or(predicates.toArray(new Predicate[predicates.size()])));
*/

        return this.entityManager.createQuery(query).getResultList();
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
}
