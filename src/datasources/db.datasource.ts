import {juggler} from '@loopback/repository';
import faunadb from 'faunadb';

export class DbDataSource extends juggler.DataSource {
  static dataSourceName = 'Db';
  client: any;
  query: any;

  constructor() {
    super();
    this.client = new faunadb.Client({
      secret: `${process.env.FAUNADB_SECRET}`,
      keepAlive: false,
    });
    this.query = faunadb.query;
  }
}
