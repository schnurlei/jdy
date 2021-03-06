/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package de.jdynameta.jdy.model.jpa.entity;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

/**
 *
 * @author rainer
 */
@Converter(autoApply = true)
public class LandkreisConverter implements AttributeConverter<Landkreis, String> {

    @Override
    public String convertToDatabaseColumn(Landkreis attribute) {
        return (attribute != null) ? attribute.name() : null;
    }

    @Override
    public Landkreis convertToEntityAttribute(String dbData) {
        return (dbData != null) ? Landkreis.valueOf(dbData): null;
    }


}
