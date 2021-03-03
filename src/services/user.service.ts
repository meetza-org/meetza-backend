import {UserService as UService} from '@loopback/authentication';
import {Credentials} from '@loopback/authentication-jwt';
import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {DbDataSource} from '../datasources';
import {User} from '../models';

@injectable({scope: BindingScope.TRANSIENT})
export class UserService implements UService<User, Credentials>{
  DB: any;
  constructor() {
    this.DB = new DbDataSource();
  }

  async verifyCredentials(credentials: Credentials): Promise<User> {
    let invalidCredentialsError = 'Invalid email or password.';
    const {client, query} = this.DB;
    let foundUser = null;
    try {
      foundUser = await client.query(
        query.Get(query.Match("users_by_email", credentials.email))
      );
    }
    catch (err) {
      invalidCredentialsError = 'Invalid email address';
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    if (!foundUser) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    const passwordMatched = await client.query(
      query.Identify(foundUser.ref, credentials.password)
    );

    if (!passwordMatched) {
      invalidCredentialsError = 'Invalid password';
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    return new User({
      id: foundUser.ref,
      firstName: foundUser.data.firstName,
      email: foundUser.data.email,
    });
  }

  convertToUserProfile(user: User): UserProfile {
    return {
      [securityId]: user.id,
      firstName: user.firstName,
      id: user.id,
      email: user.email,
    };
  }
}
