import { UIDefine } from "../../define/UIDefine";
import { GameCache } from "../../game/GameCache";
import WebImageHelper from "../../helper/WebImageHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import { Web_User_Info, Web_User_Modify_User_Info, WWW } from "../../net/https/WebRequest";
import BottomSelector from "../../ui/component/BottomSelector";
import UICommonDialog from "../../ui/dialog/UICommonDialog";
import BaseFormPlus from "../../ui/form/BaseFormPlus";
import UIComponent from "../../ui/UIComponent";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIEditInformation extends BaseFormPlus {

    

    cc_Sprite$head:cc.Sprite = null;
    BottomSelector$selector:BottomSelector = null;
    //part1
    $Page1:cc.Node = null;
    $name:cc.Node = null;
    $sex:cc.Node = null;
    cc_Label$name:cc.Label = null;
    cc_Label$sex:cc.Label = null;
    /////////////////////////////////////////////
    bottomSelect_data:any = null;

    lateLoad(){
        this.name = "UIEditInformation";
        super.lateLoad();
    }
    /**
     * 每次打开面板处理的内容
     */
     onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
         super.onShow(param,fromUI,sceneUI);
         this.refreshUserInfo();
         this.BottomSelector$selector.data = ["UIMine_UserInfoSetting_Female","UIMine_UserInfoSetting_Male",this];
     }
     regiterTouchEvents(){
         super.regiterTouchEvents();
         this.setButtonClick(this.$name,this.onNameClick);
         this.setButtonClick(this.$sex,this.onSexClick);
     }
     //刷新用户信息
    refreshUserInfo() {
        WebImageHelper.SetHeadImage(this.cc_Sprite$head, GameCache.Instance.headPic);
        this.refreshNick();
        this.refreshSex();
    }

    refreshNick(){
        this.cc_Label$name.string = Web_User_Info.Response.data.user.nickname;
    }
    //0女 1男
    refreshSex(){
        this.cc_Label$sex.string = i18nMgr.Get(Web_User_Info.Response.data.user.sex ? "UIMine_UserInfoSetting_Male":"UIMine_UserInfoSetting_Female");
    }
    ////////////click////////////
    onNameClick(){
        //更改姓名
        UIComponent.open(UIDefine.UIChangeName);
    }
    onSexClick(){
        //更改性别
        this.BottomSelector$selector.onShow();
    }
    //性别选择
    onBottomSelect(index:number){
        this.reqChangeSex(index);
    }

    //请求改变性别
    reqChangeSex(sex:number){
        WWW.Instance.CommonAPI(
            {
                web_class: Web_User_Modify_User_Info,
                body:{
				    sex : sex,
                    used_prop_id:0,
                }
            }
        ).then(
            (res: typeof Web_User_Modify_User_Info.Response) => {
                UIComponent.Instance.ToastLanguage("UIMine_Setting117");
                this.reqUserInfo();
            },
            (res: any) => {
            }
        )
    }
    //请求用户信息，判断剩余修改次数
    reqUserInfo() {

        WWW.Instance.CommonAPI(
            {
                web_class: Web_User_Info,
            }
        ).then(
            (res: typeof Web_User_Info.Response) => {
                
            },
            (res: any) => {
                this.refreshSex();
            }
        )
    }
}
