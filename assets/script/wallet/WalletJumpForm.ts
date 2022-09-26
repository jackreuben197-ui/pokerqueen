import ComFormTop from "../common/ComFormTop";
import List from "../common/List";
import { UIDefine } from "../define/UIDefine";
import BaseForm from "../ui/form/BaseForm";
import { EWalletGoldOpration, TWalletGoldOpration } from "./WalletConfig";
import WalletJumpItem from "./WalletJumpItem";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/wallet/WalletJumpForm')
export default class WalletJumpForm extends BaseForm {
    private comFormTop: ComFormTop = null;
    private list: List = null;

    private _configData: Map<EWalletGoldOpration, Array<TWalletGoldOpration>> = new Map();
    private _type: EWalletGoldOpration = EWalletGoldOpration.in;
    private _data: Array<TWalletGoldOpration> = [];
    onLoad() {
        super.onLoad();
        this._configData.set(EWalletGoldOpration.in, [{ title: "充豆", goto: UIDefine.GoldOprationForm }])
        this._configData.set(EWalletGoldOpration.out, [{ title: "提豆", goto: UIDefine.GoldOprationForm }])
    }
    lateLoad() {
        super.lateLoad();
        this.comFormTop = this.getChildNodeOrComponent("comFormTop", ComFormTop);
        this.list = this.getChildNodeOrComponent("list", List);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }

    onShow(type: EWalletGoldOpration): void {
        super.onShow(type);
        this._type = type;
        this._data = this._configData.get(this._type);

        this.initView();
    }

    initView() {
        let title = this._type == EWalletGoldOpration.in ? "充豆" : "提豆";
        this.comFormTop.initData(title, this);


        this.list.numItems = this._data.length;
    }

    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(WalletJumpItem);
        item.initData(this._data[index]);
    }
}