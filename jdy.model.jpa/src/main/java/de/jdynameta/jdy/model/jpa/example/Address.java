/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package de.jdynameta.jdy.model.jpa.example;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Collection;

/**
 *
 * @author rainer
 */
@Entity(name="Address")
@Table(name = "ADDRESS")
public class Address implements Serializable, IAddress {
	private static final long serialVersionUID = 1L;
	@Id
    @Basic(optional = false)
    @Column(name = "ADDRESSID")
	private String addressid;
	@Basic(optional = false)
    @Column(name = "STREET")
	private String street;
	@Basic(optional = false)
    @Column(name = "ZIPCODE")
	private String zipcode;
    @Column(name = "CITY", nullable = false, length = 100)
	private String city;
	@OneToMany(mappedBy = "invoiceaddressAddressid")
	private Collection<Customer> customerCollection;
	@OneToMany(cascade = CascadeType.ALL, mappedBy = "privateaddressAddressid")
	private Collection<Customer> customerCollection1;

	public Address() {
	}

	public Address(String addressid) {
		this.addressid = addressid;
	}

	public Address(String addressid, String street, String zipcode, String city) {
		this.addressid = addressid;
		this.street = street;
		this.zipcode = zipcode;
		this.city = city;
	}

	@Override
	public String getAddressid() {
		return addressid;
	}

	@Override
	public void setAddressid(String addressid) {
		this.addressid = addressid;
	}

	@Override
	public String getStreet() {
		return street;
	}

	@Override
	public void setStreet(String street) {
		this.street = street;
	}

	@Override
	public String getZipcode() {
		return zipcode;
	}

	@Override
	public void setZipcode(String zipcode) {
		this.zipcode = zipcode;
	}

	@Override
	public String getCity() {
		return city;
	}

	@Override
	public void setCity(String city) {
		this.city = city;
	}

	@Override
	public Collection<Customer> getCustomerCollection() {
		return customerCollection;
	}

	@Override
	public void setCustomerCollection(Collection<Customer> customerCollection) {
		this.customerCollection = customerCollection;
	}

	@Override
	public Collection<Customer> getCustomerCollection1() {
		return customerCollection1;
	}

	@Override
	public void setCustomerCollection1(Collection<Customer> customerCollection1) {
		this.customerCollection1 = customerCollection1;
	}

	@Override
	public int hashCode() {
		int hash = 0;
		hash += (addressid != null ? addressid.hashCode() : 0);
		return hash;
	}

	@Override
	public boolean equals(Object object) {
		// TODO: Warning - this method won't work in the case the id fields are not set
		if (!(object instanceof Address)) {
			return false;
		}
		Address other = (Address) object;
		if ((this.addressid == null && other.addressid != null) || (this.addressid != null && !this.addressid.equals(other.addressid))) {
			return false;
		}
		return true;
	}

	@Override
	public String toString() {
		return "de.jdynameta.model.asm.jpa.Address[ addressid=" + addressid + " ]";
	}

}
