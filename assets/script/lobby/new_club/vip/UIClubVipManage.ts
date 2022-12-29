import BaseForm from "../../../ui/form/BaseForm";



const { ccclass, property } = cc._decorator;

@ccclass
export default class UIClubVipStatistics extends BaseForm {

    //icons = ["gold0", "gold1", "people"];

    Label_People: cc.Label = null;
    Label_Gold: cc.Label = null;
    Label_USDT: cc.Label = null;


    // Com_Game: GGCombobox = null;
    // Com_Gold: GGCombobox = null;

    Detail: cc.Node = null;

    // Com_Game_List = [
    //     { show: "Game0", index: 0 },
    //     { show: "Game1", index: 1 },
    //     { show: "Game2", index: 2 },
    // ];
    // Com_Gold_List = [
    //     { show: "金豆0", index: 0 },
    //     { show: "金豆1", index: 1 },
    //     { show: "金豆2", index: 2 },
    // ];

    Com_Back: cc.Node = null;

    Head: cc.Node = null;

    protected lateLoad() {
        super.lateLoad();
    }

    regiterTouchEvents() {
        super.regiterTouchEvents();
        this.Com_Back.on("click", this.ComBackClick, this);
    }

    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        //初始化界面
    }
    fadeInComplete() {
        super.fadeInComplete();
        //打开完成进行处理
    }
                                                                                                                                                                                                                      
    //底层点击触发combobox组件关闭
    ComBackClick() {
        //this.Com_Game.closeBox();
        //this.Com_Gold.closeBox();
    }

}
