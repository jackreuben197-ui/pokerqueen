import ComFormTitle from "../common/ComFormTitle";
import List from "../common/List";
import { UIDefine } from "../define/UIDefine";
import BaseForm from "../ui/form/BaseForm";
import { EWalletGoldOpration, TWalletGoldOpration } from "./WalletConfig";
import WalletJumpItem from "./WalletJumpItem";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/wallet/WalletJumpForm')
export default class WalletJumpForm extends BaseForm {
    private comFormTitle: ComFormTitle = null;
    private list: List = null;

    private _configData: Map<EWalletGoldOpration, Array<TWalletGoldOpration>> = new Map();
    private _type: EWalletGoldOpration = EWalletGoldOpration.in;
    private _data: Array<TWalletGoldOpration> = [];
    private _isClub: boolean = false;
    onLoad() {
        super.onLoad();
        this._configData.set(EWalletGoldOpration.in, [{ title: "Text_Add", goto: UIDefine.GoldOprationForm }])
        this._configData.set(EWalletGoldOpration.out, [{ title: "Text_Getchips", goto: UIDefine.GoldOprationForm }])
    }
    lateLoad() {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.list = this.getChildNodeOrComponent("list", List);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }

    onShow(data: { type: EWalletGoldOpration, isClub: boolean }): void {
        super.onShow(data);
        this._type = data.type;
        this._isClub = data.isClub;
        this._data = this._configData.get(this._type);

        this.initView();
    }

    initView() {
        let title = this._type == EWalletGoldOpration.in ? "Text_Add" : "Text_Getchips";
        this.comFormTitle.initData(title, this);

        this.list.numItems = this._data.length;
    }

    onRender(node: cc.Node, index: number) {
        let data = this._data[index]
        data.param = this._type;
        let item = node.getComponent(WalletJumpItem);
        item.initData(data, this._isClub);
    }
}