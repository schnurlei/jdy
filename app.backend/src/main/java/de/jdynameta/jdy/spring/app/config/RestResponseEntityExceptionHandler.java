package de.jdynameta.jdy.spring.app.config;

import com.fasterxml.jackson.annotation.JsonFormat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import javax.validation.ConstraintViolationException;
import java.sql.SQLException;
import java.time.LocalDateTime;

@RestControllerAdvice
public class RestResponseEntityExceptionHandler extends ResponseEntityExceptionHandler {

	private static final Logger LOG = LoggerFactory.getLogger(RestResponseEntityExceptionHandler.class);

	@ExceptionHandler(value = { ConstraintViolationException.class})
	public ResponseEntity<Object> handleConstraintViolationException(final ConstraintViolationException ex, final WebRequest request) {

		LOG.error("Exception handled by RestResponseEntityExceptionHandler", ex);

		final CustomErrorResponse response = new CustomErrorResponse("SQLException", ex.getLocalizedMessage());
		return this.handleExceptionInternal(ex, response,
				new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR, request);
	}

	@ExceptionHandler(value = { TransactionSystemException.class })
	public ResponseEntity<Object> handleTransactionSystemException(final TransactionSystemException ex, final WebRequest request) {

		LOG.error("Exception handled by RestResponseEntityExceptionHandler", ex);

		final CustomErrorResponse response = new CustomErrorResponse("TransactionSystemException", ex.getMostSpecificCause().getLocalizedMessage());
		return this.handleExceptionInternal(ex, response,
				new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR, request);
	}

	@ExceptionHandler(value = { SQLException.class })
	public ResponseEntity<Object> handleSQLException(final SQLException ex, final WebRequest request) {

		LOG.error("Exception handled by RestResponseEntityExceptionHandler", ex);

		final CustomErrorResponse response = new CustomErrorResponse("SQLException", ex.getLocalizedMessage());
		return this.handleExceptionInternal(ex, response,
				new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR, request);	}


	@ExceptionHandler(value = { DataIntegrityViolationException.class })
	public ResponseEntity<Object> handleDataIntegrityViolationException(final DataIntegrityViolationException ex, final  WebRequest request) {

		LOG.error("Exception handled by RestResponseEntityExceptionHandler", ex);

		final CustomErrorResponse response = new CustomErrorResponse("DataIntegrityViolationException", ex.getMostSpecificCause().getLocalizedMessage());
		return this.handleExceptionInternal(ex, response,
				new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR, request);
	}

	public static class CustomErrorResponse {

		@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd hh:mm:ss")
		private final LocalDateTime timestamp;
		private final String error;
		private final String message;

		public CustomErrorResponse(final String error, final String message) {

			this.timestamp = LocalDateTime.now();
			this.error = error;
			this.message = message;
		}

		public LocalDateTime getTimestamp() {
			return this.timestamp;
		}

		public String getError() {
			return this.error;
		}

		public String getMessage() {
			return this.message;
		}
	}

}
