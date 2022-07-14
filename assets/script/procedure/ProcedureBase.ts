
export default class ProcedureBase {

    Enter(param?: any) {
        cc.log("::", this.Name, "Enter()", "param:", param);
    }
    Leave() {
        cc.log("::", this.Name, "Leave()");
    }
   
    get Name() {
        return this.constructor.name;
    }

}
