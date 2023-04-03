import List from "../common/List";
import ListEx from "../common/ListEx";
import { UIDefine } from "../define/UIDefine";
import GC from "../frame/GameControl";
import { GameCache } from "../game/GameCache";
import { StringHelper } from "../helper/StringHelper";
import TimeHelper from "../helper/TimeHelper";
import { WWW, Web_Room_Center_Mtt_list } from "../net/https/WebRequest";
import UIComponent from "../ui/UIComponent";
import BaseFormPlus from "../ui/form/BaseFormPlus";
import ItemMTTList from "./ItemMTTList";
import { MTTListOrderTypeString } from "./MTTModel";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMTTList extends BaseFormPlus {

    ///////////////////////引用声明////////////////////////

    ////////////////////////////////////////////////////
    isReqing: boolean = false;
    protected lateLoad() {
        this.name = "UIMTTList";
        super.lateLoad();
        this.initEX();
    }
    regiterTouchEvents() {
        super.regiterTouchEvents();
    }
    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.isReqing = false;
        this.listEx.reset();
    }
    fadeInComplete() {
        super.fadeInComplete();
        //打开完成进行处理
        this.listEx.dropRequest();
    }

    //刷新重新最初请求
    refreshReq() {
        this.listEx.reset();
        this.listEx.dropRequest();
    }

    reqList(offset: number = 0) {

        this.isReqing = true;

        WWW.Instance.CommonAPI(
            {
                web_class: Web_Room_Center_Mtt_list,
                body: {

                    limit: 10,
                    offset: offset,
                    status: [0, 1],
                    order: [MTTListOrderTypeString[MTTListOrderTypeString.start_asc]],
                },
            }
        ).then(
            (res: any) => {
                this.listEx.refresh(res.data.records, res.data.total);
                this.isReqing = false;
            },
            (res: any) => {
                this.listEx.error();
                this.isReqing = false;
            }
        )
    }

    ///////////////////////////////////////////////////////////
    private List$list: List = null;

    private listEx: ListEx = null;

    //初始化滚动列表的补充数据
    private initEX() {
        this.listEx = new ListEx({
            list: this.List$list,
            //nullNode: this.$Null,//this.$Page0.getChildByName("Null"),
            this: this,
            request: this.reqList
        });
    }
    //////////////////////////////////滚动节点渲染///////////////////////
    render_item(node: cc.Node, index: number) {

        let data = this.listEx.data[index];

        node.getComponent(ItemMTTList).onShow(data);

        node["data"] = data;

        node.on("click", this.click_item, this);

    }

    click_item(button: cc.Button) {
        let data = button.node["data"];
        if (GameCache.Instance.isHadClub) {
            // UIComponent.Instance.ShowAsync(UIType.UIMatch_MttDetail, tDto.match_id, () => {
            // 			UI u = UIComponent.Instance.Get(UIType.UIMatch_MttDetail);
            //     if (u != null) {
            //         u.GetComponent<UIMatch_MttDetailComponent>().RefreshtDto(tDto);
            //     }
            // }, 0.25f, DG.Tweening.Ease.Unset, UIComponent.ShowAnimType.HThrough);

            GC.data.mtt.list.select = data;
            UIComponent.open(UIDefine.MttDetailForm, data);
        }
        else {
            UIComponent.Instance.ToastLanguage("PleaseJoinAUnionFirs");
        }
    }

}
