import {authenticate, TokenService} from '@loopback/authentication';
import {
  MyUserService, TokenServiceBindings,
  UserServiceBindings
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {get, param, Response, RestBindings} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {Socket} from 'socket.io';
import {DbDataSource} from '../datasources';

export class RoomController {
  socket: Socket;
  DB: any;
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE) public jwtService: TokenService,
    @inject(SecurityBindings.USER, {optional: true}) public user: UserProfile,
    @inject(RestBindings.Http.RESPONSE) private response: Response,
    @inject(UserServiceBindings.USER_SERVICE) public userService: MyUserService,
  ) {
    this.DB = new DbDataSource();
  }

  @authenticate("jwt")
  @get('/room/permissions')
  async getRoomPermissions(
    @param.query.string("roomId") roomId = "",
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile): Promise<Response> {
    let {response, DB: {client, query}} = this;
    const user = await this.userService.findUserById(currentUserProfile.id["@ref"].id);
    const hostEmail = await client.query(query.Get(query.Match("room_host", roomId)));
    const permission = user.email === hostEmail.data.host ? "host" : "attendee";

    const result = {
      roomId: roomId,
      permission: permission,
      isStarted: hostEmail.data.isStarted,
    }
    return response.status(200).send(result);
  }

}
