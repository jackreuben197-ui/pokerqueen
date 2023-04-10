/*
 * @Author: xfj
 * @Date: 2023-03-14 20:17:12
 * @description: 
 * @LastEditors: 
 * @LastEditTime: 2023-04-10 15:00:27
 * @FilePath: /pokerqueen/assets/script/procedure/ProcedureLobby.ts
 */

import { EventName } from "../config/EventName";
import { UIDefine } from "../define/UIDefine";
import GC from "../frame/GameControl";
import SceneManager from "../manager/SceneManager";
import PacketHead from "../net/websocket/PacketHead";
import WebSocketClient from "../net/websocket/WebSocketClient";
import LobbySession from "../session/LobbySession";
import UIComponent from "../ui/UIComponent";
import ProcedureBase from "./ProcedureBase";

/**
 * 大厅进程
 */
export default class ProcedureLobby extends ProcedureBase {

    Name: string = "ProcedureLobby";

    lateEnter(param?: any) {

        super.lateEnter(param);

        //mode 0:正常登錄進入 1:牌桌回大廳
        //table_type 0:大廳桌子 1:公會桌子 2:朋友桌 3:MTT桌
        if (param.mode == 0) {
            PacketHead.Init();
            LobbySession.Init();
            WebSocketClient.Connect();
        }
        SceneManager.Instance.switchScene(UIDefine.LobbyScene, null, param);


        console.log("進入大廳的參數:", param);

        //從牌桌内退出,判斷返回到哪個頁面
        if (param.mode == 1) {

            switch (param.game_enter_type) {

                case 0://大廳桌子
                    break;
                case 1://工會
                    UIComponent.open(UIDefine.UIClubHome, null, { SceneUI: SceneManager.Instance.currUI, jumpShow: true });
                    break;
                case 2://朋友
                    GC.notify.post(EventName.updateFriendChessView)
                    break;
                case 3://MTT
                    UIComponent.open(UIDefine.MttDetailForm, null, { SceneUI: SceneManager.Instance.currUI, jumpShow: true });
                    UIComponent.open(UIDefine.MttListForm, null, { jumpShow: true });
                    break;

            }
        }
    }
    Leave() {
        super.Leave();
    }
}
