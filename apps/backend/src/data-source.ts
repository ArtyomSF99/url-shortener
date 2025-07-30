import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { RunMode } from './common/config/run-mode.enum';

/**
 * TypeORM data source configuration.
 */
dotenv.config();

const isProduction = process.env.NODE_ENV === RunMode.PRODUCTION;

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: !isProduction,
  poolSize: 50,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;