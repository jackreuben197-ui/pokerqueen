
export default class ProcedureBase {

    //ignoreEnter 跳过进入的处理,特殊回退进程用到
    Enter(param?: any) {
        console.log("::Procedure ", this.Name, "Enter()", "param:", param);
        if (param?.ignoreEnter) {
            return;
        }
        this.lateEnter(param);
    }
    Leave() {
        console.log("::Procedure ", this.Name, "Leave()");
    }

    protected lateEnter(param?: any) {

    }

    get Name() {
        return this.constructor.name;
    }

}
