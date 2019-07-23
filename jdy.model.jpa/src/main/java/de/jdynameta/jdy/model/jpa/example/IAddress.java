package de.jdynameta.jdy.model.jpa.example;

import java.util.Collection;

public interface IAddress {

    String getAddressid();

    void setAddressid(String addressid);

    String getStreet();

    void setStreet(String street);

    String getZipcode();

    void setZipcode(String zipcode);

    String getCity();

    void setCity(String city);

    Collection<Customer> getCustomerCollection();

    void setCustomerCollection(Collection<Customer> customerCollection);

    Collection<Customer> getCustomerCollection1();

    void setCustomerCollection1(Collection<Customer> customerCollection1);
}
