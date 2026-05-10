import ProcedureBase from './ProcedureBase';
import H5MsgMgr from '../H5MsgMgr';
import UIComponent, { PrefabUI, isPrefabUI } from '../ui/UIComponent';

/**
 * 回到H5
 */
export default class ProcedureReturn extends ProcedureBase {
    override Name: string = 'ProcedureReturn';

    override lateEnter<T>(param?: T) {
        super.lateEnter<T>(param);
        if (isPrefabUI(param)) {
            UIComponent.Instance.HideUI(param);
        }
        // 通知 H5 层恢复显示
        H5MsgMgr.sendToH5('h5Show', 1);
    }

    override Leave() {
        super.Leave();
    }
}
