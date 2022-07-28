
export default class ProcedureBase {

    //ignoreEnter 跳过进入的处理,特殊回退进程用到
    Enter(param?: any) {
        cc.log("::", this.Name, "Enter()", "param:", param);
        if (param?.ignoreEnter) return;
        this.lateEnter(param);
    }
    Leave() {
        cc.log("::", this.Name, "Leave()");
    }

    lateEnter(param?: any) {

    }

    get Name() {
        return this.constructor.name;
    }

}
