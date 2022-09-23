

import { json } from "stream/consumers";
import { GameCache } from "../game/GameCache";
import UIBase from "../ui/UIBase";
import UIComponent from "../ui/UIComponent";
import { GM, GM_Templete, Web_GMC_Recharge } from "./GMAPI";


export enum GM_CMD {
    AddCoin,

}
export var CMD_Call = {
    [GM_CMD.AddCoin]: GM.Web_GMC_Recharge,
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIGMComponent extends UIBase {

    submit_text: cc.EditBox = null;

    currCMD: GM_CMD;

    lateLoad() {
        super.lateLoad();
        this.submit_text = this.getChildNodeOrComponent("submit_text", cc.EditBox);
    }

    async onSubmit() {
        let trim_text = this.trim(this.submit_text.string);
        let param = null;
        try {
            param = JSON.parse(trim_text);
        } catch (e) {
            UIComponent.Instance.Toast("指令参数错误");
        }
        if (param) {
            let result = await CMD_Call[this.currCMD](param);
            if (result) {
                UIComponent.Instance.Toast(`${GM_CMD[this.currCMD]} 成功`);
            }
        }
    }

    //增加金币
    onAddCoin() {
        let param = [GameCache.Instance.nUserId];

        let text: string = GM_Templete.Recharge;

        for (let i = 0; i < param.length; i++) {
            text = text.replace(`%${i}`, `${param[i]}`);
        }

        this.submit_text.string = text;

        this.currCMD = GM_CMD.AddCoin;

        // let trim_text = text.trim().replace(/\n/g, "").replace(/ /g, "");

        // console.log(trim_text);

        // let json = JSON.parse(trim_text);

        // console.log(json);

    }

    trim(text: string): string {
        return text.trim().replace(/\n/g, "").replace(/ /g, "");
    }

}
