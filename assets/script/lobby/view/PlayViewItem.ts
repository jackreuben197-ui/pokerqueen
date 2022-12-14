import LobbyRoomListItem from "../../frame/data/lobby/LobbyRoomListItem";
import TimeHelper from "../../helper/TimeHelper";
import UIBase from "../../ui/UIBase";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PlayViewItem extends UIBase {
    startTime: number;
    IntervalId = null;
    mRoomLeaveTime: any = null;

    //设置列表信息
    /**≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
        最下方列表中item的UI接入数据 点击事件等
    ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈*/
    updateItemInfo(roomInfo: LobbyRoomListItem) {
        let deadLineTime = TimeHelper.RFC3339TimeConvertToUTCTime(roomInfo.start_time)
        let roomLeftTime = deadLineTime / 1000 + roomInfo.play_duration - new Date().getTime() / 1000
        if (roomLeftTime > 0) {
            this.mRoomLeaveTime = roomLeftTime;
            let textTitle = this.getComponent(cc.Label);
            textTitle.string = TimeHelper.ShowRemainingSemicolon(this.mRoomLeaveTime);
            this.ShowLeaveTimer(textTitle);
        }
    }

    ShowLeaveTimer(textTitle) {
        // TimerComponent mTC = Game.Scene.ModelScene.GetComponent<TimerComponent>();
        this.IntervalId = setInterval(() => {
            if (this.mRoomLeaveTime >= 0 && this.node.isValid) {
                this.mRoomLeaveTime--;
                if (textTitle != null)
                    textTitle.string = TimeHelper.ShowRemainingSemicolon(this.mRoomLeaveTime);
            } else {
                if (textTitle != null && cc.isValid(this.node, true)) {
                    textTitle.string = "00:00";
                }
            }
        }, 1000)
    }

    updateNormalItem(data) {
        let textTitle = this.getComponent(cc.Label);
        if (textTitle != null && cc.isValid(this.node, true)) {
            textTitle.string = `${this.getTime(data)}/${this.getTime(data)}`
        }
    }

    getTime(pNum: number) {
        if (pNum >= 3600) {
            let h = Math.floor(pNum / 3600);
            let m = Math.floor(pNum % 3600 / 3600);
            let mRound = Math.round(m);
            return h + mRound + "h";
        }
        else if (pNum >= 0)
            return Math.floor(pNum / 60) + "m";

        return "0m";
    }


}
