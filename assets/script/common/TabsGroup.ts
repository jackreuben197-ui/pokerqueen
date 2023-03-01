

export default class TabsGroup {
    _select: number;
    constructor(public items: cc.Node[], public change?: Function, public _this?: any) {

        items.forEach((item, index) => {
            item["index"] = index;
            item.on("click", this.click, this);
        })
    }
    private click(button: cc.Button) {
        let item = button.node;
        let index = item["index"];
        this.select = index;
    }
    public reset(index: number = 0) {
        this._select = -8;
        this.select = index;
    }

    private set select(index: number) {
        if (this._select == index) return;
        this._select = index;
        this.change?.call(this._this, this.items, index);
    }
}
