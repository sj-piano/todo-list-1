// Imports
import express from 'express';
import controllers from './controllers/index';
import sequelize, { testDbConnection } from './providers/db';
import { createLogger } from '../lib/logging';
import { logRequestsMiddleware } from './middlewares/log-requests';


// Setup
const { logger, log, deb } = createLogger({fileName: __filename});


// Construct and start app

const app: express.Application = express();

app.use(express.json());
app.use(logRequestsMiddleware);

for (const controller of controllers) {
  app.use(controller.path, controller.router);
}

app.get('/hello', (req, res) => {
  res.send({result: 'Hello World!'});
});

async function main() {
  testDbConnection(sequelize);
  await sequelize.sync({ force: true }); // Wipes the database.
  log("All models were synchronized successfully. Database is empty.");
  app.listen(process.env.HTTP_PORT, async () => {
    logger.info(`Listening on port ${process.env.HTTP_PORT}`);
  });
}

main().catch(e => {
  //logger.error(e);
  process.exit(1);
});