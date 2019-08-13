package de.jdynameta.jdy.spring.app.data;

import de.jdynameta.jdy.model.jpa.entity.Veranstaltung;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VeranstaltungRepository extends CrudRepository<Veranstaltung, Integer> {

}
