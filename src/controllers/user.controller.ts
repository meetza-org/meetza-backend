import {TokenService} from '@loopback/authentication';
import {
  Credentials,
  MyUserService,
  TokenServiceBindings,
  UserServiceBindings
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {HttpErrors, post, requestBody, Response, RestBindings} from '@loopback/rest';
import {DbDataSource} from '../datasources';

type RegisterSchema = {
  email: string;
  firstName: string;
  password: string;
};

export class UserController {
  DB: any;
  constructor(
    @inject(RestBindings.Http.RESPONSE) private response: Response,
    @inject(TokenServiceBindings.TOKEN_SERVICE) public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE) public userService: MyUserService,
  ) {
    this.DB = new DbDataSource();
  }

  @post('/register')
  async register(@requestBody() {email, firstName, password}: RegisterSchema): Promise<Response> {
    let {response, DB: {client, query}} = this;
    let result: any;
    try {
      result = await client.query(
        query.Create(
          query.Collection('users'),
          {
            credentials: {password: password},
            data: {
              email: email,
              firstName: firstName,
            }
          }
        )
      );
    }
    catch (err) {
      if (err.description === "document is not unique.") {
        return response.status(500).send(new HttpErrors.Unauthorized("Email address already registered"));
      }
      else {
        console.log(err);
        return response.status(500).send(new HttpErrors.Unauthorized("Oops! Something went wrong"));
      }
    }
    return response.status(200).send(result);
  }

  @post('/login')
  async login(@requestBody() credentials: Credentials): Promise<Response> {
    let {response} = this;
    let result: any;
    try {
      // ensure the user exists, and the password is correct
      const user = await this.userService.verifyCredentials(credentials);
      // convert a User object into a UserProfile object (reduced set of properties)
      const userProfile = this.userService.convertToUserProfile(user);
      // create a JSON Web Token based on the user profile
      console.log(userProfile);
      const token = await this.jwtService.generateToken(userProfile);

      result = {
        email: user.email,
        firstName: user.firstName,
        token: token,
      }
    }
    catch (err) {
      console.log(err);
      return response.status(500).send(err);
    }
    return response.status(200).send(result);
  }
}
