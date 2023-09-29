// Imports
import "dotenv/config";
import chai, { assert, expect } from "chai";
import chaiHttp from "chai-http";
import { describe, it } from 'mocha';
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

const baseURL = `http://localhost:${HTTP_PORT}`;


describe('Basic endpoint tests', function () {

  it('should return Hello World! for the root endpoint', async function () {
    const res = await chai.request(baseURL).get('/');
    assert.equal(res.status, 200);
    assert.equal(res.body.result, 'Hello World!');
  });

});


describe('Integration tests', function () {

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
