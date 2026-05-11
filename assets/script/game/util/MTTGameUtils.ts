import { MTTJoinAction, UIMTTModel } from '../../new_mtt/UIMTTModel';
import UIComponent from '../../ui/UIComponent';
import { GameCache } from '../GameCache';
import TexasGameUtils from './TexasGameUtils';

export default class MTTGameUtils extends TexasGameUtils {

    //Action<int>
    public HandlePartialBringIn(storeChips: number, resultCallback: (code: number) => void) {
        GameCache.Instance.room_id = 0; // 置空room_id
        UIMTTModel.Instance.HandleMTTJoinAction(
            MTTJoinAction.PartialBringIn,
            bringInCode => {
                resultCallback?.(bringInCode);
            },
            httpState => {
                // http请求异常处理
                this.HandlePartialBringIn(storeChips, resultCallback);
                UIComponent.Instance.Toast(`HTTPRequestStates: ${httpState}`);
            },
            storeChips /*storeChips如果传0，则接口内会web请求相关数据*/
        );
    }

    public HandleRebuy(resultCallback: (code: number) => void) {
        GameCache.Instance.room_id = 0; // 置空room_id
        UIMTTModel.Instance.HandleMTTJoinAction(
            MTTJoinAction.Rebuy,
            rebuyCode => {
                resultCallback?.(rebuyCode);
            },
            httpState => {
                // http请求异常处理
                this.HandleRebuy(resultCallback);
                UIComponent.Instance.Toast(`HTTPRequestStates: ${httpState}`);
            }
        );
    }
}
