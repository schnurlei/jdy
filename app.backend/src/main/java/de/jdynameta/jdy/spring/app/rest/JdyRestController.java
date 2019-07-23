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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.persistence.EntityManager;
import javax.xml.transform.TransformerConfigurationException;
import java.io.StringWriter;

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
            JsonFileWriter jsonFileWriter = new JsonFileWriter(new JsonFileWriter.WriteAllDependentStrategy(), true);
            StringWriter writer = new StringWriter();
            DefaultObjectList<TypedValueObject> singleElementList = new DefaultObjectList<>(appRepository);

            jsonFileWriter.writeObjectList(writer,repoClassInfo,singleElementList, PersistentOperation.Operation.READ);
            return writer.toString();
        } catch (JdyPersistentException | TransformerConfigurationException ex) {
            ex.printStackTrace();
            throw new GeneralRestException(ex);
        }
    }


}
