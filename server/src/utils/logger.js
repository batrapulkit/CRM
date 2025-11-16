/**
 * Comprehensive logging utility for the backend
 * Provides structured logging with timestamps and context
 */

const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

class Logger {
  constructor(context = 'APP') {
    this.context = context;
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  formatMessage(level, message, data = null) {
    const timestamp = this.getTimestamp();
    const prefix = `[${timestamp}] [${this.context}] [${level}]`;
    
    if (data) {
      return `${prefix} ${message} ${JSON.stringify(data, null, 2)}`;
    }
    return `${prefix} ${message}`;
  }

  log(level, message, data = null) {
    const formattedMessage = this.formatMessage(level, message, data);
    
    switch (level) {
      case LOG_LEVELS.DEBUG:
        console.log('\x1b[36m%s\x1b[0m', formattedMessage); // Cyan
        break;
      case LOG_LEVELS.INFO:
        console.log('\x1b[32m%s\x1b[0m', formattedMessage); // Green
        break;
      case LOG_LEVELS.WARN:
        console.warn('\x1b[33m%s\x1b[0m', formattedMessage); // Yellow
        break;
      case LOG_LEVELS.ERROR:
        console.error('\x1b[31m%s\x1b[0m', formattedMessage); // Red
        break;
      default:
        console.log(formattedMessage);
    }
  }

  debug(message, data = null) {
    this.log(LOG_LEVELS.DEBUG, message, data);
  }

  info(message, data = null) {
    this.log(LOG_LEVELS.INFO, message, data);
  }

  warn(message, data = null) {
    this.log(LOG_LEVELS.WARN, message, data);
  }

  error(message, error = null) {
    if (error instanceof Error) {
      this.log(LOG_LEVELS.ERROR, message, {
        message: error.message,
        stack: error.stack,
      });
    } else {
      this.log(LOG_LEVELS.ERROR, message, error);
    }
  }

  logRequest(req, message = 'Incoming request') {
    this.info(message, {
      method: req.method,
      path: req.path,
      query: req.query,
      userId: req.user?.id,
      agencyId: req.user?.agency_id,
    });
  }

  logResponse(statusCode, message = 'Response sent') {
    this.info(message, { statusCode });
  }

  logDatabaseOperation(operation, table, details = {}) {
    this.debug(`Database ${operation} on ${table}`, details);
  }
}

// Export singleton instances for different modules
export const appLogger = new Logger('APP');
export const clientLogger = new Logger('CLIENT');
export const itineraryLogger = new Logger('ITINERARY');
export const authLogger = new Logger('AUTH');
export const databaseLogger = new Logger('DATABASE');
export const apiLogger = new Logger('API');

export default Logger;
