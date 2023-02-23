import { ClubCache } from "../../frame/data/club/ClubCache";
import WebImageHelper from "../../helper/WebImageHelper";
import { Web_Org_Club_Get } from "../../net/https/WebRequest";
import UIBasePlus from "../../ui/UIBasePlus";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ItemMall extends UIBasePlus {
    cc_Sprite$icon:cc.Sprite = null;
    cc_Label$count:cc.Label = null;
    cc_Label$price:cc.Label = null;
    $discount:cc.Node = null;
    cc_Label$discount:cc.Label = null;
    $price:cc.Node = null;
    //////////////////////////////////
    
    onShow(data: any): void {
        super.onShow(data);
        this.refreshUI(data);
    }
    refreshUI(data: any) {
        WebImageHelper.SetUrlImage(this.cc_Sprite$icon,data.picture,null);
        this.cc_Label$count.string = `*${data.num}`;
        this.cc_Label$price.string = `${data.price/100}`;
        if(data.discount == 0){
            this.$discount.active = false;
        }else{
            this.$discount.active = true;
            this.cc_Label$discount.string = data.discount + "% FREE";
        }
    }
}
