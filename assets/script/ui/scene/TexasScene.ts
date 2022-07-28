
import TexasConfig from "../../config/TexasConfig";
import { ProcedureEnum } from "../../define/EIDefine";
import ProcedureManager from "../../manager/ProcedureManager";
import GameSession from "../../session/GameSession";
import StorageKey from "../../session/StorageKey";
import BaseScene from "./BaseScene";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TexasScene extends BaseScene {

    /**
     * 节点|组件 定义
     */
    desk_bg: cc.Sprite = null;
    table_bg: cc.Sprite = null;

    ///////////////////////////////////

    /**
     * 声明内容
     */

    ///////////////////////////////////
    protected lateLoad(): void {
        super.lateLoad();
        this.desk_bg = this.getChildNodeOrComponent("desk_bg", cc.Sprite);
        this.table_bg = this.getChildNodeOrComponent("table_bg", cc.Sprite);

    }
    setDeskType(index: number) {
        let sps = GameSession.texasGame.getDeskSpriteFrames(index);
        this.desk_bg.spriteFrame = sps[0];
        this.desk_bg.spriteFrame = sps[0];
    }

    Enter(param: any): void {

        super.Enter(param);

        this.setDeskType(GameSession.texasGame.deskType);


    }
    Exit(param) {
        super.Exit(param);
    }
}
