import { MessageSubType } from "../../config/TTypeConfig";
import GC from "../../frame/GameControl";
import TimeHelper from "../../helper/TimeHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import { APIOrgClubUploadIcon } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import { LobbyControl } from "../control/LobbyControl";
import { UIClubModel } from "../labor/UIClubModel";



const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMine_Message extends BaseForm {



    protected lateLoad() {
        super.lateLoad();
    }


    lateClose(param: any = null) {
        super.lateClose(param);
    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: cc.Node): void {
        super.onShow(param, fromUI);
       
        this.resetUI();

        for (let i=1; i<6; i++) {
            let btn_pt_1: cc.Node = this.getChildNodeOrComponent("pi_" + i);
            btn_pt_1["index"] = i;
            btn_pt_1.on(cc.Node.EventType.TOUCH_END, this.onClickNLH, this)
        }

        this.reqUpInfo(1);
    }

    changeType(chooseType) {
        if (chooseType == 1) {
            return 4;
        } else if (chooseType == 2) {
            return 3;
        } else if (chooseType == 3) {
            return 1;
        } else if (chooseType == 4) {
            return 2;
        } else if (chooseType == 5) {
            return 5;
        }
    }


    reqUpInfo(index) {
        let info = {
            msg_type: this.changeType(index),//消息类型:1-bag,2-club,3-money,4-system,5-tribe
            limit: 200,//条目
            offset: 0,//开始下标。例子（offset=0，limit=10，0-9。）
        }
        LobbyControl.getInstance().reqMessageList(info).then(
            (res) => {
                // this.SetItemInfo(res);
                this.refreshListView(index, res);
            },
            (res) => {
            }
        )
    }

    refreshChooseNLH(index) {
        for (let i=1; i<6; i++) {
            let btn_pt_1: cc.Node = this.getChildNodeOrComponent("pi_" + i);
            let lbl = btn_pt_1.getChildByName("lbl");
            let img_line = btn_pt_1.getChildByName("img_line");
            if (i == index) {
                lbl.color = cc.color(53, 163, 179);
                img_line.active = true;
            } else {
                lbl.color = cc.color(255, 255, 255);
                img_line.active = false;
            }
        }
    }

    onClickNLH(event) {
        let node = event.target;
        let index = node.index;
        this.refreshChooseNLH(index);
        this.reqUpInfo(index);
    }

    resetUI() {
        this.refreshChooseNLH(1);
    }

    getCurViewUI(index) {
        let sv = null;
        for (let i=1; i<6; i++) {
            let sv_down: cc.Node = this.getChildNodeOrComponent("sv_down" + i);
            if (i == index) {
                sv_down.active = true;
                sv = sv_down;
            } else {
                sv_down.active = false;
            }
        }
        return sv;
    }

    refreshListView(index, data) {
        let list = data.data.list;
        let lbl_noshow: cc.Node = this.getChildNodeOrComponent("lbl_notShow");
        let curSV = this.getCurViewUI(index);
        let scrollView = curSV.getComponent(cc.ScrollView);
        scrollView.content.removeAllChildren();
        scrollView.scrollToTop();
        let len = list.length;
        if (len == 0) {
            lbl_noshow.active = true;
        } else {
            lbl_noshow.active = false;
            // 有数据 刷新列表
            let panel_item: cc.Node = this.getChildNodeOrComponent("panel_item");
            for (let i=0; i<len; i++) {
                let _cloneNode = cc.instantiate(panel_item);
                _cloneNode.x = 0;
                _cloneNode.y = -_cloneNode.height * 0.5 - _cloneNode.height * (i);
                _cloneNode.parent = scrollView.content;

                let info = list[i];

                _cloneNode.getChildByName("lbl_time").getComponent(cc.Label).string = TimeHelper.convertUTCTimeToLocalTime(info.create_time);

               let rt_msg = _cloneNode.getChildByName("rt_msg").getComponent(cc.RichText);
               this.SetItemInfo(rt_msg, info);
               
               
            }
            scrollView.content.height = panel_item.height * (len + 2);
        }
    }


    
    SetItemInfo(rt_msg, pDto) {
        let tValue = LobbyControl.getInstance().GetMsg(pDto.msg_type);
        if (tValue == null) {
            return;
        }
        var tContentColor = " <color=#3BE1F5> " + pDto.content + " </color> ";
        var tRemarkColor = " <color=#3BE1F5> " + pDto.remark + " </color> ";
        var tTitleColor = pDto.title;
        if (pDto.msg_type == MessageSubType.MsgBagTypeGetTickets || pDto.msg_type == MessageSubType.MsgBagTypeUserTransferTicketsToSelf || pDto.msg_type == MessageSubType.MsgBagTypeUserTransferTicketsToOther
            || pDto.msg_type == MessageSubType.MsgBagTypeAwardPropsByEveryDayTask || pDto.msg_type == MessageSubType.MsgBagTypeAwardPropsByAchievementsTask || pDto.msg_type == MessageSubType.MsgBagTypeAwardPropsByVipInvitationReward)
        {
            var str = pDto.title.split('X');
            let num = " x" + str[str.Length - 1];
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

}
