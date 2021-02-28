import {get} from '@loopback/rest';

export class RoomController {
  @get('/hello')
  hello(): string {
    return 'Hello world!';
  }
}
