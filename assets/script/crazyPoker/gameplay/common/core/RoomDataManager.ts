import { traceClass } from './LogTrace';
import RoomData from './RoomData';

@traceClass()
class RoomDataManager {
    private _roomCache: Map<string, RoomData> = new Map();

    constructor() {
        this.tracelog.debug('[RoomDataManager] 数据总管单例初始化');
    }

    public existRoomData(roomID: number, matchID: number): boolean {
        const key = roomID + '-' + matchID;
        return this._roomCache.has(key);
    }

    // 获取或创建对应房间的数据实例
    public getRoomData<T extends RoomData>(roomID: number, matchID: number): T {
        const key = roomID + '-' + matchID;
        if (!this._roomCache.has(key)) {
            this.tracelog.warn('no room data', roomID, matchID);
            return null;
        }
        return this._roomCache.get(key) as T;
    }

    public setRoomData<T extends RoomData>(roomID: number, matchID: number, data: T) {
        const key = roomID + '-' + matchID;
        this._roomCache.set(key, data);
    }

    // 清理房间数据
    public deleteRoomData(roomID: number, matchID: number) {
        const key = roomID + '-' + matchID;
        this._roomCache.delete(key);
    }
}

//核心：直接 new 出实例，并作为默认导出
const roomDataManager = new RoomDataManager();

export default roomDataManager;
