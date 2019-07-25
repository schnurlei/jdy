package de.jdynameta.jdy.spring.app.rest;

import de.jdynameta.jdy.model.jpa.entity.Teilnehmer;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TeilnehmerRepository extends CrudRepository<Teilnehmer, Integer> {

}
