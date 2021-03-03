import {authenticate, TokenService} from '@loopback/authentication';
import {
  MyUserService,
  TokenServiceBindings,
  UserServiceBindings
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {get} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';

export class RoomController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
  ) { }

  @authenticate('jwt')
  @get('/hello')
  hello(): string {
    return 'Hello world!';
  }
}
