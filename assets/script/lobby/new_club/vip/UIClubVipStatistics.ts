import WebImageHelper from "../../../helper/WebImageHelper";
import GGCombobox from "../../../ui/component/GGCombobox";
import BaseForm from "../../../ui/form/BaseForm";
import BaseFormPlus from "../../../ui/form/BaseFormPlus";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIClubVipStatistics extends BaseFormPlus {

    ///////////////////////引用声明////////////////////////
    cc_Label$People: cc.Label = null;
    cc_Label$Gold: cc.Label = null;
    cc_Label$USDT: cc.Label = null;

    GGCombobox$Game: GGCombobox = null;
    GGCombobox$Gold: GGCombobox = null;

    $Detail: cc.Node = null;
    $Com_Back: cc.Node = null;
    $Head: cc.Node = null;
    ////////////////////////////////////////////////////

    Com_Game_List = [
        { show: "Game0", index: 0 },
        { show: "Game1", index: 1 },
        { show: "Game2", index: 2 },
    ];
    Com_Gold_List = [
        { show: "金豆0", index: 0 },
        { show: "金豆1", index: 1 },
        { show: "金豆2", index: 2 },
    ];


    protected lateLoad() {
        super.lateLoad();

        this.GGCombobox$Game.onOpen = this.Game_ComOpen.bind(this);
        this.GGCombobox$Game.onSelect = this.Game_ComSelect.bind(this);

        this.GGCombobox$Gold.onOpen = this.Gold_ComOpen.bind(this);
        this.GGCombobox$Gold.onSelect = this.Gold_ComSelect.bind(this);
    }

    regiterTouchEvents() {
        super.regiterTouchEvents();
        this.$Com_Back.on("click", this.ComBackClick, this);
    }

    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        //初始化界面
        this.GGCombobox$Game.closeBox();
        this.GGCombobox$Gold.closeBox();
        this.GGCombobox$Game.bindList(this.Com_Game_List);
        this.GGCombobox$Gold.bindList(this.Com_Gold_List);
        ////////////////////////////////////////////////////
        this.RefreshHeader(["", "w", "ID: 9999999"]);
        this.RefreshUICount([0, 0, 0]);

        this.RefreshDetailItem(this.$Detail.getChildByName("Item1"), [8, 8, 8]);
        this.RefreshDetailItem(this.$Detail.getChildByName("Item2"), [8, 8, 8]);
        this.RefreshDetailItem(this.$Detail.getChildByName("Item3"), [8, 8, 8]);
    }
    fadeInComplete() {
        super.fadeInComplete();
        //打开完成进行处理
        console.log("完成");
    }

    Game_ComOpen() {
        this.GGCombobox$Gold.closeBox();
    }
    Game_ComSelect(index: number) {
        console.log(index);
    }
    Gold_ComOpen() {
        this.GGCombobox$Game.closeBox();
    }
    Gold_ComSelect(index: number) {
        console.log(index);
    }

    //底层点击触发combobox组件关闭
    ComBackClick() {
        this.GGCombobox$Game.closeBox();
        this.GGCombobox$Gold.closeBox();
    }
    //////////////////////刷新
    SetLabel(node: cc.Node, path: string, value: string) {
        cc.find(path, node).getComponent(cc.Label).string = value;
    }
    SetImage(node: cc.Node, value: string) {
        let sprite = node.getComponent(cc.Sprite);
        sprite && WebImageHelper.SetHeadImage(sprite, value);
    }
    //刷新详情Item
    RefreshDetailItem(item: cc.Node, data: number[]) {
        this.SetLabel(item, "Label_Total", `${data[0]}`);
        this.SetLabel(item, "Label_Today", `${data[1]}`);
        this.SetLabel(item, "Label_Past", `${data[2]}`);
    }
    //刷新头部
    RefreshHeader(data: string[]) {
        this.SetImage(this.$Head, data[0]);
        this.SetLabel(this.$Head, "Label_Nick", data[1]);
        this.SetLabel(this.$Head, "Label_ID", data[2]);
    }
    //刷新成员金豆usdt数量
    RefreshUICount(data: number[]) {
        this.cc_Label$People.string = `${data[0]}`;
        this.cc_Label$Gold.string = `${data[1]}`;
        this.cc_Label$USDT.string = `${data[2]}`;

    }
}
