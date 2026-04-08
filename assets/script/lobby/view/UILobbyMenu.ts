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

    // 
    // 背景底板替换:
    @property({ type: [cc.SpriteFrame] })
    spriteFrames: cc.SpriteFrame[] = [];


    protected ACTIVE_YOFFSET: number = 18;
    protected ACTIVE_SCALE: number = 1.45;

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

        // 
        // 先替换按钮的背板:
        let sprite: cc.Sprite = this.$buttons.getComponent(cc.Sprite);
        if (sprite)
            sprite.spriteFrame = this.spriteFrames[index];

        items.forEach((item, index) => {
            let status = status_list[index];
            //item.getChildByName("icon_gray").active = !status;
            //item.getChildByName("select").active = status;

            // 只有icon_light这个结点了：
            const light = item.getChildByName("icon_light");
            if (light) {
                light.active = true;

                if (status && light.scaleX > 1)
                    return;

                // 非选中状态，回到原来的位置
                if (!status && light.scaleX > 1) {
                    light.y -= this.ACTIVE_YOFFSET;
                }
                light.setScale(status ? this.ACTIVE_SCALE : 1);
                if (status) {
                    cc.Tween.stopAllByTarget(light);
                    // 加入缓动：
                    //light.y += this.ACTIVE_YOFFSET;
                    cc.tween(light)
                        .to(0.1, {
                            y: light.y + this.ACTIVE_YOFFSET
                        }, {
                            easing: 'sineOut'
                        }).start();
                }

            }
        });


        //////////////////////////////////
        if (this.index == -1) {
            this.index = index;
            return;
        }
        switch (index) {
            case 0://大厅
                LobbyControl.getInstance().switchContent("UILobbyIndexNew", "main/lobby/index/");
                //UIComponent.Instance.getComponent<UILobbyIndex>("UILobbyIndex").run();
                break;
            case 1://新界面中，１是公会界面：
                LobbyControl.getInstance().switchContent("UIClubList");
                break;
            case 2://新界面中，2是充值界面:
                LobbyControl.getInstance().switchContent("UIFriendMatch");
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
