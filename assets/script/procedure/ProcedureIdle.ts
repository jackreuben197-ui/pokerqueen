/**
 * 闲置流程
 */
import ProcedureBase from './ProcedureBase';
const { ccclass, property } = cc._decorator;

@ccclass
export default class ProcedureIdle extends ProcedureBase {
    Name: string = 'ProcedureIdle';

    lateEnter(param?: any) {
        super.lateEnter(param);
    }

    Leave() {
        super.Leave();
    }
}
