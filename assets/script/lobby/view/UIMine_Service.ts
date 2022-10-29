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

        let btn_down: cc.Node = this.getChildNodeOrComponent("btn_down")
        btn_down.on(cc.Node.EventType.TOUCH_END, this.onClickDown, this);
        
        let panel_click :cc.Node = this.getChildNodeOrComponent("panel_click");
        panel_click.on(cc.Node.EventType.TOUCH_END, this.onClickHide, this);

        for (let i=1; i<4; i++) {
            let pc1 :cc.Node = this.getChildNodeOrComponent("pc_" + i);
            pc1["index"] = i;
            pc1.on(cc.Node.EventType.TOUCH_END, this.onClickItem, this);
        }
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

        let ebx_3 :cc.EditBox = this.getChildNodeOrComponent("ebx_3", cc.EditBox);
        let lbl_max : cc.Label = this.getChildNodeOrComponent("lbl_max", cc.Label);
        ebx_3.string = "";
        lbl_max.string = 0 + " / 200";

        let lbl_choose : cc.Label = this.getChildNodeOrComponent("lbl_choose", cc.Label);
        lbl_choose.string = "问题描述";
        lbl_choose.node.opacity = 75.5;
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

    onChangeText(param) {
        let ebx_3 :cc.EditBox = this.getChildNodeOrComponent("ebx_3", cc.EditBox);
        let lbl_max : cc.Label = this.getChildNodeOrComponent("lbl_max", cc.Label);
        lbl_max.string = ebx_3.string.length + " / 200";
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

    onClickItem(event) {
        let target = event.target;
        let index = target.index;
        let str = target.getChildByName("lbl").getComponent(cc.Label).string;
        if (index == 1) {

        } else if (index == 2) {

        } else if (index == 3) {

        }

        let lbl_choose : cc.Label = this.getChildNodeOrComponent("lbl_choose", cc.Label);
        lbl_choose.string = str;
        lbl_choose.node.opacity = 255;
        this.onClickHide();
    }
}
