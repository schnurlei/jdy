/**
 *
 * Copyright 2011 (C) Rainer Schneider,Roggenburg <schnurlei@googlemail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
package de.jdynameta.jdy.model.jpa.test;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.validation.constraints.*;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.Date;

/**
 *  *
 * @author Rainer Schneider
 * @version
 */
@Entity(name="AllAttributeType")
public class AllAttributeType

{
    @Id
    private long id;
    @Min(Short.MIN_VALUE)
    @Max(Short.MAX_VALUE)
    private Short shortData;
    @Min(Integer.MIN_VALUE)
    @Max(Integer.MAX_VALUE)
    private Integer integerData;
    @Min(Long.MIN_VALUE)
    @Max(Long.MAX_VALUE)
    private Long longData;
    private Boolean booleanData;
    private String clobData;

    @DecimalMin("-100000.0")
    @DecimalMax("999999.99")
    private BigDecimal currencyData;
    private Date dateData;
    private Float floatData;
    private Double doubleData;
    private String textData;
    private Timestamp timestampData;
    @Email
    private String email;

    public long getId() {
        return this.id;
    }

    public void setId(final long id) {
        this.id = id;
    }

    public Short getShortData() {
        return this.shortData;
    }

    public void setShortData(final Short shortData) {
        this.shortData = shortData;
    }

    public Integer getIntegerData() {
        return this.integerData;
    }

    public void setIntegerData(final Integer integerData) {
        this.integerData = integerData;
    }

    public Long getLongData() {
        return this.longData;
    }

    public void setLongData(final Long longData) {
        this.longData = longData;
    }

    public Boolean getBooleanData() {
        return this.booleanData;
    }

    public void setBooleanData(final Boolean booleanData) {
        this.booleanData = booleanData;
    }

    public String getClobData() {
        return this.clobData;
    }

    public void setClobData(final String clobData) {
        this.clobData = clobData;
    }

    public BigDecimal getCurrencyData() {
        return this.currencyData;
    }

    public void setCurrencyData(final BigDecimal currencyData) {
        this.currencyData = currencyData;
    }

    public Date getDateData() {
        return this.dateData;
    }

    public void setDateData(final Date dateData) {
        this.dateData = dateData;
    }

    public Float getFloatData() {
        return this.floatData;
    }

    public void setFloatData(final Float floatData) {
        this.floatData = floatData;
    }

    public Double getDoubleData() {
        return this.doubleData;
    }

    public void setDoubleData(final Double doubleData) {
        this.doubleData = doubleData;
    }

    public String getTextData() {
        return this.textData;
    }

    public void setTextData(final String textData) {
        this.textData = textData;
    }

    public Timestamp getTimestampData() {
        return this.timestampData;
    }

    public void setTimestampData(final Timestamp timestampData) {
        this.timestampData = timestampData;
    }

    public String getEmail() {
        return this.email;
    }

    public void setEmail(final String email) {
        this.email = email;
    }
}
