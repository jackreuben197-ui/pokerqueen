
export default class ProcedureBase {

    Name: string = "ProcedureBase";

    param: any = null;
    //ignoreEnter 跳过进入的处理,特殊回退进程用到
    Enter(param?: any) {
        console.log("::Procedure ", this.Name, "Enter()", "param:", param);
        this.param = param;
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
}
