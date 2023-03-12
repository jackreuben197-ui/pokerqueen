const { ccclass, property } = cc._decorator;
import TabsGroup from "../../common/TabsGroup";
import { Tabs_Status } from "../../config/GameConfig";
import UILobbyIndex from "../../new_lobby/index/UILobbyIndex";

import UIBasePlus from "../../ui/UIBasePlus";
import UIComponent from "../../ui/UIComponent";
import { LobbyControl } from "../control/LobbyControl";

@ccclass
export default class UILobbyMenu extends UIBasePlus {

    $buttons: cc.Node = null;
    menu_group: TabsGroup = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.menu_group = new TabsGroup(this.$buttons.children, this.onMenuItemClick, this);
    }
    onShow() {
        this.index = -1;
        this.menu_group.reset(0);
    }
    onMenuItemClick(items: cc.Node[], index: number) {
        let status_list = Tabs_Status[index];
        items.forEach((item, index) => {
            let status = status_list[index];
            item.getChildByName("icon_gray").active = !status;
            item.getChildByName("icon_light").active = status;
            item.getChildByName("select").active = status;
        })
        //////////////////////////////////
        if (this.index == -1) {
            this.index = index;
            return;
        }
        switch (index) {
            case 0://大厅
                LobbyControl.getInstance().switchContent("UILobbyIndex", "main/lobby/index/");
                UIComponent.Instance.getComponent<UILobbyIndex>("UILobbyIndex").run();
                break;
            case 1://朋友
                LobbyControl.getInstance().switchContent("UIFriendMatch")
                break;
            case 2://公会
                LobbyControl.getInstance().switchContent("UIClubList")
                break;
            case 3://生涯
                LobbyControl.getInstance().switchContent("UICareer")
                break;
            case 4://我得
                LobbyControl.getInstance().switchContent("UIMe", "main/lobby/me/");
                break;
        }
    }

}
