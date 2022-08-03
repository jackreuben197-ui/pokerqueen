import TexasConfig from "../config/TexasConfig";
import { UIDefine } from "../define/UIDefine";
import Dispatcher from "../event/Dispatcher";
import UpdateComponent from "../funcomponent/UpdateComponent";
import SceneManager from "../manager/SceneManager";
import { ProtocolCode } from "../net/websocket/ProtocolCode";
import { ServerMessageEnterRoom } from "../protobuf/holdem/req_enter_room_pb";
import StorageKey from "../session/StorageKey";
import AssetContext from "../ui/component/AssetContext";
import FSMLogicComponent from "./FSMLogicComponent";
import GameSession from "./GameSession";
import TexasGameMessageHandler from "./TexasGameMessageHandler";
import TexasGameProtocol from "./TexasGameProtocol";
import TexasScene from "./TexasScene";
import TexasSMAgency from "./TexasSMAgency";



export default class TexasGame {

    private setting = {
        deskType: null,
    };
    //桌布资源索引[desk,table]
    deskTypeIndexs = [
        [0],
        [1],
        [2],
        [3],
        [4],
        [5],
        [6],
        [7],
        [8, 1],
        [9, 2],
        [10, 3],
        [11, 5],
    ];

    public IsLookOn: boolean = false;

    public gameUI: TexasScene = null;

    public messageHandler: TexasGameMessageHandler = null;

    public texasGameProtocol: TexasGameProtocol = null;

    public gameLogicSMComponent: FSMLogicComponent = null;

    public SMAgency: TexasSMAgency = null;

    constructor() {
        this.messageHandler = new TexasGameMessageHandler(this);
        this.texasGameProtocol = new TexasGameProtocol(this);
        this.gameLogicSMComponent = new FSMLogicComponent();
        this.SMAgency = new TexasSMAgency(this);
    }

    start() {
        UpdateComponent.Add(this.gameLogicSMComponent, this);
        this.gameLogicSMComponent.start();
        this.SMAgency.LoadGameStateConf();
        SceneManager.ins.switchScene(UIDefine.TexasScene);
    }


    RegisterMsgHandler() {
        this.messageHandler.RegisterMessageHandler();
        this.texasGameProtocol.RegisterMsgHandler();
    }


    //获取桌面样式
    get deskType() {

        (this.setting.deskType == null) && (this.setting.deskType = +localStorage.getItem(StorageKey.SettingDeskType) || TexasConfig.DefaultDeskType);

        return this.setting.deskType;
    }
    //根据样式获取桌布资源
    getDeskSpriteFrames(index: number): cc.SpriteFrame[] {
        let c = this.deskTypeIndexs[index] || this.deskTypeIndexs[0]
        let desk = AssetContext.getAsset("TexasDeskBg" + c[0]) as cc.SpriteFrame;
        let table = AssetContext.getAsset("TexasTableBg" + c[1]) as cc.SpriteFrame;
        return [desk, table];
    }

    public RegiterEnterRoom() {
        Dispatcher.on(ProtocolCode.Protocol_Holdem_EnterRoom, this.messageHandler.Protocol_Holdem_EnterRoom_Handler, this.messageHandler);
    }
    public UnRegiterEnterRoom() {
        Dispatcher.off(ProtocolCode.Protocol_Holdem_EnterRoom, this.messageHandler.Protocol_Holdem_EnterRoom_Handler, this.messageHandler);
    }

    public EnterRoom() {
        GameSession.EnterRoom();
    }
    //更新房间数据
    public UpdateRoom(obj: any) {

        if (obj instanceof ServerMessageEnterRoom) {
            this.UpdateRoomCommon(obj);
        }
    }
    UpdateRoomCommon(obj: any) {

    }
}
