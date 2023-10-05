// Imports
import _ from 'lodash';
import axios from 'axios';


// Local imports
import utils, { jd } from '#lib/utils';
import { createLogger } from '#lib/logging';


// Setup

const { logger, log, lj, deb } = createLogger({fileName: __filename});

const baseUrl = 'http://127.0.0.1:9000';



(async function main() {
  let todos = await getTodos();
  let msg = 'todos:';
  if (_.isEmpty(todos)) {
    msg += ' None';
  } else {
    for (let todo of todos) {
      msg += `\n- ${jd(todo)}`;
    }
  }
  log(msg);
})();


async function getTodos() {
  try {
    const endpoint = `/todo`;
    const url = `${baseUrl}${endpoint}`;
    const response = await axios.get(url);
    if (response.status !== 200) {
      logger.error('Failed to get todo items.');
      return;
    }
    const todos = response.data.result;
    return todos;
  } catch (error) {
    logger.error(`An error occurred: ${error.message || error}`);
  }
}
