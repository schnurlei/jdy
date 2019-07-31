package de.jdynameta.jdy.spring.app.data;

import de.jdynameta.jdy.model.jpa.example.Orderitem;
import de.jdynameta.jdy.model.jpa.example.OrderitemPK;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlantOrderItemRepository extends CrudRepository<Orderitem, OrderitemPK> {


}
