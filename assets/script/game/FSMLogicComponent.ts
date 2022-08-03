import { IUpdate } from "../define/EIDefine";
import UpdateComponent from "../funcomponent/UpdateComponent";
import StateMachine from "../statemachine/StateMachine";
import TexasGame from "./TexasGame";

/**
 * 状态机刷新组件
 */
export default class FSMLogicComponent implements IUpdate {

    allowUpdate: boolean = false;

    public entity: any;

    protected _sm: StateMachine = null;

    public awake(game: TexasGame) {

        this._sm = new StateMachine(game);

    }

    private readonly TimeThreshold: number = 1 / 60;

    public update() {

        if (this.allowUpdate) {

            // float startTime = Time.realtimeSinceStartup;

            // this._sm.UpdateStateMachine();

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
