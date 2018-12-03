package de.jdynameta.jdy.spring.app.rest;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR)
public class GeneralRestException extends RuntimeException {

    public GeneralRestException() {
        super();
    }
    public GeneralRestException(String message, Throwable cause) {
        super(message, cause);
    }
    public GeneralRestException(String message) {
        super(message);
    }
    public GeneralRestException(Throwable cause) {
        super(cause);
    }
}
