import ListItem from "../../../common/ListItem";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/lobby/view/record/UIRecordBXListItem')
export default class UIRecordBXListItem extends ListItem {
    private icon: cc.Sprite = null;
    private rank: cc.Label = null;
    private userName: cc.Label = null;
    private gold: cc.Label = null;
    private line: cc.Node = null;
    lateLoad() {
        super.lateLoad();
        this.icon = this.getChildNodeOrComponent("icon", cc.Sprite)
        this.rank = this.getChildNodeOrComponent("rank", cc.Label)
        this.userName = this.getChildNodeOrComponent("userName", cc.Label)
        this.gold = this.getChildNodeOrComponent("gold", cc.Label)
        this.line = this.getChildNodeOrComponent("line");
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }

    initData(data, isLast) {
        // this.setTexture(this.icon, "")
        this.setText(this.rank, 0);
        this.setText(this.userName, "xx");
        this.setText(this.gold, "xx");
        this.setActive(this.line, !isLast);
    }
}