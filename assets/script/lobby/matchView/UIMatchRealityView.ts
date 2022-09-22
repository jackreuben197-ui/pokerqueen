import List from "../../common/List";
import UIBase from "../../ui/UIBase";
import { TMatchRealityDataType } from "./MatchViewConfig";

const { ccclass, property } = cc._decorator;
@ccclass
export default class UIMatchRealityView extends UIBase {
    private list: List = null;

    private _data: Array<TMatchRealityDataType> = [
        { bgPath: "gameCardIcon_1", name: "大鲨鱼", url: "url:大鲨鱼" },
        { bgPath: "gameCardIcon_2", name: "体育明星", url: "url:体育明星" },
        { bgPath: "gameCardIcon_3", name: "Black J", url: "url:Black J" },
        { bgPath: "gameCardIcon_4", name: "21点", url: "url:21点" },
        { bgPath: "gameCardIcon_5", name: "炸金花", url: "url:炸金花" },
        { bgPath: "gameCardIcon_6", name: "消消乐", url: "url:消消乐" },
        { bgPath: "gameCardIcon_7", name: "老虎机", url: "url:老虎机" },
        { bgPath: "gameCardIcon_1", name: "大鲨鱼2", url: "url:大鲨鱼2" },
        { bgPath: "gameCardIcon_2", name: "体育明星2", url: "url:体育明星2" },
        { bgPath: "gameCardIcon_3", name: "Black J2", url: "url:Black J2" },
        { bgPath: "gameCardIcon_4", name: "21点2", url: "url:21点2" },
        { bgPath: "gameCardIcon_5", name: "炸金花2", url: "url:炸金花2" },
        { bgPath: "gameCardIcon_6", name: "消消乐2", url: "url:消消乐2" },
        { bgPath: "gameCardIcon_7", name: "老虎机2", url: "url:老虎机2" },
    ]

    private _searchData:Array<TMatchRealityDataType>
    protected onLoad(): void {
        super.onLoad();
        this.initUI();
    }

    initUI() {

    }

    onShow(param?: any): void {
        super.onShow(param);
    }
}