import WebImageHelper from "../../helper/WebImageHelper";
import { APIOrgClubUploadIcon } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import { UIClubModel } from "../labor/UIClubModel";



const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMine_Service extends BaseForm {


    ebx_name: cc.EditBox = null;

    showPhotoNum: number = 0;

    protected lateLoad() {
        super.lateLoad();
    }


    lateClose(param: any = null) {
        super.lateClose(param);
    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: cc.Node): void {
        super.onShow(param, fromUI);
       
        this.showPhotoNum = 0;
        this.resetUI();

        let btn_photo: cc.Node = this.getChildNodeOrComponent("btn_photo")
        btn_photo.on(cc.Node.EventType.TOUCH_END, this.onClickPhoto, this);
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
            } else if (this.showPhotoNum == 2) {
                let btn_photo: cc.Node = this.getChildNodeOrComponent("btn_photo")
                btn_photo.active = false;
                img_show2.active = true;
                lbl_hide1.active = false;
                let img = img_show2.getComponent(cc.Sprite);
                await WebImageHelper.SetUrlImage(img, icon);
            }
        }
    }


}
