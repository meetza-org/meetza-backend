import {juggler} from '@loopback/repository';
import faunadb from 'faunadb';

const config = {
  secret: `${process.env.FAUNADB_SECRET}`,
  keepAlive: false,
}

export class DbDataSource extends juggler.DataSource {
  static dataSourceName = 'Db';
  client: any;
  query: any;
  static readonly defaultConfig = config;

  constructor() {
    super(config);
    console.log(config);
    this.client = new faunadb.Client(config);
    this.query = faunadb.query;
  }
}
