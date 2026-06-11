import ProcedureBase from './ProcedureBase';
import H5MsgMgr, { H5RouteData } from '../H5MsgMgr';
import UIComponent, { PrefabUI, isPrefabUI } from '../ui/UIComponent';

export interface ProcedureReturnNavigateParam {
    routeData?: H5RouteData;
    needClosedUI?: PrefabUI[];
}

/**
 * 回到H5
 */
export default class ProcedureReturn extends ProcedureBase {
    override Name: string = 'ProcedureReturn';

    override lateEnter<T>(param?: T) {
        super.lateEnter<T>(param);
        if (param) {
            const navigate = param as ProcedureReturnNavigateParam;
            if (navigate && navigate.needClosedUI) {
                navigate.needClosedUI.forEach(v => {
                    UIComponent.Instance.HideUI(v);
                });
            }
            if (navigate && navigate.routeData) {
                H5MsgMgr.sendToH5('h5Navigate', 1, navigate.routeData);
                return;
            }
        }
        // 通知 H5 层恢复显示
        H5MsgMgr.sendToH5('h5Show', 1);
    }

    override Leave() {
        super.Leave();
    }
}
