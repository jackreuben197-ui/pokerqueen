import { UIDefine } from "../../define/UIDefine";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";

const { ccclass, property } = cc._decorator;


export class MineRankData {
    public matchId: number;
    public matchName: string;
    public isRebuy: boolean;
    constructor(p: { matchId, matchName, isRebuy }) {
        this.matchId = p.matchId;
        this.matchName = p.matchName;
        this.isRebuy = p.isRebuy;
    }
}

@ccclass
export default class UIMTTMineRankComponent extends UIBase {





    
    private onCloseClick() {
        UIComponent.close(UIDefine.UIMTTMineRankComponent);
    }

}
