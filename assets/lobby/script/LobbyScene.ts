const { ccclass, property } = cc._decorator;
import BaseScene from "../../../assets/script/ui/scene/BaseScene";
import { ResManager } from "../../../assets/script/manager/ResManager";

import HttpRequest from "../../../assets/script/net/https/HttpRequest";
import { Web_Config_Global_Config } from "../../../assets/script/net/https/WebRequest";
import { Web_Config_Multi_Language_Template } from "../../../assets/script/net/https/WebRequest";
@ccclass
export default class UIMatchComponent extends BaseScene {
    private uiMap = {};
    private currUI: cc.Node = null;
    private Layer: cc.Node = null;
    protected onLoad(): void {
        cc.log(`UIMatchComponent onLoad`);
        super.onLoad();
        let widget: cc.Widget = this.node.getComponent(cc.Widget);
        widget.target = cc.find("Canvas");
    }
    protected lateEnter(): void {
        cc.log(`UIMatchComponent lateEnter`);
        this.Layer = this.getChildNodeOrComponent("Layer");
        this.switchContent("UILobby")
        // this.setScrollTop();
        //首次进入是大厅
        this.Get_Web_Config_Global_Config();
        this.Get_Web_Config_Multi_Language_Template();
    }
    /**
  * 大厅 聊天室 战绩 我的 切换
  * currEnterParams 进入当前场景的参数
  * preExitParams 退出前一个场景的参数
  */
    public switchContent(content: string) {

        let newUI = this.uiMap[content];

        if (newUI) {
            if (this.currUI) {
                this.currUI.opacity = 0;
            }
            newUI.opacity = 255;
        } else {
            ResManager.Load("lobby", "prefab/" + content, cc.Prefab, (err, asset: cc.Prefab) => {
                if (err) {
                    return;
                }
                newUI = cc.instantiate(asset);
                this.Layer.addChild(newUI);
                this.currUI = newUI;
                this.uiMap[content] = newUI;
                newUI.active = true;
            });
        }
    }
    //获取一些接口数据
      //配置请求
      async Get_Web_Config_Global_Config() {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Config_Global_Config,
                param: Web_Config_Global_Config.Request({}),
                onSuccess: function () {
                    cc.log("Web_Config_Global_Config.Data", Web_Config_Global_Config.Response.data);
                    resolve(Web_Config_Global_Config.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    //获取多语言配置
    async Get_Web_Config_Multi_Language_Template() {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Config_Multi_Language_Template,
                param: Web_Config_Multi_Language_Template.Request({}),
                onSuccess: function () {
                    cc.log("Web_Config_Multi_Language_Template.Data", Web_Config_Multi_Language_Template.Response.data);
                    resolve(Web_Config_Multi_Language_Template.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
}
