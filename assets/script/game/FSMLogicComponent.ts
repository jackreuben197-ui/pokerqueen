import { IUpdate } from "../define/EIDefine";
import StateMachine from "../statemachine/StateMachine";
/**
 * 状态机刷新组件
 */
export default class FSMLogicComponent implements IUpdate {

    allowUpdate: boolean = false;

    protected _sm: StateMachine = null;

    public awake(entity: any) {

        this._sm = new StateMachine(entity);

    }

    public update(dt: number) {

        if (this.allowUpdate) this._sm.UpdateStateMachine(dt);
    }

    // public Reset(entity: any) {
    //     //this._sm = new StateMachine<Entity>(entity);
    // }
    start() {
        this.allowUpdate = true;
    }
    stop() {
        this.allowUpdate = false;
    }

    public get SM() {
        return this._sm;
    }

}
