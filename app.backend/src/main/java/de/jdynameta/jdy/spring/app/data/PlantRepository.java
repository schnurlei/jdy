package de.jdynameta.jdy.spring.app.data;

import de.jdynameta.jdy.model.jpa.example.Plant;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlantRepository extends CrudRepository<Plant, Integer> {

    public static Plant insertPlant(PlantRepository repo) {

        Plant newPlant = new Plant();

        newPlant.setBotanicname("Hyssopus officinalis");
        newPlant.setColor("blue");
        newPlant.setHeigthincm(50);
        newPlant.setPlantfamily(Plant.PlantFamily.Lamiaceae);

        repo.save(newPlant);
        return newPlant;
    }
}
