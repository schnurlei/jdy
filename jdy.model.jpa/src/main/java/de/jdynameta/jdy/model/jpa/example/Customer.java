/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package de.jdynameta.jdy.model.jpa.example;

import javax.persistence.*;
import java.io.Serializable;


/**
 *
 * @author rainer
 */
@Entity
@Table(name = "CUSTOMER")
public class Customer implements Serializable {
	private static final long serialVersionUID = 1L;
	@Id
    @Basic(optional = false)
    @Column(name = "CUSTOMERID")
	private String customerid;
	@Basic(optional = false)
    @Column(name = "FIRSTNAME")
	private String firstname;
	@Column(name = "MIDDLENAME")
	private String middlename;
	@Basic(optional = false)
    @Column(name = "LASTNAME")
	private String lastname;
	@JoinColumn(name = "INVOICEADDRESS_ADDRESSID", referencedColumnName = "ADDRESSID")
    @ManyToOne(targetEntity = Address.class)
	private IAddress invoiceaddressAddressid;
	@JoinColumn(name = "PRIVATEADDRESS_ADDRESSID", referencedColumnName = "ADDRESSID")
    @ManyToOne(optional = false, targetEntity = Address.class)
	private IAddress privateaddressAddressid;

	public Customer() {
	}

	public Customer(String customerid) {
		this.customerid = customerid;
	}

	public Customer(String customerid, String firstname, String lastname) {
		this.customerid = customerid;
		this.firstname = firstname;
		this.lastname = lastname;
	}

	public String getCustomerid() {
		return customerid;
	}

	public void setCustomerid(String customerid) {
		this.customerid = customerid;
	}

	public String getFirstname() {
		return firstname;
	}

	public void setFirstname(String firstname) {
		this.firstname = firstname;
	}

	public String getMiddlename() {
		return middlename;
	}

	public void setMiddlename(String middlename) {
		this.middlename = middlename;
	}

	public String getLastname() {
		return lastname;
	}

	public void setLastname(String lastname) {
		this.lastname = lastname;
	}

	public IAddress getInvoiceaddressAddressid() {
		return invoiceaddressAddressid;
	}

	public void setInvoiceaddressAddressid(IAddress invoiceaddressAddressid) {
		this.invoiceaddressAddressid = invoiceaddressAddressid;
	}

	public IAddress getPrivateaddressAddressid() {
		return privateaddressAddressid;
	}

	public void setPrivateaddressAddressid(IAddress privateaddressAddressid) {
		this.privateaddressAddressid = privateaddressAddressid;
	}

	@Override
	public int hashCode() {
		int hash = 0;
		hash += (customerid != null ? customerid.hashCode() : 0);
		return hash;
	}

	@Override
	public boolean equals(Object object) {
		// TODO: Warning - this method won't work in the case the id fields are not set
		if (!(object instanceof Customer)) {
			return false;
		}
		Customer other = (Customer) object;
		if ((this.customerid == null && other.customerid != null) || (this.customerid != null && !this.customerid.equals(other.customerid))) {
			return false;
		}
		return true;
	}

	@Override
	public String toString() {
		return "de.jdynameta.model.asm.jpa.Customer[ customerid=" + customerid + " ]";
	}

}
