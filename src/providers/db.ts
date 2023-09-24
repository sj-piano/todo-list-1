// Imports
import { Sequelize, Model, DataTypes } from 'sequelize';
import { getEnvVars } from '../../lib/env-vars';
import { createLogger } from '../../lib/logging';


// Types
import { TODO } from '../types/todo';


// Setup

const { logger, log, deb } = createLogger({fileName: __filename});

const timestamps = false;

const {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_DB,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
} = getEnvVars([
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_DB',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
]);


// Construct and return database connection

const sequelize = new Sequelize(POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, {
  // 'host' should match the service name defined in the docker-compose.yml for the database service.
  host: POSTGRES_HOST,
  port: Number(POSTGRES_PORT),
  dialect: 'postgres',
  dialectOptions: {
    connectionTimeout: 15000,
  },
  logging: false,
});

export const testDbConnection = async (sequelize: any) => {
  try {
    await sequelize.authenticate();
    log("Database connection has been established successfully.");
  } catch (error) {
    logger.error("Unable to connect to the database:", error);
  }
};

export class Todo extends Model implements TODO {
  declare id: number;
  declare message: string;
  declare label: string;
  declare dueDate: Date;
}

Todo.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'hello',
    tableName: 'hello',
    timestamps,
  }
)

export default sequelize;
