import { Web_Room_Center_Rooms } from "../../net/https/WebRequest";
import UIBase from "../../ui/UIBase";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PlayViewItem extends UIBase {
    startTime: number;

    protected update(dt: number): void {
        let str = +dt;
        cc.log(str);
    }
  
    //设置列表信息
    /**≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
        最下方列表中item的UI接入数据 点击事件等
    ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈*/
    private updateItemInfo(roomInfo: typeof Web_Room_Center_Rooms.DataElement) {
        let duration = Math.floor((roomInfo.play_duration * 1.0 / 3600) * 10) / 10
        let label = this.getComponent(cc.Label);
        label.string = duration.toString();
    }

    private getTime(pNum: number)
    {
        if (pNum >= 3600)
        {
            let h = (pNum / 3600);
            let m = pNum % 3600 / 3600;
            let mRound = Math.round(m);
            return h + mRound + "h";
        }
        else if (pNum >= 0)
            return pNum / 60 + "m";

        return "0m";
    }


}
