import WebImageHelper from "../../../helper/WebImageHelper";
import GGCombobox from "../../../ui/component/GGCombobox";
import BaseForm from "../../../ui/form/BaseForm";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIClubVipStatistics extends BaseForm {

    ///////////////////////引用声明////////////////////////
    Label_People: cc.Label = null;
    Label_Gold: cc.Label = null;
    Label_USDT: cc.Label = null;
    Com_Game: GGCombobox = null;
    Com_Gold: GGCombobox = null;
    Detail: cc.Node = null;
    Com_Back: cc.Node = null;
    Head: cc.Node = null;
    protected declare_list: any = [
        ["Com_Game", GGCombobox],
        ["Com_Gold", GGCombobox],
        ["Com_Back"],
        ["Head"],
        ["Detail"],
        ["Label_People", cc.Label],
        ["Label_Gold", cc.Label],
        ["Label_USDT", cc.Label],
    ]
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

        this.Com_Game.onOpen = this.Game_ComOpen.bind(this);
        this.Com_Game.onSelect = this.Game_ComSelect.bind(this);

        this.Com_Gold.onOpen = this.Gold_ComOpen.bind(this);
        this.Com_Gold.onSelect = this.Gold_ComSelect.bind(this);
    }

    regiterTouchEvents() {
        super.regiterTouchEvents();
        this.Com_Back.on("click", this.ComBackClick, this);
    }

    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        //初始化界面
        this.Com_Game.closeBox();
        this.Com_Gold.closeBox();
        this.Com_Game.bindList(this.Com_Game_List);
        this.Com_Gold.bindList(this.Com_Gold_List);
        ////////////////////////////////////////////////////
        this.RefreshHeader(["", "w", "ID: 9999999"]);
        this.RefreshUICount([0, 0, 0]);

        this.RefreshDetailItem(this.Detail.getChildByName("Item1"), [8, 8, 8]);
        this.RefreshDetailItem(this.Detail.getChildByName("Item2"), [8, 8, 8]);
        this.RefreshDetailItem(this.Detail.getChildByName("Item3"), [8, 8, 8]);
    }
    fadeInComplete() {
        super.fadeInComplete();
        //打开完成进行处理
        console.log("完成");
    }

    Game_ComOpen() {
        this.Com_Gold.closeBox();
    }
    Game_ComSelect(index: number) {
        console.log(index);
    }
    Gold_ComOpen() {
        this.Com_Game.closeBox();
    }
    Gold_ComSelect(index: number) {
        console.log(index);
    }

    //底层点击触发combobox组件关闭
    ComBackClick() {
        this.Com_Game.closeBox();
        this.Com_Gold.closeBox();
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
        this.SetImage(this.Head, data[0]);
        this.SetLabel(this.Head, "Label_Nick", data[1]);
        this.SetLabel(this.Head, "Label_ID", data[2]);
    }
    //刷新成员金豆usdt数量
    RefreshUICount(data: number[]) {
        this.Label_People.string = `${data[0]}`;
        this.Label_Gold.string = `${data[1]}`;
        this.Label_USDT.string = `${data[2]}`;
    }
}
