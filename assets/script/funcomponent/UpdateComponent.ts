import { IUpdate } from "../define/EIDefine";

const { ccclass } = cc._decorator;

@ccclass
export default class UpdateComponent extends cc.Component {

    public static _updates: IUpdate[] = [];

    public static Add(update: IUpdate, awake_param?: any) {
        this._updates.push(update);
        update.awake && update.awake(awake_param);
    }
    public static RemoveAll() {
        while (UpdateComponent._updates.length) {
            let update_item = UpdateComponent._updates.pop();
            update_item.stop();
        }
        cc.log("UpdateComponent RemoveAll", UpdateComponent._updates.length);
    }
    update(dt) {
        for (let update of UpdateComponent._updates) {
            update.allowUpdate && update.update(dt);
        }
    }
}
(window as any).UpdateComponent = UpdateComponent;