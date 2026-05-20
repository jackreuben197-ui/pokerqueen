import List from '../../common/List';
import GC from '../../frame/GameControl';
import { WebMtt } from '../../net/https/WebRequest';
import UIBase from '../../ui/UIBase';
import MttRealTimeTableItem from './MttRealTimeTableItem';
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/mtt/realTime/MttRealTimeTablesNode')
export default class MttRealTimeTablesNode extends UIBase {
    private tableList: List = null;

    lateLoad() {
        super.lateLoad();
        this.tableList = this.getChildNodeOrComponent('tableList', List);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        GC.notify.register(WebMtt.ROOMS, this.updateList, this);
    }

    // protected notify(id: any, msg: any, sendInfo?: any): void {
    //     //id = id.replace(/(?<=mtt\/)\d+/g, "{0}");
    //     switch (id) {
    //         case WebMtt.ROOMS: {
    //             this.updateList();
    //         } break;
    //     }
    // }
    initData() {
        this.tableList.scrollingCB = this.scrollingCB;
        GC.data.mtt.realTime.rooms.reqList();
    }
    scrollingCB = (scrollView: cc.ScrollView) => {
        if (scrollView) {
            let cur = scrollView.getScrollOffset();
            let max = scrollView.getMaxScrollOffset();
            let isDown = cur.y >= max.y;
            if (isDown) {
                GC.data.mtt.realTime.rooms.dropDownReq();
            }
        }
    };

    updateList() {
        this.tableList.numItems = GC.data.mtt.realTime.rooms.list.length;
    }

    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(MttRealTimeTableItem);
        item.initData(GC.data.mtt.realTime.rooms.list[index]);
    }
}
