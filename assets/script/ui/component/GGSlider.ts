import { StringHelper } from "../../helper/StringHelper";

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

    //private _curValue: number = 0;



    press: boolean = false;
    moved: boolean = false;

    // step_count: number = 0;
    // step_dis: number = 0;

    //等份
    _part: number = 0;
    _unit: number = 0;
    _index: number = 0;
    //等份距离
    _stepDis: number = 0;
    //倍数
    private _rate: number = 0;
    private _param: any = null;

    private _onChange: Function = null;

    onLoad() {
        this.bar.on(cc.Node.EventType.TOUCH_START, this.onBarTouchStart, this);
        this.bar.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.bar.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.bar.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

        this.TrackBack.on(cc.Node.EventType.TOUCH_START, this.onTrackTouchStart, this);
        this.TrackBack.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.TrackBack.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.TrackBack.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

        // this.track_back.on(cc.Node.EventType.TOUCH_START, this.onTrackTouchStart, this);
        // this.track_back.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        // this.track_back.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        // this.track_back.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        //this.reset();
    }

    get TrackBack() {
        return this.track_back.getChildByName("click") || this.track_back;
    }

    onShow(param?: any) {
        this._param = param;
        this.setBarPos(0);
    }
    onBarTouchStart(e: cc.Event.EventTouch) {
        this.press = true;
        this.moved = false;
    }
    onTouchMove(e: cc.Event.EventTouch) {
        if (this._max == 0) return;
        if (this.press) {
            let w_location = e.getLocation();
            let l_location = this.node.convertToNodeSpaceAR(w_location);
            let x = l_location[this.trans("x")];
            if (l_location[this.trans("x")] < 0) x = Math.max(l_location[this.trans("x")], 0);
            if (l_location[this.trans("x")] > this.node[this.trans("width")]) x = Math.min(l_location[this.trans("x")], this.node[this.trans("width")]);
            let index = this.getIndex(x);
            this.setBarPos(index);
            this.moved = true;
        }
    }
    onTouchEnd() {
        this.press = false;
    }

    onTrackTouchStart(e: cc.Event.EventTouch) {
        if (this._stepDis == 0) return;
        this.press = true;
        let w_location = e.getLocation();
        let l_location = this.node.convertToNodeSpaceAR(w_location);
        let x = l_location[this.trans("x")];
        let index = this.getIndex(x);
        this.setBarPos(index);
        //this.setBarPos(this.min + this.postion2pos(l_location[this.trans("x")]))
    }

    //最小最大范围
    _min: number = 0;
    _max: number = 0;
    //份数
    _count: number = 0;
    //距离份数
    _count_dis: number = 0;

    public SetMinMax(min: number, max: number) {
        this._min = min;
        this._max = max;
        this._count = max - min;
        this._count_dis = this.node[this.trans["width"]] / this._count;
        console.log(this._count_dis);
    }
    setBarPos(index: number) {

        console.log(index, this._count_dis);

        this.bar[this.trans("x")] = index * this._count_dis;
        this.track_top[this.trans("width")] = index * this._count_dis;
        this._onChange?.(index);
    }
    getIndex(offset: number) {
        return Math.round(offset / this._count_dis);
    }

    // postion2pos(postion: number) {
    //     return Math.ceil((postion - this.step_dis / 2) / this.step_dis);
    // }

    // setBarPos(rate: number) {
    //     this.rate = rate;
    //     let step = rate - this.min;
    //     this.bar[this.trans("x")] = step / this.step_count * this.node[this.trans("width")] || 0;
    //     console.log("this.bar.x:", this.bar.x);
    //     this.track_top[this.trans("width")] = this.bar[this.trans("x")];
    //     //响应回调
    //     this._curValue = rate;
    //     this._onChange?.(rate);
    // }
    get rate(): number {
        return this._rate;
    }
    set rate(rate: number) {
        this._rate = rate;
    }

    set part(value: number) {
        this._part = value;
        this._stepDis = this.node[this.trans("width")] / this._part;
    }
    set unit(value: number) {
        this._unit = value;
    }

    public onChange(callback: Function) {
        this._onChange = callback;
    }

    public set maxValue(value: number) {
        this.max = value;
        //this.updateBase();
    }
    public set minValue(value: number) {
        this.min = value;
        //this.updateBase();
    }

    public get maxValue() {
        return this.max;
    }
    public get minValue() {
        return this.min;
    }

    public set index(value: number) {
        this._index = value;
        this.setBarPos(this._index);
    }


    public get value(): number {
        return this.min + this._index * this.unit;
    }

    // public updateBase() {
    //     this.step_count = this.max - this.min;
    //     this.step_dis = this.node[this.trans("width")] / this.step_count;
    // }

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
