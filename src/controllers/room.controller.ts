import {TokenService} from '@loopback/authentication';
import {
  TokenServiceBindings
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {Response, RestBindings} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {Socket} from 'socket.io';

export class RoomController {
  socket: Socket;
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE) public jwtService: TokenService,
    @inject(SecurityBindings.USER, {optional: true}) public user: UserProfile,
    @inject(RestBindings.Http.RESPONSE) private response: Response,
  ) { }



}
