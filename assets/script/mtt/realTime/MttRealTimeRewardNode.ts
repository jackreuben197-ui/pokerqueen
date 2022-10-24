import UIBase from "../../ui/UIBase";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/mtt/realTime/MttRealTimeRewardNode')
export default class MttRealTimeRewardNode extends UIBase {
    lateLoad() {
        super.lateLoad();
        
    }
    
    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }
    
    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }
    
    initData(){
        
    }
}