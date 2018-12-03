package de.jdynameta.jdy.spring.app.config;

import de.jdynameta.jdy.model.jpa.JpaApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableAutoConfiguration
@EntityScan(basePackageClasses= JpaApplication.class)
public class JpaConfiguration {
}
