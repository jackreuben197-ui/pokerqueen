import LabelI18N from "../../i18n/LabelI18N";



const { ccclass, property } = cc._decorator;

@ccclass
export default class Toast extends cc.Component {

    @property(LabelI18N)
    labelI18N: LabelI18N = null;

    posY: number;

    prev: Toast;
    next: Toast;

    move: boolean;
    middle: number;
    end: number;

    disapear: boolean;

    stayTime: number = 0;

    isHeader: boolean;

    setLabel(content: string) {
        this.labelI18N.key = content;
        this.labelI18N.translate();
    }

    init(start: number, middle: number, end: number, time: number) {
        this.node.y = start;
        this.middle = middle;
        this.end = end;
        // if (this.prev) {
        //     cc.tween(this.node).to(.2, { y: this.end }).start();
        // }
        cc.tween(this.node).to(.2, { y: this.middle }).delay(1).to(.3, { y: this.end, opacity: 0 }).start();

    }
    // protected update(dt: number): void {
    //     if (this.move) {
    //         if (this.prev) {
    //             this.node.y += (this.prev.node.y - this.step - this.node.y) * .2;
    //             //this.node.y = this.prev.node.y - this.step;
    //         } else {
    //             this.node.y += (this.end - this.node.y) * .2;
    //         }
    //     }
    // }

}
