// Imports
import chai from "chai";
import chaiHttp from 'chai-http';

/* Notes

Example script that demonstrates how to communicate with the API.

*/

// Setup
chai.use(chaiHttp);

async function main () {
  const res = await chai.request('http://127.0.0.1:9000').get('/todo/all');
  const todos = res.body.result;
  for (const todo of todos) {
    console.log(todo);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});

