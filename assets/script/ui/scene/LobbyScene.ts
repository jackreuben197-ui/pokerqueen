import { Web_User_Info } from "../../net/https/WebRequest";
import BaseScene from "./BaseScene";


const { ccclass } = cc._decorator;

@ccclass
export default class LobbyScene extends BaseScene {

    /**
     * 节点|组件 定义
     */
    content: cc.Node = null;
    item: cc.Node = null;
    ////////////////////////////////////
    /**
     * 声明内容
     */

    ////////////////////////////////////


    protected lateEnter(param: any = null) {
        //cc.log("用户数据", Web_User_Info.Response);
        this.content = this.getChildNodeOrComponent("content");
        this.item = this.getChildNodeOrComponent("item");
        this.item.active = false;

        let user = Web_User_Info.Response.data.user;

        for (let key in user) {
            let item = cc.instantiate(this.item);
            item.getComponent(cc.Label).string = `key:${key} | value:${user[key]}`;
            item.active = true;
            item.parent = this.content;
        }

    }
    protected lateExit(param: any = null) {

    }

    protected lateLoad() {
        super.lateLoad();
    }
}
