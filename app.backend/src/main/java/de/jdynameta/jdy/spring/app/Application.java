package de.jdynameta.jdy.spring.app;

import de.jdynameta.jdy.model.jpa.entity.Landkreis;
import de.jdynameta.jdy.model.jpa.entity.Teilnehmer;
import de.jdynameta.jdy.model.jpa.entity.Veranstaltung;
import de.jdynameta.jdy.model.jpa.example.Plant;
import de.jdynameta.jdy.model.jpa.example.Plantorder;
import de.jdynameta.jdy.spring.app.config.JpaConfiguration;
import de.jdynameta.jdy.spring.app.data.PlantOrderItemRepository;
import de.jdynameta.jdy.spring.app.data.PlantOrderRepository;
import de.jdynameta.jdy.spring.app.data.PlantRepository;
import de.jdynameta.jdy.spring.app.data.TeilnehmerRepository;
import de.jdynameta.jdy.spring.app.data.VeranstaltungRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;

import javax.annotation.PostConstruct;
import javax.persistence.EntityManager;
import java.math.BigDecimal;
import java.util.Date;

@SpringBootApplication
@Import(JpaConfiguration.class)
public class Application {

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

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

	@PostConstruct
	private void init() {

		insertTeilnehmer("Hans");
		insertTeilnehmer("Franz");
		Plant hyssopus = PlantRepository.insertPlantHyssopus(this.plantRepo);
		Plant iris = PlantRepository.insertPlantIris(this.plantRepo);
		Plantorder createdOrder = PlantOrderRepository.createPlantorder(this.plantOrderRepo, this.itemRepo, hyssopus, iris);

	}

	public void insertTeilnehmer(String name) {

		final Veranstaltung veranstaltung = new Veranstaltung();
		veranstaltung.setBeschreibung(name + "_Veranstaltung_Beschreibung");
		veranstaltung.setDatum(new Date());
		veranstaltung.setChangable(true);

		Teilnehmer teilnehmer = new Teilnehmer();
		teilnehmer.setName(name);
		teilnehmer.setBeschreibung(name + "_Beschreibung");
		teilnehmer.setFreigegeben(true);
		teilnehmer.setLandkreis(Landkreis.AIC);
		teilnehmer.setLat(new BigDecimal(12.33));
		teilnehmer.setLng(new BigDecimal(77.22));
		teilnehmer.setOrt("TestOrt");
		teilnehmer.setPlz(89277);
//		teilnehmer.setVeranstaltung(veranstaltung);

		this.veranstaltungRepo.save(veranstaltung);
		this.teilnehmerRepo.save(teilnehmer);
	}

}
