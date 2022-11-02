import { MessageSubType } from "../../config/TTypeConfig";
import GC from "../../frame/GameControl";
import TimeHelper from "../../helper/TimeHelper";
import ToastManager from "../../manager/ToastManager";
import AssetContext, { AssetFold } from "../../ui/component/AssetContext";
import UIBase from "../../ui/UIBase";
import { LobbyControl } from "../control/LobbyControl";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/matchView/UIMessageItem')
export default class UIMessageItem extends UIBase {

    private icon: cc.Sprite = null;
    private nameLab: cc.Label = null;


    private _data: any = null;
    protected lateLoad(): void {
        super.lateLoad();
        this.icon = this.getChildNodeOrComponent("icon", cc.Sprite);
        this.nameLab = this.getChildNodeOrComponent("name", cc.Label);
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        // this.bindClick(this.node, this.clickBg);
    }

    initData(data: any) {
        
        this.node.getChildByName("lbl_time").getComponent(cc.Label).string = TimeHelper.convertUTCTimeToLocalTime(data.create_time);

        let rt_msg = this.node.getChildByName("rt_msg").getComponent(cc.RichText);
        this.SetItemInfo(rt_msg, data);
    }

    
    SetItemInfo(rt_msg, pDto) {
        let tValue = LobbyControl.getInstance().GetMsg(pDto.msg_type);
        if (tValue == null) {
            rt_msg.string = "";
            return;
        }
        var tContentColor = " <color=#3BE1F5> " + pDto.content + " </color> ";
        var tRemarkColor = " <color=#3BE1F5> " + pDto.remark + " </color> ";
        var tTitleColor = pDto.title;
        if (pDto.msg_type == MessageSubType.MsgBagTypeGetTickets || pDto.msg_type == MessageSubType.MsgBagTypeUserTransferTicketsToSelf || pDto.msg_type == MessageSubType.MsgBagTypeUserTransferTicketsToOther
            || pDto.msg_type == MessageSubType.MsgBagTypeAwardPropsByEveryDayTask || pDto.msg_type == MessageSubType.MsgBagTypeAwardPropsByAchievementsTask || pDto.msg_type == MessageSubType.MsgBagTypeAwardPropsByVipInvitationReward)
        {
            var str = pDto.title.split('X');
            let num = " x" + str[str.length - 1];
            let prop = pDto.title.substring(0, pDto.title.lastIndexOf('X'));
            prop = prop.trim();
            // tTitleColor = " <color=\"#3BE1F5\"> " + UILoginModel.mInstance.GetRoomNameByKey(prop) + num + " </color> ";
            tTitleColor = GC.data.languageTemp.temp.getName(prop) + num;
        }
        if (pDto.msg_type == MessageSubType.MsgBagTypeSignUpMatch || MessageSubType.MsgMoneyTypeMatchSignUp == pDto.msg_type)
        {
            tTitleColor = TimeHelper.convertUTCTimeToLocalTime((pDto.title) * 1000);
        }

        // var tTxt = go.transform.Find("Text_Title").GetComponent<Text>();
        let tTxtContent = "";

        // ////var tTxt1 = go.transform.Find("Text_Title (1)").GetComponent<TMP_Text>();                
        // go.transform.Find("Text_Dot").gameObject.SetActive(tTxt.preferredHeight > 110);
        // UIEventListener.Get(go).onClick = (tmp) =>
        // {
        //     if (tTxt.preferredHeight > 110)
        //         UIComponent.Instance.ShowNoAnimation(UIType.UIMine_MsgSystemContent, tTxt.text);
        // };

        // GameObject btnGoCheck = go.transform.Find("Button_goCheck").gameObject;

        if (MessageSubType.MsgClubTypeRechargeRequest == pDto.msg_type || MessageSubType.MsgClubTypeWithdrawRequest == pDto.msg_type || 22 == pDto.msg_type)
        {
            // btnGoCheck.SetActive(true);
            // tTxt.gameObject.SetActive(true);
            // ////tTxt1.gameObject.SetActive(false);
            tTxtContent = tTxtContent = LobbyControl.getInstance().formatString(
                tValue, 
                tContentColor, 
                tRemarkColor,
                tTitleColor
            );
            if (MessageSubType.MsgClubTypeRechargeRequest == pDto.msg_type)
            {
                // Log.Error("类型 " + (MessageSubType)pDto.msg_type);
                // UIEventListener.Get(btnGoCheck).onClick = (obj) =>
                // {
                //     UIComponent.Instance.ShowAsyncNoAnimation(UIType.UIClub_FundGive, null, null);
                // };
            }
            else if (MessageSubType.MsgClubTypeWithdrawRequest == pDto.msg_type)
            {
                // UIEventListener.Get(btnGoCheck).onClick = (obj) =>
                // {
                //     UIComponent.Instance.ShowAsyncNoAnimation(UIType.UIClub_FundTake, null, null);
                // };
            }
            else if (MessageSubType.MsgBagTypeSignUpMatch == pDto.msg_type || MessageSubType.MsgMoneyTypeMatchSignUp == pDto.msg_type)
            {
                
            }
        } else if (pDto.msg_type == MessageSubType.MsgBagTypeUserTransferTicketsToSelf)
        {
            // btnGoCheck.SetActive(false);
            // tTxt.gameObject.SetActive(true);
            tTxtContent = LobbyControl.getInstance().formatString(
                tValue, 
                "{<color=#3BE1F5> " + tTitleColor + " </color> }", 
                "{ <color=#3BE1F5> " + pDto.content + " </color> }"
            );
        }
        else if (pDto.msg_type == MessageSubType.MsgBagTypeUserTransferTicketsToOther)
        {
            // btnGoCheck.SetActive(false);
            // tTxt.gameObject.SetActive(true);
            tTxtContent = LobbyControl.getInstance().formatString(
                tValue, 
                "{<color=#3BE1F5> " + pDto.content + " </color> }", 
                "{ <color=#3BE1F5> " + tTitleColor + " </color> }"
            );
        }
        else if (pDto.msg_type == MessageSubType.MsgBagTypeAwardPropsByEveryDayTask ||
            pDto.msg_type == MessageSubType.MsgBagTypeAwardPropsByAchievementsTask ||
            pDto.msg_type == MessageSubType.MsgBagTypeAwardPropsByVipInvitationReward)
        {
            // btnGoCheck.SetActive(false);
            // tTxt.gameObject.SetActive(true);
            tTxtContent = LobbyControl.getInstance().formatString(
                tValue, 
                "{<color=#3BE1F5> " + pDto.remark + " </color> }", 
                "{ <color=#3BE1F5> " + tTitleColor + " </color> }"
            );
        }
        else
        {
            // btnGoCheck.SetActive(false);
            // tTxt.gameObject.SetActive(true);

            let typename = "";
            if (pDto.game_type > 0)
            {
                typename = GC.data.languageTemp.temp.getName(pDto.multi_language_id);/*LanguageManager.Get("GameType_" + (pDto.game_type - 1));*/
            }
            tTxtContent = LobbyControl.getInstance().formatString(
                tValue, 
                "{<color=#3BE1F5> " + typename + pDto.content + " </color> }", 
                "{ <color=#3BE1F5> " + pDto.remark + " </color> }",
                "{ <color=#3BE1F5> " + tTitleColor + " </color> }"
            );
        }
        rt_msg.string = tTxtContent;
    }

    clickBg() {
        ToastManager.Instance.createToast(this._data.url);
    }
}