import { info, table } from "console";
import ComFormTitle from "../../../common/ComFormTitle";
import { UIDefine } from "../../../define/UIDefine";
import LobbyData from "../../../frame/data/lobby/LobbyData";
import GC from "../../../frame/GameControl";
import GameUtil from "../../../game/util/GameUtil";
import TimeHelper from "../../../helper/TimeHelper";
import WebImageHelper from "../../../helper/WebImageHelper";
import ToastManager from "../../../manager/ToastManager";
import { Web_Stats_User_Stats } from "../../../net/https/WebRequest";
import AssetContext, { AssetFold } from "../../../ui/component/AssetContext";
import BaseForm from "../../../ui/form/BaseForm";
import UIComponent from "../../../ui/UIComponent";
import { LobbyControl } from "../../control/LobbyControl";



const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMineBag extends BaseForm {

    _allInfo = [];
    _useInfo = [];

    private comFormTitle: ComFormTitle = null;

     protected lateLoad(): void {
         super.lateLoad();
         this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
 
     }


    lateClose(param: any = null) {
        super.lateClose(param);
    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node): void {
        super.onShow(param, fromUI, sceneUI);

        // let Text_title = this.getChildNodeOrComponent("Text_title", cc.Label);
        // Text_title.string = "背包";

        // this.comFormTitle.initData('', this);

        // this.comFormTitle.title.string = "背包";

        this.resetUI();

        // 先请求自身数据 然后请求所有数据
        this.reqMyUseInfo((v) => {
            this.reqAllInfo((v) => {
                this.refreshListView(this._allInfo);
            });
        });


        let info = {
            prop_type: 1,//道具类型(prop_type):0-全部;1-mtt门票，2-实物，3-电话卡，4-购物卡，5-代金卷 6-线下门票 7-免服务费代金券 8-充值代金券 9-金豆券 10-一元购活动券 11-道具代替劵
            limit: 100,//条目
            offset: 0,//开始下标。例子（offset=0，limit=10，0-9。）
        }
        LobbyControl.getInstance().reqBagPropList(info).then(
            (res: any) => {
                if (res && res.data && res.data.list) {
                    this.createView(res.data.list, 1)
                }
            },
            (res) => {
            }
        )
    }

    isUseById(id) {
        let isUse = false;
        this._useInfo.forEach(element => {
            if (element.prop_id == id) {
                isUse = true;
            }
        });
        return isUse;
    }

    reqAllInfo(cb = null) {
        let info = {
            "prop_type": 0,
        }
        LobbyControl.getInstance().reqBagPendantList(info).then(
            (res: any) => {
                this._allInfo = res.data;
                if (cb) {
                    cb();
                }
            },
            (res) => {
            }
        )
    }

    //14 头像框 15 标识 16 特效
    reqMyUseInfo(cb = null) {
        // 刷新是否使用
        let info1 = {
            "prop_type": 0,
        }
        LobbyControl.getInstance().reqBagCurrentPendantList(info1).then(
            (res: any) => {
                if (res.data.list) {
                    this._useInfo = res.data.list;
                }
                if (cb) {
                    cb();
                }
            },
            (res) => {
            }
        )
    }


    resetUI() {

        // let scrollView = this.getChildNodeOrComponent("sv_down", cc.ScrollView);
        // scrollView.content.removeAllChildren();
    }

    createView(data, index) {
        let self = this;
        let itemLen = data.length;
        let lbl_noshow: cc.Node = self.getChildNodeOrComponent("lbl_no" + index);
        let scrollView = self.getChildNodeOrComponent("sv_row" + index, cc.ScrollView);
        scrollView.content.removeAllChildren();
        scrollView.scrollToLeft();

        let sv_bg = self.getChildNodeOrComponent("sv_bg", cc.ScrollView);
        // let _touchListener = sv_bg.node["_touchListener"];
        // _touchListener.setSwallowTouches(true); 

        let _touchListener1 = scrollView.node["_touchListener"];
        _touchListener1.setSwallowTouches(false); 
        if (itemLen == 0) {
            lbl_noshow.active = true;
        } else {
            lbl_noshow.active = false;
            // 有数据 刷新列表
            let panel_item: cc.Node = self.getChildNodeOrComponent("panel_item" + index);
            for (let i = 0; i < itemLen; i++) {
                let itemInfo = data[i];
                let _cloneNode = cc.instantiate(panel_item);
                _cloneNode.x = _cloneNode.width * 0.5 + _cloneNode.width * (i);
                _cloneNode.y = 0;
                _cloneNode.parent = scrollView.content;

                let img_item: cc.Sprite = _cloneNode.getChildByName("img_item").getComponent(cc.Sprite);
                WebImageHelper.SetUrlImage(img_item, itemInfo.game_prop.prop_icon).then(() => {
                });

                let isUse = self.isUseById(itemInfo.prop_id);
                _cloneNode["isUse"] = isUse;

                if (index != 1) {
                    let lbl_use = _cloneNode.getChildByName("lbl_use");
                    lbl_use.color = isUse ? cc.color(53, 163, 179) : cc.color(255, 255, 255);
                    lbl_use.opacity = isUse ? 255 : 75.5;
                    if (index == 2) {
                        lbl_use.getComponent(cc.Label).string = isUse ? "使用中" : "选择";
                    } else if (index == 3) {
                        lbl_use.getComponent(cc.Label).string = isUse ? "摘下" : "悬挂";
                    } else if (index == 4) {
                        lbl_use.getComponent(cc.Label).string = isUse ? "应用中" : "应用";
                    }
                } else {
                    let item_name = _cloneNode.getChildByName("item_name");
                    let item_num = _cloneNode.getChildByName("item_num");
                    let nameStr = GC.data.languageTemp.temp.getName(itemInfo.game_prop.prop_name);
                    item_name.getComponent(cc.Label).string = nameStr;
                    item_num.getComponent(cc.Label).string = "X" + itemInfo.prop_amount;
                }

                _cloneNode["index"] = index;
                _cloneNode["info"] = itemInfo;
                _cloneNode.on(cc.Node.EventType.TOUCH_END, self.onClickItem, self)

            }
            scrollView.content.width = panel_item.width * (itemLen);
        }
    }

    refreshListView(data) {
        if (data == null) {
            return;
        }
        let list = data.list;

        let len = list.length;

        let self = this;



        let data1 = [];
        let data2 = [];
        let data3 = [];

        //14 头像框 15 标识 16 特效
        for (let i = 0; i < len; i++) {
            let info = list[i];
            if (info.prop_type == 14) {
                data1.push(info);
            } else if (info.prop_type == 15) {
                data2.push(info);
            } else if (info.prop_type == 16) {
                data3.push(info);
            }
        }

        this.createView(data1, 2)
        this.createView(data2, 3)
        this.createView(data3, 4)

    }

    onClickItem(event) {
        let target = event.currentTarget;
        let info = target.info;

        if (target.index == 1) {
            UIComponent.open(UIDefine.UIBagTicket, { info: info });
            return;
        }

        if (target.isUse) {
            // 刷新是否使用
            let info1 = {
                prop_id: info.prop_id, //道具id
            }
            LobbyControl.getInstance().reqBagPandantDown(info1).then(
                (res: any) => {
                    this.reqMyUseInfo((v) => {
                        this.refreshListView(this._allInfo);
                        ToastManager.Instance.createToast("修改成功");
                    });
                },
                (res) => {
                }
            )
        } else {
            // 刷新是否使用
            let info1 = {
                prop_id: info.prop_id, //道具id
            }
            LobbyControl.getInstance().reqBagPandantUp(info1).then(
                (res: any) => {
                    this.reqMyUseInfo((v) => {
                        this.refreshListView(this._allInfo);
                        ToastManager.Instance.createToast("修改成功");
                    });
                },
                (res) => {
                }
            )
        }

    }

}
