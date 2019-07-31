package de.jdynameta.jdy.spring.app;

import de.jdynameta.base.metainfo.ClassInfo;
import de.jdynameta.base.metainfo.ClassRepository;
import de.jdynameta.base.objectlist.DefaultObjectList;
import de.jdynameta.base.value.JdyPersistentException;
import de.jdynameta.base.value.TypedValueObject;
import de.jdynameta.jdy.model.jpa.JpaMetamodelReader;
import de.jdynameta.jdy.model.jpa.entity.Teilnehmer;
import de.jdynameta.jdy.model.jpa.example.Plant;
import de.jdynameta.jdy.model.jpa.example.Plantorder;
import de.jdynameta.jdy.spring.app.data.PlantOrderItemRepository;
import de.jdynameta.jdy.spring.app.data.PlantOrderRepository;
import de.jdynameta.jdy.spring.app.data.PlantRepository;
import de.jdynameta.jdy.spring.app.rest.GeneralRestException;
import de.jdynameta.jdy.spring.app.rest.TeilnehmerRepository;
import de.jdynameta.jdy.spring.app.rest.TypedReflectionValueObjectWrapper;
import de.jdynameta.jdy.spring.app.rest.VeranstaltungRepository;
import de.jdynameta.json.JsonFileWriter;
import de.jdynameta.metamodel.application.AppRepository;
import de.jdynameta.metamodel.application.ApplicationRepository;
import de.jdynameta.metamodel.application.MetaRepositoryCreator;
import de.jdynameta.persistence.manager.PersistentOperation;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

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

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
public class ApplicationTests {

	@Autowired
	private EntityManager entityManager;

    @Autowired
    private TeilnehmerRepository teilnehmerRepo;

    @Autowired
    private VeranstaltungRepository veranstaltungRepo;

    @Autowired
    private PlantRepository plantRepo;

    @Autowired
    private PlantOrderRepository plantOrderRepo;

    @Autowired
    private PlantOrderItemRepository itemRepo;


	@Test
	public void loadEntityObjects() {

		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<?> query = criteriaBuilder.createQuery(Teilnehmer.class);
		Root<?> entityRoot = query.from(Teilnehmer.class);

		Assert.assertEquals( entityManager.createQuery(query).getResultList().size(), 1);
	}

    @Test
    // Test to check the writing into json works
	public void testWriteEntitiesAsJson() {

        TeilnehmerRepository.insertTeilnehmer(teilnehmerRepo, veranstaltungRepo, "Teilnehmer1");
        TeilnehmerRepository.insertTeilnehmer(teilnehmerRepo, veranstaltungRepo, "Teilnehmer2");


	    final String className = "Teilnehmer";
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
                Assert.assertEquals(writer.toString(), "");
            } catch (JdyPersistentException | TransformerConfigurationException ex) {
                ex.printStackTrace();
                throw new GeneralRestException(ex);
            }
        }
        Assert.fail("enitiy not found");
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


    @Test
    public void testWriteMetadataToJson() throws JdyPersistentException, TransformerConfigurationException {

        JpaMetamodelReader reader = new JpaMetamodelReader();
        ClassRepository repo = reader.createMetaRepository(entityManager.getMetamodel(), "TestApp");

        AppRepository appRepository = new MetaRepositoryCreator(null).createAppRepository(repo);
        ClassInfo repoClassInfo = ApplicationRepository.getSingleton().getClassForName("AppRepository");
        DefaultObjectList<TypedValueObject> singleElementList = new DefaultObjectList<>(appRepository);

        JsonFileWriter jsonFileWriter = new JsonFileWriter(new JsonFileWriter.WriteAllDependentStrategy(), true);
        StringWriter writer = new StringWriter();
        jsonFileWriter.writeObjectList(writer,repoClassInfo,singleElementList, PersistentOperation.Operation.READ);
        writer.toString();
    }

    @Test
    public void testWriteAssociationDataToJson() throws JdyPersistentException, TransformerConfigurationException {

        Plant hyssopus = PlantRepository.insertPlantHyssopus(this.plantRepo);
        Plant iris = PlantRepository.insertPlantIris(this.plantRepo);
        Plantorder createdOrder = PlantOrderRepository.createPlantorder(this.plantOrderRepo, this.itemRepo, hyssopus, iris);

        final String className = "Plantorder";
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
                Assert.assertEquals(writer.toString(), "");
            } catch (JdyPersistentException | TransformerConfigurationException ex) {
                ex.printStackTrace();
                throw new GeneralRestException(ex);
            }
        }
    }
}
