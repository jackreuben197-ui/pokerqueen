import ComFormTitle from "../../common/ComFormTitle";
import { GameCache } from "../../game/GameCache";
import WebImageHelper from "../../helper/WebImageHelper";
import ToastManager from "../../manager/ToastManager";
import { APIOrgClubUploadIcon, Web_User_Info } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import { LobbyControl } from "../control/LobbyControl";
import { UIClubModel } from "../labor/UIClubModel";



const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMine_Service extends BaseForm {


    ebx_name: cc.EditBox = null;

    showPhotoNum: number = 0;

    _user_id: number = null;

    _user_random_id: number = null;

    _phone: number = null;

    _email: string = null;

    _ticket_type: number = 4;

    _description: string = null;

    _img_url1: string = null;

    _img_url2: string = null;

    progromList = [
        "代理合作",
        "充值问题",
        "游戏反馈",
        "其他"
    ]

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
    onShow(param?: any, fromUI?: cc.Node): void {
        super.onShow(param, fromUI);

        this.comFormTitle.initData('', this);

        this.comFormTitle.title.string = "客服";

       
        this.showPhotoNum = 0;
        this.resetUI();

        this._user_id = Web_User_Info.Response.data.user.un_id;
        let lbl_uid : cc.Label = this.getChildNodeOrComponent("lbl_uid", cc.Label);
        lbl_uid.string = this._user_id.toString();

        let btn_photo: cc.Node = this.getChildNodeOrComponent("btn_photo")
        btn_photo.on(cc.Node.EventType.TOUCH_END, this.onClickPhoto, this);

        let btn_down: cc.Node = this.getChildNodeOrComponent("btn_down")
        btn_down.on(cc.Node.EventType.TOUCH_END, this.onClickDown, this);
        
        let panel_click :cc.Node = this.getChildNodeOrComponent("panel_click");
        panel_click.on(cc.Node.EventType.TOUCH_END, this.onClickHide, this);

        let lbl_user :cc.Node = this.getChildNodeOrComponent("lbl_user");
        this.comFormTitle.rightTextBtn.string = "人工客服";
        this.comFormTitle.rightTextBtn.node.active = true;
        lbl_user = this.comFormTitle.rightTextBtn.node;
        lbl_user.on(cc.Node.EventType.TOUCH_END, this.onClickUser, this);

        for (let i=1; i<5; i++) {
            let pc1 :cc.Node = this.getChildNodeOrComponent("pc_" + i);
            pc1["index"] = i;
            pc1.on(cc.Node.EventType.TOUCH_END, this.onClickItem, this);
        }

        let btn_submit :cc.Node = this.getChildNodeOrComponent("btn_submit");
        btn_submit.on(cc.Node.EventType.TOUCH_END, this.onClickSend, this);
    }

    resetUI() {
        let img_hide1: cc.Node = this.getChildNodeOrComponent("img_hide1");
        let img_show1: cc.Node = this.getChildNodeOrComponent("img_show1");
        let img_show2: cc.Node = this.getChildNodeOrComponent("img_show2");
        img_hide1.active = true;
        img_show1.active = false;
        img_show2.active = false;
        let btn_photo: cc.Node = this.getChildNodeOrComponent("btn_photo")
        btn_photo.active = true;
        let lbl_hide1: cc.Node = this.getChildNodeOrComponent("lbl_hide1");
        lbl_hide1.active = true;
        img_show1.getComponent(cc.Sprite).spriteFrame = null;
        img_show2.getComponent(cc.Sprite).spriteFrame = null;

        let ebx_4 :cc.EditBox = this.getChildNodeOrComponent("ebx_4", cc.EditBox);
        let lbl_max : cc.Label = this.getChildNodeOrComponent("lbl_max", cc.Label);
        ebx_4.string = "";
        lbl_max.string = 0 + " / 200";

        let lbl_choose : cc.Label = this.getChildNodeOrComponent("lbl_choose", cc.Label);
        lbl_choose.string = "其他";
        lbl_choose.node.opacity = 255;

        // let ebx_1 :cc.EditBox = this.getChildNodeOrComponent("ebx_1", cc.EditBox);
        // ebx_1.string = "";

        let ebx_2 :cc.EditBox = this.getChildNodeOrComponent("ebx_2", cc.EditBox);
        ebx_2.string = "";

        let ebx_3 :cc.EditBox = this.getChildNodeOrComponent("ebx_3", cc.EditBox);
        ebx_3.string = "";

        this._user_id = null;

        this._user_random_id = null;
    
        this._phone = null;
    
        this._email = null;
    
        this._ticket_type = 4;
    
        this._description = null;
    
        this._img_url1 = null;

        this._img_url2 = null;
    }

    async onClickPhoto() {
        await UIClubModel.mInstance.APIOrgClubUploadIcon();
        let icon: any = APIOrgClubUploadIcon.Response.data
        if (icon) {
            this.showPhotoNum ++;
            let img_hide1: cc.Node = this.getChildNodeOrComponent("img_hide1");
            let img_show1: cc.Node = this.getChildNodeOrComponent("img_show1");
            let img_show2: cc.Node = this.getChildNodeOrComponent("img_show2");
            let lbl_hide1: cc.Node = this.getChildNodeOrComponent("lbl_hide1");
            img_hide1.active = false;
            if (this.showPhotoNum == 1) {
                // 一张照片
                img_show1.active = true;
                let img = img_show1.getComponent(cc.Sprite);
                await WebImageHelper.SetUrlImage(img, icon);
                this._img_url1 = icon;
            } else if (this.showPhotoNum == 2) {
                let btn_photo: cc.Node = this.getChildNodeOrComponent("btn_photo")
                btn_photo.active = false;
                img_show2.active = true;
                lbl_hide1.active = false;
                let img = img_show2.getComponent(cc.Sprite);
                await WebImageHelper.SetUrlImage(img, icon);
                this._img_url2 = icon;
            }
        }
    }

    onChangeText(param) {
        let ebx_4 :cc.EditBox = this.getChildNodeOrComponent("ebx_4", cc.EditBox);
        let lbl_max : cc.Label = this.getChildNodeOrComponent("lbl_max", cc.Label);
        lbl_max.string = ebx_4.string.length + " / 200";
    }

    onClickDown() {
        let panel_choose :cc.Node = this.getChildNodeOrComponent("panel_choose");
        let panel_click :cc.Node = this.getChildNodeOrComponent("panel_click");
        panel_click.active = true;
        panel_choose.active = true;
    }

    onClickHide() {
        let panel_choose :cc.Node = this.getChildNodeOrComponent("panel_choose");
        panel_choose.active = false;
        let panel_click :cc.Node = this.getChildNodeOrComponent("panel_click");
        panel_click.active = false;
    }

    onClickUser() {
        ToastManager.Instance.createToast("功能暂未开放");
    }

    onClickItem(event) {
        let target = event.target;
        let index = target.index;
        let str = target.getChildByName("lbl").getComponent(cc.Label).string;

        this._ticket_type = index;
        let lbl_choose : cc.Label = this.getChildNodeOrComponent("lbl_choose", cc.Label);
        lbl_choose.string = str;
        lbl_choose.node.opacity = 255;
        this.onClickHide();
    }

    onClickSend() {

        // let ebx_1 :cc.EditBox = this.getChildNodeOrComponent("ebx_1", cc.EditBox);
        // this._user_id = Number(ebx_1.string);

        let ebx_2 :cc.EditBox = this.getChildNodeOrComponent("ebx_2", cc.EditBox);
        this._phone = Number(ebx_2.string);

        let ebx_3 :cc.EditBox = this.getChildNodeOrComponent("ebx_3", cc.EditBox);
        this._email = ebx_3.string;

        let ebx_4 :cc.EditBox = this.getChildNodeOrComponent("ebx_4", cc.EditBox);
        this._description = ebx_4.string;

        // if (this._user_id == null || this._user_id == 0) {
        //     ToastManager.Instance.createToast("请输入玩家ID");
        //     return;
        // }

        if (this._phone == null || this._phone == 0) {
            ToastManager.Instance.createToast("请输入电话号码");
            return;
        }

        if (this._email == null || this._email == "") {
            ToastManager.Instance.createToast("请输入电子邮箱");
            return;
        }

        let reg = new RegExp(/^[A-Za-z0-9]+([_\.][A-Za-z0-9]+)*@([A-Za-z0-9\-]+\.)+[A-Za-z]{2,6}$/g);
        if (!reg.test(this._email)) {
            ToastManager.Instance.createToast("邮箱格式不正确");
            return true;
        }

        if (this._description == null || this._description == "") {
            ToastManager.Instance.createToast("描述问题不能为空");
            return;
        }

        let imgStr = "";
        if (this._img_url1) {
            imgStr = this._img_url1.toString();
        }
        if (this._img_url2) {
            imgStr = this._img_url1.toString() + "," + this._img_url2.toString();
        }

        let info = {
            user_id: this._user_id,// 玩家ID
            user_random_id: GameCache.Instance.nUserId,// 玩家randomID
            phone: this._phone,// 电话
            email: this._email,// 邮箱
            ticket_type: this._ticket_type,// 问题类型
            description: this._description,//  问题描述
            img_url: imgStr,//  图片描述
        }
        LobbyControl.getInstance().reqServiceInfo(info).then(
            (res) => {
                ToastManager.Instance.createToast("提交成功");
                this.close()
            },
            (res) => {
            }
        )
    }

}
