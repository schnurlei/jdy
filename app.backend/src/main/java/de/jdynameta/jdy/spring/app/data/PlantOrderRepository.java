package de.jdynameta.jdy.spring.app.data;

import de.jdynameta.jdy.model.jpa.example.Orderitem;
import de.jdynameta.jdy.model.jpa.example.Plant;
import de.jdynameta.jdy.model.jpa.example.Plantorder;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.stream.Collectors;

@Repository
public interface PlantOrderRepository extends CrudRepository<Plantorder, Integer> {

    public static Plantorder createPlantorder(final PlantOrderRepository repo, PlantOrderItemRepository itemrRepo, Plant... plants) {

        Plantorder newPlantorder = new Plantorder();

        newPlantorder.setOrderdate(new Date());

        newPlantorder.setOrdernr(System.currentTimeMillis());
        newPlantorder.setOrderitemColl(new ArrayList<>());

        List<Orderitem> items = Arrays.stream(plants)
                        .map(plant -> new Orderitem(newPlantorder,plant, (int)(100 *Math.random()), "12.34"))
                .collect(Collectors.toList());
        repo.save(newPlantorder);
        return newPlantorder;
    }
}
