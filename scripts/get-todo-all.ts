// Imports
import chai from "chai";
import chaiHttp from 'chai-http';

/* Notes

Example script that demonstrates how to communicate with the API.

*/

// Setup
chai.use(chaiHttp);

async function main () {
  const res = await chai.request('http://localhost:9000').get('/todo/all');
  console.log(res.body);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});

