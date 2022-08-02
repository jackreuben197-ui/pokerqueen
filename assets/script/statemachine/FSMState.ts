
export default class FSMState {

    protected static _cls = FSMState;

    private static _instance: FSMState = null;

    static get Instance() {
        return this._instance || (this._instance = new this._cls());
    }
    public Enter(entity: any) {
        cc.log("FSMState Enter");
    }

    public Execute(entity: any) {
        cc.log("FSMState Execute");
    }

    public Exit(entity: any) {
        cc.log("FSMState Exit");
    }
}
