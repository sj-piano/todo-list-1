import audit from 'express-requests-logger';
import { createLogger } from '../../lib/logging';

const { logger, log, deb } = createLogger({fileName: __filename});

export const logRequestsMiddleware = audit({
  logger: logger,
  request: {
      maxBodyLength: 50, // limit length to 50 chars + '...'
  },
  response: {
      maxBodyLength: 50, // limit length to 50 chars + '...'
  },
});