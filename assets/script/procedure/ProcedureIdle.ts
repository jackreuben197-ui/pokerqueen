/**
 * 闲置流程
 */

import ProcedureBase from "./ProcedureBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ProcedureIdle extends ProcedureBase {

    Enter(param: any) {
        super.Enter(param);
    }
    Leave() {
        super.Leave();
    }
}
