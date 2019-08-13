package de.jdynameta.jdy.spring.app.data;

import de.jdynameta.jdy.model.jpa.entity.Landkreis;
import de.jdynameta.jdy.model.jpa.entity.Teilnehmer;
import de.jdynameta.jdy.model.jpa.entity.Veranstaltung;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Date;

@Repository
public interface TeilnehmerRepository extends CrudRepository<Teilnehmer, Integer> {

    public static void insertTeilnehmer(TeilnehmerRepository teilnehmerRepo, VeranstaltungRepository veranstaltungRepo, String name) {

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
        teilnehmer.setVeranstaltung(veranstaltung);

        veranstaltungRepo.save(veranstaltung);
        teilnehmerRepo.save(teilnehmer);
    }

}
