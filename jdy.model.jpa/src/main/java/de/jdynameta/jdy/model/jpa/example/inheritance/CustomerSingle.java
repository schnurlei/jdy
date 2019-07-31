package de.jdynameta.jdy.model.jpa.example.inheritance;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;


@Table(name = "CUSTOMERJ")
@Entity(name = "CUSTOMERJ") //Name of the entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "CUST_TYPE", discriminatorType = DiscriminatorType.STRING, length = 10)
@DiscriminatorValue("RETAIL")

public class CustomerSingle implements Serializable {

    @Id //signifies the primary key
    @Column(name = "CUST_ID", nullable = false, insertable = false, updatable = false)
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long custId;

    @Column(name = "FIRST_NAME", nullable = false, length = 50)
    private String firstName;

    @Column(name = "LAST_NAME", length = 50)
    private String lastName;

    @Embedded
    private CustomerAddress address = new CustomerAddress();

    @Column(name = "CUST_TYPE", length = 10, insertable = false, updatable = false)
    private String custType;
    @Version
    @Column(name = "LAST_UPDATED_TIME")
    private LocalDateTime updatedTime;

    public long getCustId() {
        return custId;
    }

    public void setCustId(long custId) {
        this.custId = custId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public LocalDateTime getUpdatedTime() {
        return updatedTime;
    }

    public void setUpdatedTime(LocalDateTime updatedTime) {
        this.updatedTime = updatedTime;
    }

    public CustomerAddress getAddress() {
        return address;
    }

    public void setAddress(CustomerAddress address) {
        this.address = address;
    }

    public String getCustType() {
        return custType;
    }

    public void setCustType(String custType) {
        this.custType = custType;
    }

//		 ToString()
    public String toString() {
        StringBuffer sb = new StringBuffer();
        sb.append("custId : " + custId);
        sb.append("   First Name : " + firstName);
        sb.append("   Last Name : " + lastName);
        sb.append("   customer type : " + custType);

        return sb.toString();
    }
}
