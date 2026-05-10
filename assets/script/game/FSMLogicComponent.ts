import { IUpComponent } from '../funcomponent/UpdateComponent';
import StateMachine from '../statemachine/StateMachine';

/**
 * 状态机刷新组件
 */
export default class FSMLogicComponent implements IUpComponent {
    active: boolean = false;
    protected _sm: StateMachine = null;

    constructor(entity: any) {
        this._sm = new StateMachine(entity);
    }

    public Update(dt: number) {
        this._sm.UpdateStateMachine(dt);
    }

    public get SM() {
        return this._sm;
    }
}
