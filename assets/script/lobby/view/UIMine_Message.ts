import WebImageHelper from "../../helper/WebImageHelper";
import { APIOrgClubUploadIcon } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import { UIClubModel } from "../labor/UIClubModel";



const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMine_Message extends BaseForm {



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
       
        this.resetUI();

        this.refreshListView(1);

        for (let i=1; i<6; i++) {
            let btn_pt_1: cc.Node = this.getChildNodeOrComponent("pi_" + i);
            btn_pt_1["index"] = i;
            btn_pt_1.on(cc.Node.EventType.TOUCH_END, this.onClickNLH, this)
        }
    }

    refreshChooseNLH(index) {
        for (let i=1; i<6; i++) {
            let btn_pt_1: cc.Node = this.getChildNodeOrComponent("pi_" + i);
            let img_line = btn_pt_1.getChildByName("img_line");
            if (i == index) {
                btn_pt_1.color = cc.color(53, 163, 179);
                img_line.active = true;
            } else {
                btn_pt_1.color = cc.color(255, 255, 255);
                img_line.active = false;
            }
        }
    }

    onClickNLH(event) {
        let node = event.target;
        let index = node.index;
        this.refreshChooseNLH(index);

        this.refreshListView(index);
    }

    resetUI() {
        this.refreshChooseNLH(1);
    }

    getCurViewUI(index) {
        let sv = null;
        for (let i=1; i<6; i++) {
            let sv_down: cc.Node = this.getChildNodeOrComponent("sv_down" + i);
            if (i == index) {
                sv_down.active = true;
                sv = sv_down;
            } else {
                sv_down.active = false;
            }
        }
        return sv;
    }

    refreshListView(index) {
        let lbl_noshow: cc.Node = this.getChildNodeOrComponent("lbl_notShow");
        let curSV = this.getCurViewUI(index);
        let scrollView = curSV.getComponent(cc.ScrollView);
        scrollView.content.removeAllChildren();
        scrollView.scrollToTop();
        // if (records.length == 0) {
        //     lbl_noshow.active = true;
        // } else {
        //     lbl_noshow.active = false;
            // 有数据 刷新列表
            let panel_item: cc.Node = this.getChildNodeOrComponent("panel_item");
            let len = 50;
            for (let i=0; i<len; i++) {
                let _cloneNode = cc.instantiate(panel_item);
                _cloneNode.x = 0;
                _cloneNode.y = -_cloneNode.height * 0.5 - _cloneNode.height * (i);
                _cloneNode.parent = scrollView.content;

               _cloneNode.getChildByName("rt_msg").getComponent(cc.RichText).string = i.toString();
            }
            scrollView.content.height = panel_item.height * (len + 1);
        // }
    }

}
