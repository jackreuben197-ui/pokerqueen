import { ProtocolCode } from './ProtocolCode';

export default class OpCodeHelper {
    /**
     * 忽略菊花的WS CODE
     */
    static _IgnoreShowJuhua_Codes = [ProtocolCode.Protocol_Holdem_Heartbeat];

    static NeedJuhua(code: number): boolean {
        return this._IgnoreShowJuhua_Codes.indexOf(code) == -1;
    }
    /**
     * 忽略打印Log的WS CODE
     */
    static _IgnoreShowLog_Codes = [ProtocolCode.Protocol_Holdem_Heartbeat];

    static NeedLog(code: number): boolean {
        return this._IgnoreShowLog_Codes.indexOf(code) == -1;
    }
}
