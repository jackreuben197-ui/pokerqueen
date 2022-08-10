

import UIBase from "../ui/UIBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SeatUIRC extends UIBase {

    ///////////////////////////////////
    /**
     * 节点|组件 定义
     */
    imageHeadFrame: cc.Sprite = null;
    imageHeadGray: cc.Sprite = null;
    imageEmpty: cc.Sprite = null;
    rawimageHead: cc.Sprite = null;
    ///////////////////////////////////

    ///////////////////////////////////
    /**
     * 声明内容
     */
    ///////////////////////////////////
    protected lateLoad(): void {
        this.imageHeadFrame = this.getChildNodeOrComponent("Image_HeadFrame", cc.Sprite);
        this.imageHeadGray = this.getChildNodeOrComponent("Image_HeadGray", cc.Sprite);
        this.imageEmpty = this.getChildNodeOrComponent("Image_Empty", cc.Sprite);
        this.rawimageHead = this.getChildNodeOrComponent("RawImage_Head", cc.Sprite);
    }


}
