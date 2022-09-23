

import { GameCache } from "../game/GameCache";
import UIBase from "../ui/UIBase";
import { GM_Templete } from "./GMAPI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIGMComponent extends UIBase {



    //增加金币
    onAddCoin() {
        let param = [GameCache.Instance.nUserId];

        //for()

        let text = GM_Templete.Recharge.replace
    }

}
