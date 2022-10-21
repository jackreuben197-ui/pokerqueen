import ComFormTitle from "../../common/ComFormTitle";
import ComTabToggles, { ETabToggle } from "../../common/ComTabToggles";
import MttListItemModel from "../../frame/data/mtt/MttListItemModel";
import GC from "../../frame/GameControl";
import BaseForm from "../../ui/form/BaseForm";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/mtt/detail/MttDetailForm')
export default class MttDetailForm extends BaseForm {
    private comFormTitle: ComFormTitle = null;
    private tabToggles: ComTabToggles = null;
    lateLoad() {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.tabToggles = this.getChildNodeOrComponent("tabToggles", ComTabToggles);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }

    onShow(data?: MttListItemModel): void {
        super.onShow(data);

        this.initView();
    }

    initView() {
        this.comFormTitle.initData("MTT_Official", this);

        let data = {
            title: GC.language.getLocal("UIMatchMTTDetailList").split("^")
        }
        this.tabToggles.initData(this.onToggle, ETabToggle.text, data);
        this.tabToggles.clickTab(0, null, true);

    }

    onToggle = (index, data) => {

    }
}