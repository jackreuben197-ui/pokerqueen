import { ServerMessageBringInOrStoreFail } from '../../../../protobuf/holdem/recv_th_bring_in_or_store_fail_pb';
import { CPErrorCode } from '../../../../i18n/CPErrorCode';
import UIComponent from '../../../../ui/UIComponent';

// BringInOrStoreFail 1118
export function BringInOrStoreFail(data: ServerMessageBringInOrStoreFail.AsObject, roomID: number, matchID: number) {
    if (!data) return;
    const errMsg = data.extNotice || CPErrorCode.ServerErrorDescription(data.extErrcode);
    UIComponent.Instance.Toast(errMsg);
}
