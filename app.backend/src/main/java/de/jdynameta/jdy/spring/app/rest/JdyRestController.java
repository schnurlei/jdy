package de.jdynameta.jdy.spring.app.rest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class JdyRestController {

    private static final Logger LOG = LoggerFactory.getLogger(JdyRestController.class);

    @RequestMapping(value="about",method= RequestMethod.GET)
    public String about() {
        LOG.info("about");
        return "JDY Rest Service";
    }

}
