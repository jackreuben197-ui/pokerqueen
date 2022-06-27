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
    end: number;
    step: number;

    disapear: boolean;

    stayTime: number = 0;

    isHeader: boolean;

    setLabel(content: string) {
        this.labelI18N.key = content;
        this.labelI18N.translate();
    }

    init(start: number, end: number, step: number) {
        this.node.y = start;
        this.end = end;
        this.step = step;
    }
    protected update(dt: number): void {
        if (this.move) {

            if (this.prev) {
                //this.node.y += (this.prev.node.y - this.step - this.node.y) * .2;
                this.node.y = this.prev.node.y - this.step;
            } else {
                this.stayTime += dt;
                this.node.y += (this.end - this.node.y) * .3;
                if (this.isHeader) {

                    if (this.stayTime > 2) {
                        this.node.opacity -= 20;
                    }
                    if (this.stayTime > 2.1) {
                        this.next && (this.next.prev = null);
                        //this.move = false;
                    }
                    if (this.stayTime > 2.5) {
                        //this.next && (this.next.prev = null);
                        this.move = false;
                    }
                } else {
                    this.node.y += 30;
                    this.node.opacity -= 10;
                    if (this.stayTime > .2) {
                        this.next && (this.next.prev = null);
                        //this.move = false;
                    }
                    if (this.stayTime > 2) {
                        //this.next && (this.next.prev = null);
                        this.move = false;
                    }
                }
            }
        }
    }

}
