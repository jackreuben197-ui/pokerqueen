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
    //最小最大范围
    _min: number = 0;
    _max: number = 0;
    //份数
    _count: number = 0;
    //距离份数
    _count_dis: number = 0;

    _index: number = 0;

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

    get Index() {
        return this._index;
    }

    get TrackBack() {
        return this.track_back.getChildByName("click") || this.track_back;
    }

    onShow(param: { index: number }) {
        this.moved = false;
        this.setBarPos(param.index);
    }
    onBarTouchStart(e: cc.Event.EventTouch) {
        this.press = true;
        this.moved = false;
    }
    onTouchMove(e: cc.Event.EventTouch) {
        if (this._count == 0) return;
        if (this.press) {
            let w_location = e.getLocation();
            let l_location = this.node.convertToNodeSpaceAR(w_location);
            let pos = this.getPos(l_location);
            pos = Math.max(0, pos);
            pos = Math.min(pos, this.distance);
            let index = this.getIndex(pos);
            this.setBarPos(index);
            this.moved = true;
        }
    }
    onTouchEnd() {
        this.press = false;
    }

    onTrackTouchStart(e: cc.Event.EventTouch) {
        if (this._count == 0) return;
        this.press = true;
        let w_location = e.getLocation();
        let l_location = this.node.convertToNodeSpaceAR(w_location);
        let pos = this.getPos(l_location);
        let index = this.getIndex(pos);
        this.setBarPos(index);
    }


    public SetMinMax(min: number, max: number) {
        console.log("SetMinMax", min, max);
        this._min = min;
        this._max = max;
        this._count = max - min;
        if (this._count == 0) {
            this._count_dis = 0;
        } else {
            this._count_dis = this.distance / this._count;
        }
    }
    setBarPos(index: number) {
        this.setPos(this.bar, index * this._count_dis);
        this.setOffset(this.track_top, index * this._count_dis);
        this._index = index;
        this._onChange?.(index);
    }
    getIndex(offset: number) {
        return Math.round(offset / this._count_dis);
    }

    public onChange(callback: Function) {
        this._onChange = callback;
    }


    // public set index(value: number) {
    //     this._index = value;
    //     this.setBarPos(this._index);
    // }


    private get distance() {
        if (this.direction == Direction.Bottom_To_Top) {
            return this.node.height;
        }
        return this.node.width;
    }
    private getPos(obj: { x: number, y: number }) {
        if (this.direction == Direction.Bottom_To_Top) {
            return obj.y;
        }
        return obj.x;
    }
    private setPos(obj: { x: number, y: number }, pos: number) {
        if (this.direction == Direction.Bottom_To_Top) {
            obj.y = pos;
        } else {
            obj.x = pos;
        }
    }
    private setOffset(obj: { width: number, height: number }, offset: number) {
        if (this.direction == Direction.Bottom_To_Top) {
            obj.height = offset;
        } else {
            obj.width = offset;
        }
    }

}
