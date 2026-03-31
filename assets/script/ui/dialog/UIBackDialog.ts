import { i18nMgr } from "../../i18n/i18nMgr";
import { WebPropUserPropUsed, WWW } from "../../net/https/WebRequest";
import UIMyPack from "../../new_lobby/me/UIMyPack";
import UIBasePlus from "../UIBasePlus";
import UIComponent from "../UIComponent";

const { ccclass, menu } = cc._decorator;

@ccclass
@menu("脚本分组/ui/dialog/UIBackDialog")
export default class UIBackDialog extends UIBasePlus {
    static type: {
        title?: string;
        content?: string;
        cancelText?: string;
        commitText?: string;
        knowText?: string;
        callbacks?: Function[];
        this: any;
        cover?: Function;
        isactiveclosebtn?: boolean;
        info?: any;
    };
    $cover: cc.Node = null;
    //panel
    cc_Label$title: cc.Label = null;
    cc_Label$content: cc.Label = null;
    cc_Label$value: cc.Label = null;
    $value: cc.Node = null;
    $close: cc.Node = null;
    //单按钮 - 知道了
    $status1: cc.Node = null;
    $know: cc.Node = null;
    cc_Label$know: cc.Label = null;
    //双按钮
    $status2: cc.Node = null;
    cc_Label$cancel: cc.Label = null;
    cc_Label$commit: cc.Label = null;
    $cancel: cc.Node = null;
    $commit: cc.Node = null;

    //
    $phone: cc.Node = null;
    cc_EditBox$phone: cc.EditBox = null;

    _param: typeof UIBackDialog.type;
    onShow(data: typeof UIBackDialog.type): void {
        super.onShow(data);
        this.cc_Label$title.string = data.title || "";
        this.cc_Label$content.string = data.content || "";
        this.cc_Label$cancel.string = data.cancelText || "Cancel";
        this.cc_Label$commit.string = data.commitText || "Commit";
        this.cc_Label$know.string = data.knowText || "Know";
        this.cc_Label$value.string = `${data.info.game_prop?.prop_value || 0}`;
        this.$close.active = !!data.isactiveclosebtn;
        /////////////////////////////////////////////////////////////////
        this.$status1.active = false;
        this.$status2.active = true;
        this.$phone.active = false;
        this.$value.active = true;
        this.cc_Label$content.node.active = true;
        this.cc_Label$content.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
    }
    protected regiterTouchEvents(): void {
        this.setButtonClick(this.$cover, this.onClickCover);
        this.setButtonClick(this.$know, this.onClickKnow);
        this.setButtonClick(this.$cancel, this.onClickCancel);
        this.setButtonClick(this.$commit, this.onClickCommit);
    }

    onClickKnow() {
        if (this._param.info.prop_type == 2) {
            this.SendMessageOptions(this._param.info.prop_id, 3);
        } else if (this._param.info.prop_type == 3) {
            if (
                this.cc_EditBox$phone.string == "" ||
                this.cc_EditBox$phone.string.length < 7
            ) {
                UIComponent.Instance.ToastLanguage(
                    "UIMine_BackPack_inputrightphone",
                );
                return;
            }
            this.SendMessageOptions(
                this._param.info.prop_id,
                3,
                this.cc_EditBox$phone.string,
            );
        } else if (this._param.info.prop_type == 4) {
            this.SendMessageOptions(this._param.info.prop_id, 3);
        }
    }
    onClickCancel() {
        this.SendMessageOptions(this._param.info.prop_id, 2);
        this.hideUI();
    }
    onClickCommit() {
        this._param.callbacks?.[1]?.call(this._param.this);

        switch (this._param.info.prop_type) {
            case 2: //实物
                this.cc_Label$content.string = i18nMgr.Get(
                    "UIBackDiolg_textContent02",
                );
                this.cc_Label$content.horizontalAlign =
                    cc.Label.HorizontalAlign.CENTER;
                break;
            case 3: //电话卡
                this.cc_Label$content.node.active = false;
                this.$phone.active = true;
                break;
            case 4: //购物卡
                this.cc_Label$content.string = i18nMgr.Get(
                    "UIBackDiolg_textContent01",
                );
                break;
            case 5: //代金券
                this.SendMessageOptions(this._param.info.prop_id, 4);
                this.hideUI();
                break;
        }
        this.$value.active = false;
        this.$status2.active = false;
        this.$status1.active = true;
    }
    onClickCover() {
        if (this._param.cover) {
            this._param.cover.call(this._param.this);
        } else {
            this.hideUI();
        }
    }
    hideUI() {
        UIComponent.close(this.UIDefine);
    }
    //////////////////

    private SendMessageOptions(
        prop_id: number,
        type: number,
        phoneNum = "",
        quantity = 1,
    ) {
        WWW.Instance.CommonAPI({
            web_class: WebPropUserPropUsed,
            body: {
                prop_id: prop_id, //道具id
                quantity: quantity, //道具数量
                type: type, //"道具类型(type):2-转金豆，3-转平台，4-转IM钱包"
                user_phone: phoneNum, //"电话号码"
            },
        }).then(
            (res: any) => {
                UIComponent.Instance.ToastLanguage("adaptation10199");
                //刷新 UIMyPack
                let uipack: UIMyPack =
                    UIComponent.Instance.getComponent("UIMyPack");
                uipack.reqPackList();
            },
            (res: any) => {},
        );
        this.hideUI();
    }
}
