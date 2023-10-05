import audit from 'express-requests-logger';
import { createLogger } from '#lib/logging';

const { logger, log, deb } = createLogger({fileName: __filename});

export const logRequestsMiddleware = audit({
  logger: logger,
  request: {
      excludeHeaders: ['*'],
      maxBodyLength: 50, // limit length to 50 chars + '...'
  },
  response: {
      excludeHeaders: ['*'],
      maxBodyLength: 50, // limit length to 50 chars + '...'
  },
});
