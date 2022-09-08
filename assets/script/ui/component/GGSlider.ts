
const { ccclass, property } = cc._decorator;

export enum Direction {
    Left_To_Right,
    Bottom_To_Top,
}

@ccclass
export default class GGSlider extends cc.Component {

    @property({ type: cc.Enum(Direction) })
    direction: Direction = Direction.Left_To_Right;

    @property(cc.Node)
    track_back: cc.Node = null;

    @property(cc.Node)
    track_top: cc.Node = null;

    @property(cc.Node)
    bar: cc.Node = null;

    @property({ range: [0, 50], step: 1 })
    min: number = 1;
    @property({ range: [0, 50], step: 1 })
    max: number = 3;

    private _curValue: number = 0;

    step_count: number = 0;

    press: boolean = false;
    moved: boolean = false;

    step_dis: number = 0;

    //倍数
    private _rate: number = 0;
    private _param: any = null;

    private _onChange: Function = null;

    onLoad() {
        this.bar.on(cc.Node.EventType.TOUCH_START, this.onBarTouchStart, this);
        this.bar.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.bar.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.bar.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

        this.track_back.on(cc.Node.EventType.TOUCH_START, this.onTrackTouchStart, this);
        this.track_back.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.track_back.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.track_back.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

        this.reset();
    }

    reset(): void {
        this.value = this.min;
    }

    onShow(param?: any) {
        this._param = param;
    }

    onBarTouchStart(e: cc.Event.EventTouch) {
        this.press = true;
        this.moved = false;
    }
    onTouchMove(e: cc.Event.EventTouch) {
        if (this.step_count == 0) return;
        if (this.press) {
            let w_location = e.getLocation();
            let l_location = this.node.convertToNodeSpaceAR(w_location);
            let x = l_location[this.trans("x")];
            if (l_location[this.trans("x")] < 0) x = Math.max(l_location[this.trans("x")], 0);
            if (l_location[this.trans("x")] > this.node[this.trans("width")]) x = Math.min(l_location[this.trans("x")], this.node[this.trans("width")]);
            this.setBarPos(this.min + this.postion2pos(x));
            this.moved = true;
        }
    }
    onTouchEnd() {
        this.press = false;
    }

    onTrackTouchStart(e: cc.Event.EventTouch) {
        if (this.step_count == 0) return;
        this.press = true;
        let w_location = e.getLocation();
        let l_location = this.node.convertToNodeSpaceAR(w_location);
        this.setBarPos(this.min + this.postion2pos(l_location[this.trans("x")]))
    }




    postion2pos(postion: number) {
        return Math.ceil((postion - this.step_dis / 2) / this.step_dis);
    }

    setBarPos(rate: number) {
        this.rate = rate;
        let step = rate - this.min;
        this.bar[this.trans("x")] = step / this.step_count * this.node[this.trans("width")] || 0;
        this.track_top[this.trans("width")] = this.bar[this.trans("x")];
        //响应回调
        this._onChange?.(rate);
    }
    get rate(): number {
        return this._rate;
    }
    set rate(rate: number) {
        this._rate = rate;
    }

    public onChange(callback: Function) {
        this._onChange = callback;
    }

    public set maxValue(value: number) {
        this.max = value;
        this.updateBase();
    }
    public set minValue(value: number) {
        this.min = value;
        this.updateBase();
    }
    public set value(value: number) {
        this._curValue = value;
        this.setBarPos(this._curValue);
    }


    public get value(): number {
        return this._curValue;
    }

    public updateBase() {
        this.step_count = this.max - this.min;
        this.step_dis = this.node[this.trans("width")] / this.step_count;
    }

    private trans(prop: string): string {
        switch (this.direction) {
            case Direction.Left_To_Right:
                break;
            case Direction.Bottom_To_Top:
                if (prop == "x") prop = "y";
                if (prop == "width") prop = "height";
                break;
        }
        return prop;
    }
}
