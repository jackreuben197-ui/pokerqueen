/**
 * GameConfig
 * 游戏配置
 */

import { INetWork } from "../define/EIDefine";

export class GameConfig {
    //设计分辨率
    static DesignResolution = cc.size(1242, 2688);
    //fps
    static FrameRate = 60;
    //多点触摸
    static ENABLE_MULTI_TOUCH = false;

    //服务器类型 1测试 2正式
    static Server_Type = 2;

    //对应 GlobalProto.txt
    static C_GlobalProto = null;
    //网络配置
    static Network: INetWork;

}