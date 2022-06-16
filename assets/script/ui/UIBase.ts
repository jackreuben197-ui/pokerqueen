

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIBase extends cc.Component {


    protected onLoad(): void {
        
    }

    get UIDefine() {
        return this.constructor["UIDefine"];
    }
}
