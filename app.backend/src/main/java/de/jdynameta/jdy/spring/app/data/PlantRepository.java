package de.jdynameta.jdy.spring.app.data;

import de.jdynameta.jdy.model.jpa.example.Plant;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlantRepository extends CrudRepository<Plant, Integer> {

    public static Plant insertPlantHyssopus(PlantRepository repo) {

        Plant newPlant = new Plant();

        newPlant.setBotanicname("Hyssopus officinalis");
        newPlant.setColor("blue");
        newPlant.setHeigthincm(50);
        newPlant.setPlantfamily(Plant.PlantFamily.Lamiaceae);

        repo.save(newPlant);
        return newPlant;
    }

    public static Plant insertPlantIris(PlantRepository repo) {

        Plant newPlant = new Plant();

        newPlant.setBotanicname("Iris barbata-elatior 'Bazaar'");
        newPlant.setColor("auberginefarben mit weißgelber Mitte");
        newPlant.setHeigthincm(80);
        newPlant.setPlantfamily(Plant.PlantFamily.Iridaceae);

        repo.save(newPlant);
        return newPlant;
    }
}
