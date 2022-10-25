import ComFormTitle from "../../common/ComFormTitle";
import ComTabToggles, { ETabToggle } from "../../common/ComTabToggles";
import MttListItemModel from "../../frame/data/mtt/MttListItemModel";
import GC from "../../frame/GameControl";
import BaseForm from "../../ui/form/BaseForm";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/mtt/detail/MttDetailForm')
export default class MttDetailForm extends BaseForm {
    curType: number = 0;   // 0 - 4 对应上方5种类型
    lateLoad() {
        super.lateLoad();
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }

    lateClose(param: any = null) {
        super.lateClose(param);
        this.curType = 0;
    }

    onShow(data?: MttListItemModel): void {
        super.onShow(data);

        this.updateUI();
    }

    updateUI() {

        let panel_0: cc.Node = this.getChildNodeOrComponent("panel_0");
        let panel_1: cc.Node = this.getChildNodeOrComponent("panel_1");
        let panel_1_top: cc.Node = this.getChildNodeOrComponent("panel_1_top");
        let panel_2_top: cc.Node = this.getChildNodeOrComponent("panel_2_top");
        let panel_3_top: cc.Node = this.getChildNodeOrComponent("panel_3_top");
        let panel_4_top: cc.Node = this.getChildNodeOrComponent("panel_4_top");
        let sv_down1: cc.Node = this.getChildNodeOrComponent("sv_down1");
        let sv_down2: cc.Node = this.getChildNodeOrComponent("sv_down2");
        let sv_down3: cc.Node = this.getChildNodeOrComponent("sv_down3");
        let sv_down4: cc.Node = this.getChildNodeOrComponent("sv_down4");
        if (this.curType == 0) {
            panel_0.active = true;
            panel_1.active = false;
            let sv_status = this.getChildNodeOrComponent("sv_status", cc.ScrollView);
            let panel_item2: cc.Node = this.getChildNodeOrComponent("panel_item2");
            sv_status.content.height = panel_item2.height * 1.2;
            sv_status.scrollToTop();
            panel_item2.x = 0;
            panel_item2.y = 0;
            panel_item2.parent = sv_status.content;
            let tabToggles: cc.Node = this.getChildNodeOrComponent("tabToggles");
            for (let i=1; i<6; i++) {
                let btn_pt_1: cc.Node = tabToggles.children[i-1];
                btn_pt_1["index"] = i - 1;
                btn_pt_1.on(cc.Node.EventType.TOUCH_END, this.onClickTop, this)
            }
        } else if (this.curType == 1) {
            panel_0.active = false;
            panel_1.active = true;
            panel_1_top.active = true;
            panel_2_top.active = false;
            panel_3_top.active = false;
            panel_4_top.active = false;
            sv_down1.active = true;
            sv_down2.active = false;
            sv_down3.active = false;
            sv_down4.active = false;
            this.refreshListView("panel_item", "sv_down1");
        } else if (this.curType == 2) {
            panel_0.active = false;
            panel_1.active = true;
            panel_1_top.active = false;
            panel_2_top.active = true;
            panel_3_top.active = false;
            panel_4_top.active = false;
            sv_down1.active = false;
            sv_down2.active = true;
            sv_down3.active = false;
            sv_down4.active = false;
            this.refreshListView("panel_item3", "sv_down2");
        } else if (this.curType == 3) {
            panel_0.active = false;
            panel_1.active = true;
            panel_1_top.active = false;
            panel_2_top.active = false;
            panel_3_top.active = true;
            panel_4_top.active = false;
            sv_down1.active = false;
            sv_down2.active = false;
            sv_down3.active = true;
            sv_down4.active = false;
            this.refreshListView("panel_item4", "sv_down3");
        } else if (this.curType == 4) {
            panel_0.active = false;
            panel_1.active = true;
            panel_1_top.active = false;
            panel_2_top.active = false;
            panel_3_top.active = false;
            panel_4_top.active = true;
            sv_down1.active = false;
            sv_down2.active = false;
            sv_down3.active = false;
            sv_down4.active = true;
            this.refreshListView("panel_item5", "sv_down4");
        }
        
        this.refreshTopUI(this.curType);
    }
    
    // sv需要拆出来
    refreshListView(panelName, svName) {
        // 有数据 刷新列表
        let len = 50;
        let panel_item: cc.Node = this.getChildNodeOrComponent(panelName);
        let scrollView = this.getChildNodeOrComponent(svName, cc.ScrollView);
        scrollView.scrollToTop();
        scrollView.content.removeAllChildren();
        for (let i=0; i<len; i++) {
            let _cloneNode = cc.instantiate(panel_item);
            _cloneNode.x = 0;
            _cloneNode.y = -_cloneNode.height * 0.5 - _cloneNode.height * (i);
            _cloneNode.parent = scrollView.content;
            _cloneNode.getChildByName("lbl_jp").getComponent(cc.Label).string = i.toString();
        }
        scrollView.content.height = panel_item.height * (len+5);
    }

    refreshTopUI(index) {
        let tabToggles: cc.Node = this.getChildNodeOrComponent("tabToggles");
        for (let i=1; i<6; i++) {
            let btn_pt_1: cc.Node = tabToggles.children[i-1];
            let line = btn_pt_1.getChildByName("line");
            if (index == i - 1) {
                line.active = true;
                btn_pt_1.color = cc.color(53, 163, 179);
            } else {
                line.active = false;
                btn_pt_1.color = cc.color(255, 255, 255);
            }
        }
    }

    onClickTop(event) {
        let target = event.target;
        let index = target.index;
        this.curType = index;
        this.updateUI();
    }
}