import { MessageSubType } from "../../config/TTypeConfig";
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

        this.refreshListView(1);

        for (let i=1; i<6; i++) {
            let btn_pt_1: cc.Node = this.getChildNodeOrComponent("pi_" + i);
            btn_pt_1["index"] = i;
            btn_pt_1.on(cc.Node.EventType.TOUCH_END, this.onClickNLH, this)
        }
    }

    SetItemInfo(pDto) {
        let tValue = LobbyControl.getInstance().GetMsg(pDto.msg_type);
        if (tValue == null) {
            return;
        }
        var tContentColor = " <color=\"#E1B58D\"> " + pDto.content + " </color> ";
        var tRemarkColor = " <color=\"#E1B58D\"> " + pDto.remark + " </color> ";
        var tTitleColor = " <color=\"#E1B58D\"> " + pDto.title + " </color> ";
        if (pDto.msg_type == MessageSubType.MsgBagTypeGetTickets || pDto.msg_type == MessageSubType.MsgBagTypeUserTransferTicketsToSelf || pDto.msg_type == MessageSubType.MsgBagTypeUserTransferTicketsToOther
            || pDto.msg_type == MessageSubType.MsgBagTypeAwardPropsByEveryDayTask || pDto.msg_type == MessageSubType.MsgBagTypeAwardPropsByAchievementsTask || pDto.msg_type == MessageSubType.MsgBagTypeAwardPropsByVipInvitationReward)
        {
            var str = pDto.title.Split('X');
            let num = " x" + str[str.Length - 1];
            let prop = pDto.title.Substring(0, pDto.title.LastIndexOf('X'));
            prop = prop.Trim();
            // tTitleColor = " <color=\"#E1B58D\"> " + UILoginModel.mInstance.GetRoomNameByKey(prop) + num + " </color> ";
        }
        if (pDto.msg_type == MessageSubType.MsgBagTypeSignUpMatch || MessageSubType.MsgMoneyTypeMatchSignUp == pDto.msg_type)
        {
            // tTitleColor = " <color=\"#FFFFFF\"> " + TimeHelper.GetDateTimer(long.Parse(pDto.title) * 1000).ToString("yyyy-MM-dd HH:mm") + " </color> ";
        }

        // var tTxt = go.transform.Find("Text_Title").GetComponent<Text>();
        // string tTxtContent = "";

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
            // tTxtContent = string.Format(tValue, tContentColor, tRemarkColor, tTitleColor);
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
                // UIEventListener.Get(btnGoCheck).onClick = (obj) =>
                // {
                //     //报名审核同意
                //     var requestData = new WEB2_ApplyAgreed.RequestData()
                //     {
                //         msgId = pDto.msg_id.ToString()
                //     };
                //     HttpRequestComponent.Instance.Send(
                //         WEB2_ApplyAgreed.API,
                //         WEB2_ApplyAgreed.Request(requestData), str =>
                //         {
                //             var tDto = WEB2_ApplyAgreed.Response(str);
                //             if (tDto.status == 0)
                //             {
                //                 UIComponent.Instance.ToastLanguage("error0");

                //                 UIMineModel.mInstance.APIMsgMessageList(mCurMsgType, limit, offset, mpDto =>
                //                 {
                //                     if (mpDto.code == 0)
                //                     {
                //                         offset = mpDto.data.offset + mpDto.data.limit;
                //                         mDtoEles = GetNormalDate(mpDto.data.list) ?? new List<DtoElement>();
                //                         NonShowed.SetActive(mDtoEles.Count == 0);
                //                         mDtoEles.Add(new DtoElement());//因为上下都要菊花  给其追加一条空数据
                //                         OnDataSourceLoadMoreFinished(true);
                //                     }
                //                     else
                //                     {
                //                         mDtoEles = new List<DtoElement>() { new DtoElement() };
                //                         OnDataSourceLoadMoreFinished(false);
                //                     }
                //                 });
                //             }
                //             else
                //             {
                //                 UIComponent.Instance.ToastLanguage("roomError78_1");
                //                 UIMineModel.mInstance.APIMsgMessageList(mCurMsgType, limit, offset, mpDto =>
                //                 {
                //                     if (mpDto.code == 0)
                //                     {
                //                         offset = mpDto.data.offset + mpDto.data.limit;
                //                         mDtoEles = GetNormalDate(mpDto.data.list) ?? new List<DtoElement>();
                //                         NonShowed.SetActive(mDtoEles.Count == 0);
                //                         mDtoEles.Add(new DtoElement());//因为上下都要菊花  给其追加一条空数据
                //                         OnDataSourceLoadMoreFinished(true);
                //                     }
                //                     else
                //                     {
                //                         mDtoEles = new List<DtoElement>() { new DtoElement() };
                //                         OnDataSourceLoadMoreFinished(false);
                //                     }
                //                 });
                //             }
                //         }
                //     );
                // };
            }
            else if (pDto.msg_type == MessageSubType.MsgBagTypeUserTransferTicketsToSelf)
            {
                // btnGoCheck.SetActive(false);
                // tTxt.gameObject.SetActive(true);
                // tTxtContent = string.Format(tValue, $"{" <color=#E1B58D> "}{tTitleColor}{" </color> "}", $"{" <color=#E1B58D> "}{pDto.content}{" </color> "}");
            }
            else if (pDto.msg_type == MessageSubType.MsgBagTypeUserTransferTicketsToOther)
            {
                // btnGoCheck.SetActive(false);
                // tTxt.gameObject.SetActive(true);
                // tTxtContent = string.Format(tValue, $"{" <color=#E1B58D> "}{pDto.content}{" </color> "}", $"{" <color=#E1B58D> "}{tTitleColor}{" </color> "}");
            }
            else if (pDto.msg_type == MessageSubType.MsgBagTypeAwardPropsByEveryDayTask ||
                pDto.msg_type == MessageSubType.MsgBagTypeAwardPropsByAchievementsTask ||
                pDto.msg_type == MessageSubType.MsgBagTypeAwardPropsByVipInvitationReward)
            {
                // btnGoCheck.SetActive(false);
                // tTxt.gameObject.SetActive(true);
                // tTxtContent = string.Format(tValue, $"{" <color=#E1B58D>"}{pDto.remark}{" </color> "}", $"{" <color=#E1B58D> "}{tTitleColor}{" </color> "}");
            }
            else
            {
                // btnGoCheck.SetActive(false);
                // tTxt.gameObject.SetActive(true);

                // string typename = "";
                // if (pDto.game_type > 0)
                // {
                //     typename = UILoginModel.mInstance.GetRoomNameByKey(pDto.multi_language_id);/*LanguageManager.Get("GameType_" + (pDto.game_type - 1));*/
                // }
                // tTxtContent = string.Format(tValue, $"{" <color=#E1B58D> "}{typename + pDto.content}{" </color> "}", $"{" <color=#E1B58D> "}{pDto.remark}{" </color> "}", $"{" <color=#E1B58D> "}{tTitleColor}{" </color> "}");
            }
            // tTxt.text = tTxtContent;
            // if (AlineText(tTxt, tTxt.text))
            // {
            //     tTxt.raycastTarget = true;
            //     tTxt.GetComponent<Button>().onClick.AddListener(() =>
            //     {
            //         UIComponent.Instance.ShowNoAnimation(UIType.UIMine_MsgSystemContent, tTxtContent);
            //     });
            // }
            // else
            // {
            //     tTxt.raycastTarget = false;
            // }
        }

        // go.transform.Find("Text_Time").GetComponent<Text>().text = TimeHelper.GetDateTimer(TimeHelper.GetTimestampByDateTime(TimeHelper.RFC3339TimeConvertToUTCTime(pDto.create_time))).ToString("dd/MM/yyyy HH:mm");

    }

    refreshChooseNLH(index) {
        for (let i=1; i<6; i++) {
            let btn_pt_1: cc.Node = this.getChildNodeOrComponent("pi_" + i);
            let img_line = btn_pt_1.getChildByName("img_line");
            if (i == index) {
                btn_pt_1.color = cc.color(53, 163, 179);
                img_line.active = true;
            } else {
                btn_pt_1.color = cc.color(255, 255, 255);
                img_line.active = false;
            }
        }
    }

    onClickNLH(event) {
        let node = event.target;
        let index = node.index;
        this.refreshChooseNLH(index);

        this.refreshListView(index);
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

    refreshListView(index) {
        let lbl_noshow: cc.Node = this.getChildNodeOrComponent("lbl_notShow");
        let curSV = this.getCurViewUI(index);
        let scrollView = curSV.getComponent(cc.ScrollView);
        scrollView.content.removeAllChildren();
        scrollView.scrollToTop();
        // if (records.length == 0) {
        //     lbl_noshow.active = true;
        // } else {
        //     lbl_noshow.active = false;
            // 有数据 刷新列表
            let panel_item: cc.Node = this.getChildNodeOrComponent("panel_item");
            let len = 50;
            for (let i=0; i<len; i++) {
                let _cloneNode = cc.instantiate(panel_item);
                _cloneNode.x = 0;
                _cloneNode.y = -_cloneNode.height * 0.5 - _cloneNode.height * (i);
                _cloneNode.parent = scrollView.content;

               _cloneNode.getChildByName("rt_msg").getComponent(cc.RichText).string = i.toString();
            }
            scrollView.content.height = panel_item.height * (len + 1);
        // }
    }

}
