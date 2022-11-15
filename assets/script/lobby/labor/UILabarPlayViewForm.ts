/*
 * @Author: xfj
 * @Date: 2022-09-19 16:24:03
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-11-15 11:43:19
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UILabarPlayViewForm.ts
 */
const { ccclass, property } = cc._decorator;
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import { UIDefine } from "../../define/UIDefine";
import WebImageHelper from "../../helper/WebImageHelper";
import { APIOrgClubActivityInfo, APIOrgClubGold, APIOrgClubIsManger, APIOrgGetMessList, APIOrgGetNewMessNum, APIOrgSendMess, Web_Org_Club_Get } from "../../net/https/WebRequest";
import { UIClubModel } from "./UIClubModel";
import { GameType } from "../../game/util/GameUtil";
import GC from "../../frame/GameControl";
import { EventName } from "../../config/EventName";
import SceneManager from "../../manager/SceneManager";
import AssetContext, { AssetFold } from "../../ui/component/AssetContext";
import List from "../../common/List";
import messParent from "./messParent";

/**≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈ ꧁༺ ༒ ༻꧂≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
    房间（牌桌）选择界面
 ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈ ༺༒༻ ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈*/

enum EnumLoadType {
    "Init" = 1,
    "Refresh" = 2,
    "LoadMore" = 0,
}
enum PokerType {
    Normal = 0,//普通
    SixPlus = 2//短牌

}
enum memberType {
    own = 1,
    admin,
    member
}
enum layerType {
    chess = 0,
    mess = 1,

}

export class ClubAdmin {
    _data = null
    constructor(data) {
        this._data = data;
    }
    get club_id() {
        return this._data.club_id
    }
    get create_room() {
        return this._data.create_room
    }
    get id() {
        return this._data.id
    }
    get level() {
        return this._data.level
    }
    get op_id() {
        return this._data.op_id
    }
    get status() {
        return this._data.status
    }
    get user_id() {
        return this._data.user_id
    }
}

@ccclass
export default class UILabarPlayViewForm extends UIBase {
    @property(cc.Node)
    panel_right: cc.Node = null;
    @property(cc.Node)
    tabNode: cc.Node = null;
    @property(cc.Node)
    chongzhi: cc.Node = null;

    @property(cc.Sprite)
    bar: cc.Sprite = null;
    @property(cc.Label)
    lbl_active: cc.Label = null;

    @property(cc.Node)
    messScoContent: cc.Node = null;

    @property(cc.Prefab)
    messPfItem: cc.Prefab = null;

    @property(cc.Prefab)
    messTsItem: cc.Prefab = null;

    @property(cc.Prefab)
    messNomalItem: cc.Prefab = null;
    @property(cc.EditBox)
    EditBox: cc.EditBox = null;

    @property(cc.Node)
    btnNode: cc.Node = null;

    @property(cc.Node)
    tsMESS: cc.Node = null;
    @property(cc.ScrollView)
    messScrollView: cc.ScrollView = null;


    @property(cc.Label)
    lbl_messNewNum: cc.Label = null;
    @property(cc.Node)
    item_xxts: cc.Node = null;

    @property(cc.Node)
    item_A: cc.Node = null;

    @property(cc.Node)
    item_bq: cc.Node = null;

    private tabBtnsParent: cc.Node = null;
    private tabViewParents: Array<cc.Node> = [];
    private subView: cc.Node = null;
    private messView: cc.Node = null;

    _curType = 0;
    private _chessView: UIBase = null;
    private _loadingChessBiew: boolean = false;
    _showTsMessIndex = 0;

    _lastGetId = 1
    _fistGetId = 1
    _tsMessArr = []
    @property(List)
    list: List = null;
    private _offset: number = 0;
    private _reqing: boolean = false;
    private _reqEnd: boolean = false;
    private _list: Array<any> = [];
    private _total: number = 0


    onLoad() {
        super.onLoad();
    }
    protected lateLoad(): void {
        super.lateLoad();

        this.tabBtnsParent = this.getChildNodeOrComponent("tabBtns");
        this.subView = this.getChildNodeOrComponent("subView");
        this.tabViewParents = this.subView.children;
        this.messScrollView.node.on('scroll-ended', this.scrollingCB, this)
        this.messView = this.getChildNodeOrComponent("messView");
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.listen(EventName.refreshActive, this.initActive)
        this.tabBtnsParent.children.forEach((item, index) => {
            this.bindClick(item, this.onClickTabBtns, index);
        })
    }
    private onClickTabBtns(index: number): void {
        this.switchTab(index);
    }
    switchTab = (type: layerType) => {
        if (this._curType != type) {
            this._curType = type;
            this.switchTabBtnState();
        } else {
            return
        }

        this.subView.active = this._curType == layerType.chess;
        this.messView.active = !this.subView.active
        if (this.messView.active) {
            this.initMess();
            // this.reqDataAgain();
        }
    }
    switchTabBtnState() {
        this.tabBtnsParent.children.forEach((item, index) => {
            let choose = item.getChildByName("choose");
            let normal = item.getChildByName("normal");
            choose.active = this._curType == index;
            normal.active = this._curType != index;
        })

        // this.tabViewParents.forEach((parent, index) => {
        //     parent.active = this._curType == index;
        // })
    }


    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        this.listen(EventName.clubGoldChange, this.updateGold);
        this.listen(EventName.refreshMess, this.initMess)
    }

    onShow(param?: any, fromUI?: cc.Node) {
        param = {
            game_type: 0,
            poker_type: 0,
            index: 0,
            len: 0,
        }
        super.onShow(param);

        this.initTop();
        this.initChessView();
        this.initActive();

        this.staSchedu();

    }
    async initActive() {
        await UIClubModel.mInstance.APIOrgClubActivityInfo();
        let data: any = APIOrgClubActivityInfo.Response.data
        if (!data.info) return;
        let url: string = data.info.img_url;
        let index = url.indexOf('http')
        if (index == -1) {
            this.bar.spriteFrame = AssetContext.getAsset(url, AssetFold.texture_labor)
            WebImageHelper.setImageSize(this.bar, 1100, 361)
        }
        else {
            await WebImageHelper.SetUrlImage(this.bar, url)
            WebImageHelper.setImageSize(this.bar, 1100, 361)
        }
        this.lbl_active.string = data.info.description

    }

    initChessView() {
        if (!this._chessView && !this._loadingChessBiew) {
            this._loadingChessBiew = true;
            this.loadPrefab(UIDefine.UIMatchChessView.Path, (node: cc.Node) => {
                this._loadingChessBiew = false;
                node.parent = this.tabViewParents[0];
                let baseScript = node.getComponent(UIBase);
                this._chessView = baseScript;
                this._chessView.onShow(GameType.Holdem, true);
            })
        } else if (this._chessView) {
            this._chessView.onShow(GameType.Holdem, true);
        }
    }

    /***************************************自己界面的数据处理 */

    async initTop() {
        let data: any = Web_Org_Club_Get.Response.data;
        let name = this.panel_right.getChildByName('name').getComponent(cc.Label);
        name.string = data.club_name
        let id = this.panel_right.getChildByName('id').getComponent(cc.Label);
        id.string = 'ID:' + data.random_id
        let icon = cc.find('iconMask/icon', this.panel_right).getComponent(cc.Sprite);
        WebImageHelper.SetHeadImage(icon, data.logo)
        UIClubModel.mInstance.APIOrgClubGold(data.random_id)
        UIClubModel.mInstance.APIOrgClubIsManger(data.club_id).then(() => {
            let isManger: any = APIOrgClubIsManger.Response.data
            if (isManger.info) {
                let _data = new ClubAdmin(isManger.info)
                this.item_xxts.active = false
                switch (_data.level) {
                    case memberType.own:
                        this.chongzhi.active = true;
                        this.tabNode.getChildByName('chpj').active = true;   //创建牌桌
                        this.tabNode.getChildByName('ghgl').active = true;   //公会管理
                        this.tabNode.getChildByName('ckgh').active = !this.tabNode.getChildByName('ghgl').active;  //查看公会
                        this.item_xxts.active = true
                        break;
                    case memberType.member:
                        this.chongzhi.active = false;
                        this.tabNode.getChildByName('chpj').active = _data.create_room == 1;
                        this.tabNode.getChildByName('ghgl').active = false;
                        this.tabNode.getChildByName('ckgh').active = !this.tabNode.getChildByName('ghgl').active
                        break;

                    case memberType.admin:
                        // this.chongzhi.active = false;
                        // this.tabNode.getChildByName('chpj').active = false;
                        // this.tabNode.getChildByName('ghgl').active = false;
                        // this.tabNode.getChildByName('ckgh').active = !this.tabNode.getChildByName('ghgl').active
                        break;
                    default:
                        break;
                }
            } else {
                this.chongzhi.active = false;
                this.tabNode.getChildByName('chpj').active = false;
                this.tabNode.getChildByName('ghgl').active = false;
                this.tabNode.getChildByName('ckgh').active = !this.tabNode.getChildByName('ghgl').active
            }

        })
    }

    updateGold() {
        let lbl_glod = cc.find('img_right_bg/lbl_glod', this.panel_right).getComponent(cc.Label);
        this.setText(lbl_glod, GC.data.club.info.displayGold);
    }
    addCoin() {
        // UIComponent.open(UIDefine.GoldOprationForm, { type: EWalletGoldOpration.in, isClub: true });
        UIComponent.open(UIDefine.OrderApplyForm, null, { SceneUI: SceneManager.Instance.currUI });
    }
    tostBtnClick() {
        this.tabNode.active = !this.tabNode.active;
    }
    playerLookLaber() {
        this.tabNode.active = false;
        UIComponent.open(UIDefine.UIPlayerLookLabor);
    }
    managerLookLaber() {
        this.tabNode.active = false;
        UIComponent.open(UIDefine.UIManageLabor);
    }
    createMatch() {
        this.tabNode.active = false;
        UIComponent.open(UIDefine.UICreateMatchHome);
    }


    /*******聊天逻辑 */
    // onRender(node: cc.Node, index: number) {
    //     let item = node.getComponent(messParent);
    //     item.initData(this._list[index]);
    // }

    // async reqDataAgain() {
    //     this._offset = 0;
    //     this._total = 0;
    //     this._list.length = 0;
    //     this._reqing = false;
    //     this._reqEnd = false;
    //     this.dealData()
    // }
    // async dealData() {
    //     this._reqing = true

    //     await UIClubModel.mInstance.APIOrgGetMessList({ last_id: this._lastGetId, limit: 10, offset: 0 })
    //     let _data: any = APIOrgGetMessList.Response.data
    //     this._reqing = false
    //     if (!_data.data) {
    //         _data.data = [];
    //     } else {
    //         let id = _data.data[_data.data.length - 1].id
    //         this._lastGetId = id;
    //     }
    //     _data.data.forEach(element => {
    //         this._list.push(element);
    //     });  //分页的时候使用的
    //     this._total = _data.data.total

    //     this.list.numItems = this._list.length;
    //     // this._offset = this._list.length;
    //     this._reqEnd = this._list.length == this._total;
    // }


    scrollingCB(scrollView: cc.ScrollView) {
        if (scrollView) {
            let cur = scrollView.getScrollOffset();
            let max = scrollView.getMaxScrollOffset()
            let isDown = cur.y >= max.y;
            if (isDown && !this._reqing && !this._reqEnd) {
                // this.dealData()
                this.initMess();
            }
        }
    }

    async initMess() {
        this._reqing = true
        await UIClubModel.mInstance.APIOrgGetMessList({ last_id: 0, limit: 4, offset: this._offset })
        this._reqing = false

        let data: any = APIOrgGetMessList.Response.data
        let node = null;
        data = data.data
        data.sort((a: any, b: any) => {
            return a.id - b.id
        })
        // 消息类型 1 普通消息 2 会长公告 3 战绩分享 4 牌谱分享
        if (data?.length == 0) return
        let id = data[data.length - 1].id
        this._lastGetId = id;
        // this.messScoContent.childrenCount = 0
        for (let index = 0; index < data.length; index++) {
            const element = data[index];
            if (element.message_type == 1) {
                node = cc.instantiate(this.messNomalItem);
            } else if (element.message_type == 2) {
                node = cc.instantiate(this.messTsItem);
                this._tsMessArr.push(element);
            } else if (element.message_type == 3 || element.message_type == 4) {
                node = cc.instantiate(this.messPfItem);
            }
            node.parent = this.messScoContent
            node.getComponent(node.name).initData(element);
        }
        this._offset = this.messScoContent.childrenCount;
        // this._reqEnd = this.messScoContent.childrenCount >= this._total;
        this.staSchedu();
    }

    changeTsMes() {
        let tsData = this._tsMessArr[this._showTsMessIndex];
        if (tsData) {
            this.tsMESS.active = true
            let _messTsItem = this.tsMESS.getChildByName('messTsItem')
            _messTsItem.getComponent(_messTsItem.name).initData(tsData);
            this._showTsMessIndex++;
        } else {
            this.tsMESS.active = false
        }
    }

    staSchedu() {
        this.getNewMess();
        this.unscheduleAllCallbacks()
        this.schedule(() => {
            this.getNewMess();
        }, 8)
    }
    async getNewMess() {
        this.changeTsMes();
        await UIClubModel.mInstance.APIOrgGetNewMessNum({ msg_id: this._lastGetId });
        let data: any = APIOrgGetNewMessNum.Response.data
        this.setNewNum(data);
    }
    setNewNum(string = 0) {
        this.lbl_messNewNum.string = `(${string})`;
    }

    clickPf() {
        // UIComponent.open(UIDefine.UIMine_Poker, { info: '' })
        UIComponent.open(UIDefine.UICollectScore);
    }
    clickzj() {
        // UIComponent.open(UIDefine.UIRecordDetail, { info: '' });
        UIComponent.open(UIDefine.UIRecord);
    }
    clickxxts() {
        UIComponent.open(UIDefine.UIMsg_Send);
    }
    clickqk() {

    }
    async clicka() {
        let param = { content: this.EditBox.string, message_type: 1 }
        await UIClubModel.mInstance.APIOrgSendMess(param)
        this.initMess();
        this.EditBox.string = ''
        this.editChange()
    }
    clickbq() {
        this.btnNode.active = !this.btnNode.active
        //发送
    }
    editChange() {
        if (this.EditBox.string == '') {
            this.item_A.active = false
            this.item_bq.active = true
        }
        else {
            this.item_A.active = true
            this.item_bq.active = false
        }

    }
    editEnd() {

    }
    editBegan() {

    }

}
