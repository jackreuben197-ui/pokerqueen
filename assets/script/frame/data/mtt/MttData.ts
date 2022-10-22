import { Web_Mtt } from "../../../net/https/WebRequest";
import { BaseData } from "../../base/BaseData";
import MttListModel from "./MttListModel";

export default class MttData extends BaseData {
    list: MttListModel = new MttListModel();
    protected notify(id: any, msg: any, sendInfo?: any): void {
        switch (id) {
            case Web_Mtt.LIST: {
                this.list.updateData(msg);
            } break;
        }
    }

    reqMttList(offset: number = 0, limit: number = 10) {
        this.reqServePost(Web_Mtt.LIST, { limit: limit, offset: offset });
    }
}