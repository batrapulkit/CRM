/**
 * Comprehensive logging utility for the CRM application
 * Provides structured logging with timestamps and context
 */

const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

const LOG_COLORS = {
  DEBUG: '#7C3AED',
  INFO: '#3B82F6',
  WARN: '#F59E0B',
  ERROR: '#EF4444',
};

class Logger {
  constructor(context = 'APP') {
    this.context = context;
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  log(level, message, data = null) {
    const timestamp = this.getTimestamp();
    const prefix = `[${timestamp}] [${this.context}] [${level}]`;
    const color = LOG_COLORS[level];

    if (data) {
      console.log(
        `%c${prefix} ${message}`,
        `color: ${color}; font-weight: bold;`,
        data
      );
    } else {
      console.log(`%c${prefix} ${message}`, `color: ${color}; font-weight: bold;`);
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

  group(label) {
    console.group(`%c${label}`, 'color: #8B5CF6; font-weight: bold;');
  }

  groupEnd() {
    console.groupEnd();
  }

  table(data) {
    console.table(data);
  }
}

// Export singleton instances for different modules
export const appLogger = new Logger('APP');
export const clientLogger = new Logger('CLIENT');
export const itineraryLogger = new Logger('ITINERARY');
export const apiLogger = new Logger('API');
export const authLogger = new Logger('AUTH');
export const dashboardLogger = new Logger('DASHBOARD');

export default Logger;
