import {inject} from '@loopback/core';
import {get, Response, RestBindings} from '@loopback/rest';
import {DbDataSource} from '../datasources';

export class UserController {
  DB: any;
  constructor(
    @inject(RestBindings.Http.RESPONSE) private response: Response,
  ) {
    this.DB = new DbDataSource();
  }

  @get('/register')
  async register(): Promise<Response> {
    let {response} = this;
    const {client, query} = this.DB;
    console.log("Inside Register");
    const result = await client.query(
      query.Create(
        query.Collection('users'),
        {data: {email: 'test@gmail.com'}}
      )
    );
    console.log(result);
    return response.status(200).send(result);
  }
}
