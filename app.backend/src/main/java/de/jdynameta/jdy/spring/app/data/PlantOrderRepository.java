package de.jdynameta.jdy.spring.app.data;

import de.jdynameta.jdy.model.jpa.example.Plantorder;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.UUID;

@Repository
public interface PlantOrderRepository extends CrudRepository<Plantorder, Integer> {

    public static Plantorder insertPlantorder(final PlantOrderRepository repo) {

        Plantorder newPlant = new Plantorder();
        UUID uuid = UUID.randomUUID();

        newPlant.setOrderdate(new Date());
        newPlant.setOrdernr(uuid.getLeastSignificantBits());

        repo.save(newPlant);
        return newPlant;
    }
}
