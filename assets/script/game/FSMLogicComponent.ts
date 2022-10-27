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

    private readonly TimeThreshold: number = 1 / 60;

    public update(dt: number) {

        if (this.allowUpdate) {

            // float startTime = Time.realtimeSinceStartup;

            this._sm.UpdateStateMachine(dt);

            // float timeDiff = Time.realtimeSinceStartup - startTime;
            // if (timeDiff > this.TimeThreshold)
            // {
            //     if (this._sm.GlobalState != null)
            //     {
            //         Log.Warning($"Low Performance: {this._sm.GlobalState.GetType()}, time = {timeDiff * 1000} ms");
            //     }
            //     else
            //     {
            //         Log.Warning($"Low Performance: {this._sm.CurrentState.GetType()}, time = {timeDiff * 1000} ms");
            //     }
            // }
        }
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
