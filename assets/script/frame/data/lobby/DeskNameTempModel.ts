import { TDeskNameTemp } from "../../../config/TTypeConfig";
import { i18nMgr } from "../../../i18n/i18nMgr";

export default class DeskNameTempModel {
    private _data: Map<string, TDeskNameTemp> = new Map();
    updateData(msgs: Array<TDeskNameTemp>) {
        this._data.clear();
        msgs.forEach(msg => {
            if (!this._data.get(msg.template_id)) {
                this._data.set(msg.template_id, msg);
            }
        })
    }

    getName(nameKey: string) {
        let [key, _] = nameKey.split("-")
        let msg = this._data.get(key);
        return msg[`${i18nMgr.language}_name`];
    }
}