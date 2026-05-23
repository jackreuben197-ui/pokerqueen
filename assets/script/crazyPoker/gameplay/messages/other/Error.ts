import { ServerMessageError } from '../../../../protobuf/holdem/recv_g_error_pb';

// Error 99
export default function Error(data: ServerMessageError.AsObject, roomID: number, matchID: number) {}
