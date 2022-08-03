import { StateHandler } from "./StateHandler";

/**
 * 状态机
 */
export default class StateMachine {
    //上一个状态
    previousState: StateHandler = null;
    //当前状态
    currentState: StateHandler = null;
    //全局状态
    globalState: StateHandler = null;

    constructor(public owner?: any) {
    }
    /**
     * 改变状态
     */
    public ChangeState(newState: StateHandler) {

        if (newState == null) {
            console.log("state is null");
            return;
        }

        if (newState == this.currentState) return;

        this.previousState = this.currentState;

        if (this.currentState) this.currentState.Exit(this.owner);

        this.currentState = newState;

        if (this.currentState) this.currentState.Enter(this.owner);
    }
    /**
     * 判断当前状态是否某状态
     */
    public IsInState(state: any) {
        return this.currentState == state;
    }


    /**
     * 返回上一个状态
     */
    public RevertToPreviousState() {
        if (this.previousState) this.ChangeState(this.previousState);
    }
    /**
     * 状态机刷新
     */
    public UpdateStateMachine() {

        if (this.globalState) {
            this.globalState.Execute(this.owner);
        } else {
            if (this.currentState) {
                this.currentState.Execute(this.owner);
            }
        }
    }
    public Clear() {
        this.owner = null;
        this.previousState = null;
        this.currentState = null;
        this.globalState = null;
    }
}
