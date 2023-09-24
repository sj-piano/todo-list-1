// Imports
import axios from 'axios';
import { createLogger } from '../../lib/logging';
import utils from '../../lib/utils';
import { getEnvVar } from '../../lib/env-vars';

// Types
import { Label } from '../types/label';

// Setup
const LABELS_ENDPOINT = getEnvVar('LABELS_ENDPOINT');
const { logger, log, deb } = createLogger({fileName: __filename});


async function fetchLabels(): Promise<Label[]> {
  try {
    const response = await axios.get(LABELS_ENDPOINT);
    return response.data;
  } catch (error) {
    // Handle errors here, e.g., log the error.
    logger.error('Error fetching labels:', error);
    throw error;
  }
}

export async function loadLabels(retries = 3): Promise<Label[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const labels = await fetchLabels();
      return labels;
    } catch (error) {
      if (attempt < retries) {
        log(`Loading labels (attempt ${attempt})...`);
        await utils.sleep({seconds: 1});
      } else {
        // If all retries fail, return a default value.
        log('All retry attempts failed.');
        return [
          {
            id: 'X',
            name: 'Label service down',
          },
        ];
      }
    }
  }
}
