import { MessageSubType } from "../../../config/TTypeConfig";
import GC from "../../../frame/GameControl";
import TimeHelper from "../../../helper/TimeHelper";
import ToastManager from "../../../manager/ToastManager";
import UIBasePlus from "../../../ui/UIBasePlus";
import { LobbyControl } from "../../control/LobbyControl";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/matchView/UIMessageItem')
export default class UIMessageItem extends UIBasePlus {


    cc_Label$time: cc.Label = null;
    cc_RichText$message: cc.RichText = null;

    protected lateLoad(): void {
        super.lateLoad();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }

    initData(data: any) {
        this.SetTime(data);
        this.SetMessage(data);
    }
    SetTime(data) {
        this.cc_Label$time.string = TimeHelper.convertUTCTimeToLocalTime(data.create_time);
    }

    SetMessage(data) {
        let tValue = LobbyControl.getInstance().GetMsg(data.msg_type);
        if (tValue == null) {
            this.cc_RichText$message.string = "";
            return;
        }
        var tContentColor = " <color=#3BE1F5> " + data.content + " </color> ";
        var tRemarkColor = " <color=#3BE1F5> " + data.remark + " </color> ";
        var tTitleColor = data.title;
        if (data.msg_type == MessageSubType.MsgBagTypeGetTickets ||
            data.msg_type == MessageSubType.MsgBagTypeUserTransferTicketsToSelf ||
            data.msg_type == MessageSubType.MsgBagTypeUserTransferTicketsToOther ||
            data.msg_type == MessageSubType.MsgBagTypeAwardPropsByEveryDayTask ||
            data.msg_type == MessageSubType.MsgBagTypeAwardPropsByAchievementsTask ||
            data.msg_type == MessageSubType.MsgBagTypeAwardPropsByVipInvitationReward) {

            var str = data.title.split('X');
            let num = " x" + str[str.length - 1];
            let prop = data.title.substring(0, data.title.lastIndexOf('X'));
            prop = prop.trim();
            // tTitleColor = " <color=\"#3BE1F5\"> " + UILoginModel.mInstance.GetRoomNameByKey(prop) + num + " </color> ";
            tTitleColor = GC.data.languageTemp.temp.getName(prop) + num;
        }
        if (data.msg_type == MessageSubType.MsgBagTypeSignUpMatch || MessageSubType.MsgMoneyTypeMatchSignUp == data.msg_type) {
            tTitleColor = TimeHelper.convertUTCTimeToLocalTime((data.title) * 1000);
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

        if (MessageSubType.MsgClubTypeRechargeRequest == data.msg_type ||
            MessageSubType.MsgClubTypeWithdrawRequest == data.msg_type ||
            22 == data.msg_type) {
            // btnGoCheck.SetActive(true);
            // tTxt.gameObject.SetActive(true);
            // ////tTxt1.gameObject.SetActive(false);
            tTxtContent = tTxtContent = LobbyControl.getInstance().formatString(
                tValue,
                tContentColor,
                tRemarkColor,
                tTitleColor
            );
            if (MessageSubType.MsgClubTypeRechargeRequest == data.msg_type) {
                // Log.Error("类型 " + (MessageSubType)pDto.msg_type);
                // UIEventListener.Get(btnGoCheck).onClick = (obj) =>
                // {
                //     UIComponent.Instance.ShowAsyncNoAnimation(UIType.UIClub_FundGive, null, null);
                // };
            }
            else if (MessageSubType.MsgClubTypeWithdrawRequest == data.msg_type) {
                // UIEventListener.Get(btnGoCheck).onClick = (obj) =>
                // {
                //     UIComponent.Instance.ShowAsyncNoAnimation(UIType.UIClub_FundTake, null, null);
                // };
            }
            else if (MessageSubType.MsgBagTypeSignUpMatch == data.msg_type || MessageSubType.MsgMoneyTypeMatchSignUp == data.msg_type) {

            }
        } else if (data.msg_type == MessageSubType.MsgBagTypeUserTransferTicketsToSelf) {
            // btnGoCheck.SetActive(false);
            // tTxt.gameObject.SetActive(true);
            tTxtContent = LobbyControl.getInstance().formatString(
                tValue,
                "<color=#3BE1F5> " + tTitleColor + " </color> ",
                " <color=#3BE1F5> " + data.content + " </color> "
            );
        }
        else if (data.msg_type == MessageSubType.MsgBagTypeUserTransferTicketsToOther) {
            // btnGoCheck.SetActive(false);
            // tTxt.gameObject.SetActive(true);
            tTxtContent = LobbyControl.getInstance().formatString(
                tValue,
                "<color=#3BE1F5> " + data.content + " </color> ",
                " <color=#3BE1F5> " + tTitleColor + " </color> "
            );
        }
        else if (data.msg_type == MessageSubType.MsgBagTypeAwardPropsByEveryDayTask ||
            data.msg_type == MessageSubType.MsgBagTypeAwardPropsByAchievementsTask ||
            data.msg_type == MessageSubType.MsgBagTypeAwardPropsByVipInvitationReward) {
            // btnGoCheck.SetActive(false);
            // tTxt.gameObject.SetActive(true);
            tTxtContent = LobbyControl.getInstance().formatString(
                tValue,
                "<color=#3BE1F5> " + data.remark + " </color> ",
                " <color=#3BE1F5> " + tTitleColor + " </color> "
            );
        }
        else {
            // btnGoCheck.SetActive(false);
            // tTxt.gameObject.SetActive(true);

            let typename = "";
            if (data.game_type > 0) {
                typename = GC.data.languageTemp.temp.getName(data.multi_language_id);/*LanguageManager.Get("GameType_" + (pDto.game_type - 1));*/
            }
            tTxtContent = LobbyControl.getInstance().formatString(
                tValue,
                "<color=#3BE1F5> " + typename + data.content + " </color> ",
                " <color=#3BE1F5> " + data.remark + " </color> ",
                " <color=#3BE1F5> " + tTitleColor + " </color> "
            );
        }
        this.cc_RichText$message.string = tTxtContent;
    }

}