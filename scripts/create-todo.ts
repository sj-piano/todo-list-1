// Imports
import _ from 'lodash';
import axios from 'axios';


// Local imports
import { createLogger } from '#lib/logging';


// Setup

const { logger, log, lj, deb } = createLogger({fileName: __filename});

const baseUrl = 'http://127.0.0.1:9000';


const todoData1 = {
  message: 'Hello',
};


(async function main() {
  let todoId = await createTodo();
  log('todoId:', todoId);
  let todo = await getTodo(todoId);
  log('todo:', todo);
})();


async function createTodo() {
  try {
    const endpoint = '/todo';
    const url = `${baseUrl}${endpoint}`;
    const response = await axios.post(url, todoData1);
    if (response.status !== 200) {
      logger.error('Failed to create todo item.');
      return;
    }
    const result = response.data.result;
    const todoId = result.id;
    return todoId;
  } catch (error) {
    logger.error(`An error occurred: ${error.message || error}`);
  }
}


async function getTodo(todoId: number) {
  try {
    const endpoint = `/todo/${todoId}`;
    const url = `${baseUrl}${endpoint}`;
    const response = await axios.get(url);
    if (response.status !== 200) {
      logger.error('Failed to get todo item.');
      return;
    }
    const result = response.data.result;
    const todo = result;
    return todo;
  } catch (error) {
    logger.error(`An error occurred: ${error.message || error}`);
  }
}
