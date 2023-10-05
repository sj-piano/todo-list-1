// Imports
import "dotenv/config";
import chai, { assert, expect } from "chai";
import chaiHttp from "chai-http";
import { describe, it } from 'mocha';


// Local imports
import { getEnvVars } from '../lib/env-vars';
import { createLogger } from '../lib/logging';


// Setup

const { logger, log, deb } = createLogger({fileName: __filename});

const {
  HTTP_PORT,
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_DB,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
} = getEnvVars([
  'HTTP_PORT',
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_DB',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
]);

chai.use(chaiHttp);

const baseURL = `http://127.0.0.1:${HTTP_PORT}`;


describe('API endpoint tests', function () {

  it('should return Hello World! for the hello endpoint', async function () {
    const res = await chai.request(baseURL).get('/hello');
    assert.equal(res.status, 200);
    assert.equal(res.body.result, 'Hello World!');
  });

});


describe('API integration tests', function () {

    /* Larger integration tests are useful for
    a) testing the API as a whole
    b) developing in TDD style - it allows you to construct the necessary state within the API to test the new functionality.
    Later, can write smaller tests.
    */

    it('should create, retrieve, update, and delete a todo item', async function () {
      // Create a todo item.
      const todoData1 = {
        message: 'Hello',
      };
      const response1 = await chai.request(baseURL).post(`/todo/create`).send(todoData1);
      assert.equal(response1.status, 200);
      const todo1 = response1.body.result;
      //log(`Result: ${JSON.stringify(todo1)}`);
      const todoId = todo1.id;
      assert.equal(todo1.message, todoData1.message);
      // Retrieve the todo item.
      const response2 = await chai.request(baseURL).get(`/todo/${todoId}`);
      assert.equal(response2.status, 200);
      const todo2 = response2.body.result;
      assert.equal(todo2.id, todoId);
      assert.equal(todo2.message, todoData1.message);
      // Update the todo item.
      const todoData3 = {
        message: 'Hola',
      };
      const response3 = await chai.request(baseURL).put(`/todo/${todoId}/update`).send(todoData3);
      assert.equal(response3.status, 200);
      const todo3 = response3.body.result;
      assert.equal(todo3.id, todoId);
      // Delete the todo item.
      const response4 = await chai.request(baseURL).delete(`/todo/${todoId}/delete`);
      assert.equal(response4.status, 200);
      const todo4 = response4.body.result;
      assert.equal(todo4.id, todoId);
      assert.equal(todo4.message, todoData3.message);
    });

});


describe('API functional tests', function () {

  const todoData1 = {
    message: 'Hello',
  };

  const todoData2 = {
    message: 'Hola',
  };

  let todoId1 : number;

  before(async function () {
    const response1 = await chai.request(baseURL).post(`/todo/create`).send(todoData1);
    assert.equal(response1.status, 200);
    const todo1 = response1.body.result;
    todoId1 = todo1.id; // store todoId1 for later use
  });

    it('should create a new todo item', async function () {
      const response = await chai.request(baseURL).post(`/todo/create`).send(todoData1);
      assert.equal(response.status, 200);
      const createdTodo = response.body.result;
      assert.equal(createdTodo.message, todoData1.message);
    });

    it('should retrieve an existing todo item', async function () {
      const response2 = await chai.request(baseURL).get(`/todo/${todoId1}`);
      assert.equal(response2.status, 200);
      const retrievedTodo = response2.body.result;
      assert.equal(retrievedTodo.id, todoId1);
      assert.equal(retrievedTodo.message, todoData1.message);
    });

    it('should update an existing todo item', async function () {
      const response = await chai.request(baseURL).put(`/todo/${todoId1}/update`).send(todoData2);
      assert.equal(response.status, 200);
      const updatedTodo = response.body.result;
      assert.equal(updatedTodo.id, todoId1);
      assert.equal(updatedTodo.message, todoData2.message);
    });

    it('should delete an existing todo item', async function () {
      const response = await chai.request(baseURL).delete(`/todo/${todoId1}/delete`);
      assert.equal(response.status, 200);
      const deletedTodo = response.body.result;
      assert.equal(deletedTodo.id, todoId1);
    });

});
