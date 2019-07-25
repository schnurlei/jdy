package de.jdynameta.jdy.spring.app.rest;

import de.jdynameta.base.metainfo.ClassInfo;
import de.jdynameta.base.metainfo.ClassRepository;
import de.jdynameta.base.objectlist.DefaultObjectList;
import de.jdynameta.base.value.JdyPersistentException;
import de.jdynameta.base.value.TypedValueObject;
import de.jdynameta.jdy.model.jpa.JpaMetamodelReader;
import de.jdynameta.json.JsonFileWriter;
import de.jdynameta.metamodel.application.AppRepository;
import de.jdynameta.metamodel.application.ApplicationRepository;
import de.jdynameta.metamodel.application.MetaRepositoryCreator;
import de.jdynameta.persistence.manager.PersistentOperation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.persistence.EntityManager;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;
import javax.persistence.metamodel.EntityType;
import javax.xml.transform.TransformerConfigurationException;
import java.io.StringWriter;
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

    @RequestMapping(value = "jdy/data/{className}", method = RequestMethod.GET)
    public String getDataForEntity( @PathVariable("className") String className) {

        JpaMetamodelReader reader = new JpaMetamodelReader();
        ClassRepository repo = reader.createMetaRepository(entityManager.getMetamodel(), "TestApp");
        ClassInfo entityClassInfo = repo.getClassForName(className);

        Optional<EntityType<?>> entityForName = entityManager.getMetamodel().getEntities()
                .stream().filter(entity -> entity.getName().equals(className)).findFirst();

        if( entityForName.isPresent() ) {

            List<?> allEntities =  getAllObjectsFromEntity(entityForName.get());

            final List<TypedValueObject> wrappedEnitites = allEntities.stream()
                    .map(entity-> new TypedReflectionValueObjectWrapper(entity, entityClassInfo))
                    .collect(Collectors.toList());

            JsonFileWriter jsonFileWriter = new JsonFileWriter(new JsonFileWriter.WriteAllDependentStrategy(), true);
            StringWriter writer = new StringWriter();
            try {

                jsonFileWriter.writeObjectList(writer, entityClassInfo, new DefaultObjectList<>(wrappedEnitites), PersistentOperation.Operation.READ);
                return writer.toString();
            } catch (JdyPersistentException | TransformerConfigurationException ex) {
                ex.printStackTrace();
                throw new GeneralRestException(ex);
            }
        } else {
            return "";
        }
    }

    public List<?> getAllObjectsFromEntity(EntityType<?> entityType) {

        CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
        CriteriaQuery<?> query = criteriaBuilder.createQuery(entityType.getJavaType());
        Root<?> entityRoot = query.from(entityType.getJavaType());

/*
        Path<String> emailPath = user.get("email");
        List<Predicate> predicates = new ArrayList<>();
        for (String email : emails) {
            predicates.add(cb.like(emailPath, email));
        }
        query.select(user)
                .where(cb.or(predicates.toArray(new Predicate[predicates.size()])));
*/

        return entityManager.createQuery(query).getResultList();
    }
}
