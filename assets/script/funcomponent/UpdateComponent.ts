import { IUpdate } from "../define/EIDefine";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UpdateComponent extends cc.Component {

    public static _updates: IUpdate[] = [];

    public static Add(update: IUpdate) {
        this._updates.push(update);
    }
    update(dt) {
        for (let update of UpdateComponent._updates) {
            update.allowUpdate && update.update(dt);
        }
    }
}
(window as any).UpdateComponent = UpdateComponent;