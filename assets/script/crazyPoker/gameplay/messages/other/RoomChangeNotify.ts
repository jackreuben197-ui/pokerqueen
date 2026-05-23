import { ServerMessageRoomChangeNotify } from '../../../../protobuf/holdem/recv_g_room_change_notify_pb';

// RoomChangeNotify 140
export default function RoomChangeNotify(data: ServerMessageRoomChangeNotify.AsObject, roomID: number, matchID: number) {}
