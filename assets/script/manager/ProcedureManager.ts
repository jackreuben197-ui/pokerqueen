/*
 * @Author: xfj
 * @Date: 2022-09-23 15:02:45
 * @description:
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-22 13:54:19
 * @FilePath: /pokerqueen/assets/script/manager/ProcedureManager.ts
 */
/**
 * 全局流程管理器
 */
import { ProcedureEnum } from '../define/EIDefine';
import ProcedureBase from '../procedure/ProcedureBase';
import ProcedureEnterTexas from '../procedure/ProcedureEnterTexas';
import ProcedureIdle from '../procedure/ProcedureIdle';
import ProcedureInit from '../procedure/ProcedureInit';
import ProcedureReturn from '../procedure/ProcedureReturn';
import ProcedureTexas from '../procedure/ProcedureTexas';

export default class ProcedureManager {
    private static procedureDic: { [key: number]: ProcedureBase } = {};
    public static prevProcedure: ProcedureBase = null;
    public static currProcedure: ProcedureBase = null;
    private static _isSwitching = false;

    static Init() {
        this.procedureDic[ProcedureEnum.Idle] = new ProcedureIdle(ProcedureEnum.Idle);
        this.procedureDic[ProcedureEnum.Return] = new ProcedureReturn(ProcedureEnum.Return);
        this.procedureDic[ProcedureEnum.Init] = new ProcedureInit(ProcedureEnum.Init);
        this.procedureDic[ProcedureEnum.EnterTexas] = new ProcedureEnterTexas(ProcedureEnum.EnterTexas);
        this.procedureDic[ProcedureEnum.Texas] = new ProcedureTexas(ProcedureEnum.Texas);
        ProcedureManager.StartProcedure(ProcedureEnum.Init);
    }

    //开始某个流程
    static async StartProcedure<T>(procedureIndex: number, param: T = null): Promise<void> {
        let procedure = this.procedureDic[procedureIndex];
        if (!procedure) {
            console.log('未定义流程:', ProcedureEnum[procedureIndex]);
            return;
        }
        ProcedureManager.currProcedure = procedure;
        let prevProcedure = ProcedureManager.prevProcedure;
        // console.log('[Procedure]',"DEBUG_LOG: 被调用了", new Error().stack);
        if (prevProcedure) {
            if (prevProcedure.id == procedure.id) return;
            if (this._isSwitching) {
                console.warn('[Procedure]', '流程切换中,忽略此次切换流程');
                return;
            }
            this._isSwitching = true;
            //保护性流程切换
            try {
                // 这里需要等待(完善流程)
                console.log('[Procedure]', prevProcedure.Name, '开始 Leave');
                await Promise.resolve(prevProcedure.Leave());
            } catch (e) {
                console.error('[Procedure]', `${prevProcedure.Name} leave error, continue switch`, e);
            } finally {
                this._isSwitching = false; // 无论成功失败，最后解锁
            }
        }
        console.log('[Procedure]', '[上个流程:', prevProcedure && prevProcedure.Name, '切换到==>当前流程:', ProcedureEnum[procedure.id]);
        ProcedureManager.prevProcedure = procedure;
        // 这里可以不等待
        procedure.Enter<T>(param);
    }

    //设置当前流程
    static SetCurrProcedure(procedureIndex: number) {
        let procedure = this.procedureDic[procedureIndex];
        ProcedureManager.currProcedure = procedure;
    }
}
