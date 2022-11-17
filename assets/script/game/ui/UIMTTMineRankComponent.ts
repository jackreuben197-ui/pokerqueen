import { UIDefine } from "../../define/UIDefine";
import { UIMatchMttModel } from "../../frame/data/mtt/UIMatchMttModel";
import TimeHelper from "../../helper/TimeHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import HttpRequest from "../../net/https/HttpRequest";
import { Web_Room_Center_Mtt_Details, Web_Room_Center_Mtt_Myaward } from "../../net/https/WebRequest";
import UIBase from "../../ui/UIBase";
import UIComponent, { PrefabUI } from "../../ui/UIComponent";
import { GameCache } from "../GameCache";

const { ccclass, property } = cc._decorator;


export class MineRankData {
    public matchId: number;
    public matchName: string;
    public isRebuy: boolean;
    constructor(p: { matchId, matchName, isRebuy }) {
        this.matchId = p.matchId;
        this.matchName = p.matchName;
        this.isRebuy = p.isRebuy;
    }
}
@ccclass
export default class UIMTTMineRankComponent extends UIBase {
    

    rc: any = null;
    icon_baoxiang: any = null;//道具礼品Icon
    icon_titcke: any = null;//道具门票Icon

    nameText: any = null;
    Text_StartTime: any = null;
    Text_GameName: any = null;
    WaitText: any = null;//等待提示icon_name
    TextRank: any = null;//排名
    Text_Rank: any = null;//底部排名显示
    FailText: any = null;//失败提示
    icon_name: any = null;//失败提示
    AwardObj: any = null;//奖励
    AwardTrans: any = null;//奖励预制体item
    RankObj: any = null;//排名
    checkTips: any = null;//查看奖励提示
    RewardDetail: any = null;
    shareBtn: any = null;
    closeBtn: any = null;
    maskBtn: any = null;
    tmpColor: any = null;
    firstRank: any = null;
    FirstAwardTrans: any = null;
    MemberExtraAward: any = null;
    FirstAwardObj: any = null;
    mineRankDate: any = null;
    MttInfo: any = null;
    Bg: any = null;
    Image_Mask: any = null;
    propu_icon: any = null;
    BgHeight = 949;
    gameName: any = null;

    isRequest: any = false;
    lastTime: any = 0;
    IntervalTime: any = 3;
    RequestTimes: any = 0;

    headIcon: any = null;

    enterInfo: any = null;

    InItUI()
    {
        // rc = this.GetParent<UI>().GameObject.GetComponent<ReferenceCollector>();
        // Text_GameName = rc.Get<GameObject>("Text_GameName").GetComponent<Text>();
        this.headIcon = this.getChildNodeOrComponent("img_head", cc.Sprite);
        // nameText = rc.Get<GameObject>("nameText").GetComponent<Text>();
        // Text_StartTime = rc.Get<GameObject>("Text_StartTime").GetComponent<Text>();
        this.WaitText = this.getChildNodeOrComponent("lbl_wait", cc.Label);
        // TextRank = rc.Get<GameObject>("TextRank").GetComponent<Text>();
        // Text_Rank = rc.Get<GameObject>("Text_Rank").GetComponent<Text>();
        // AwardObj = rc.Get<GameObject>("AwardObj");
        // AwardTrans = rc.Get<GameObject>("AwardTrans");
        // RankObj = rc.Get<GameObject>("RankObj");
        // checkTips = rc.Get<GameObject>("checkTips");
        // shareBtn = rc.Get<GameObject>("shareBtn");
        // closeBtn = rc.Get<GameObject>("CloseBtn");
        // maskBtn = rc.Get<GameObject>("Image_Mask");
        // firstRank = rc.Get<GameObject>("firstRank");
        // FirstAwardTrans = rc.Get<GameObject>("FirstAwardTrans");
        // MemberExtraAward = rc.Get<GameObject>("MemberExtraAward");
        // FirstAwardObj = rc.Get<GameObject>("FirstAwardObj");

        // FailText = rc.Get<GameObject>("FailText").GetComponent<Text>();
        // icon_name = rc.Get<GameObject>("icon_name").GetComponent<Text>();
        // //icon_pocker = rc.Get<GameObject>("icon_pocker").GetComponent<Image>();
        // icon_baoxiang = rc.Get<Sprite>("icon_pocker");
        // icon_titcke = rc.Get<Sprite>("icon_pocker");
        // Bg = rc.Get<GameObject>("Bg");
        // Image_Mask = rc.Get<GameObject>("Image_Mask");
        // RewardDetail = rc.Get<GameObject>("RewardDetail");
        // UIEventListener.Get(maskBtn).onClick = onClickClose;
        // UIEventListener.Get(closeBtn).onClick = onClickClose;
        // UIEventListener.Get(shareBtn).onClick = onClickShare;
    }
    
    onShow(obj?: any): void {

        let panel_click: cc.Node = this.getChildNodeOrComponent("panel_click");
        // panel_click.on("click", this.onClickClose, this);

        let btn_close: cc.Node = this.getChildNodeOrComponent("btn_close");
        btn_close.on("click", this.onClickClose, this);

        let btn_ok: cc.Node = this.getChildNodeOrComponent("btn_ok");
        btn_ok.on("click", this.onClickClose, this);

        this.InItUI();
        if (null != obj)
        {
            this.enterInfo = obj;
            let data = obj as MineRankData;
            if (null != data)
            {
                this.mineRankDate = data;
                //Text_GameName.text = mineRankDate.matchName;
                this.gameName = this.mineRankDate.matchName;
                this.InitDefaultUI();
                this.InitUIData();
            }
        }
        // UIShareModel.mInstance.APIShareUsable(UIShareModel.mInstance.SHARE_TYPE_MTT, pDto =>
        // {//邀请玩家分享开关
        //     if (pDto.code == 0)
        //     {
        //         shareSwitch = pDto.data.usable;
        //     }
        // });
    }

    onClickClose(): void {
        UIComponent.close(this.UIDefine);
        // UIComponent.Instance.HideUI(PrefabUI.UIInsuranceComponent);
    }

 
    update()
    {
        if (this.RequestTimes > 5)
        {
            return;
        }
        if (!this.isRequest)
        {
            return;
        }
        if (TimeHelper.Now - this.lastTime < this.IntervalTime)
        {
            return;
        }
        this.lastTime = TimeHelper.Now;
        this.RequestTimes++;
        this.GetMyawardApi();
    }


    OnHide()
    {

    }

    Dispose()
    {
        // if (this.IsDisposed)
        // {
        //     return;
        // }
        this.isRequest = false;
        this.RequestTimes = 0;
        this.BgHeight = 949;

        // this.base.Dispose();
    }

    /// <summary>
    /// 点击分享按钮
    /// </summary>
    /// <param name="go"></param>
    onClickShare(go)
    {
// #if UNITY_ANDROID || UNITY_IOS
//         shareBtn.SetActive(false);
//         tmpColor = new Color(maskBtn.GetComponent<Image>().color.r, maskBtn.GetComponent<Image>().color.g, maskBtn.GetComponent<Image>().color.b, maskBtn.GetComponent<Image>().color.a);
//         maskBtn.GetComponent<Image>().color = Color.black;
//         closeBtn.SetActive(false);//将按钮隐藏 背景设黑
//         checkTips.SetActive(false);
//         ShareHelper.ShareImage(msg =>
//         {//分享完成后
//             shareBtn.SetActive(true);
//             checkTips.SetActive(true);
//             maskBtn.GetComponent<Image>().color = tmpColor;
//             closeBtn.SetActive(true);//将按钮、背景还原
//         });
// #endif
    }

    /// <summary>
    /// 初始化UI
    /// </summary>
    InitDefaultUI()
    {
        this.WaitText.active = true;
    }
    /// <summary>
    /// 初始化数据
    /// </summary>
    InitUIData()
    {
        this.GetMatchRoomsInfo(data =>
        {
            if (this.MttInfo)
            {
                WebImageHelper.SetUrlImage(this.headIcon, GameCache.Instance.headPic);
                // nameText.text = GameCache.Instance.nick;
                // Text_StartTime.text = TimeHelper.TimerDateStr((long)TimeHelper.GetTimestampByDateTime(TimeHelper.RFC3339TimeConvertToUTCTime(this.MttInfo.mtt.start_time))) + "  " + TimeHelper.TimerDateMinStr(TimeHelper.GetTimestampByDateTime(TimeHelper.RFC3339TimeConvertToUTCTime(MttInfo.mtt.start_time)));

                //是否取消rebuy，
                if (this.mineRankDate.isRebuy)
                {
                    //若是当前盲注大于最大盲注级别，不能重购，请求排名
                    if (this.MttInfo.more.bl >= this.MttInfo.mtt.max_rebuy_bl)
                    {
                        this.GetMyawardApi();
                    }
                    else
                    {
                        this.onCloseClick();
                        // UIComponent.Instance.Remove(UIType.UIMTTMineRank);
                    }
                }
                else
                {
                    this.GetMyawardApi();
                }

            }

        });
    }


    ShowVoiceprint()
    {
        // if (this.MttInfo.mtt.voiceprint_verify_on == 1)
        // {
        //     if (!MicrophoneHelper.IsMicrophonePermissionAllowed())
        //     {
        //         return;
        //     }
        //     Game.Scene.GetComponent<UIComponent>().ShowNoAnimation(UIType.UITexasHumanYZ, new UITexasHumanYZComponent.VerificationDataInfo()
        //     {
        //         cacheVoiceprint = VoiceprintRoomType.MTT,
        //         matchId = MttInfo.mtt.match_id,
        //     });
        // }
    }

    /// <summary>
    /// 处理排名相关
    /// </summary>
    /// <param name="responseData"></param>
    HandleRankDate(responseData)
    {
        // if (IsDisposed)
        // {
        //     return;
        // }



        if (responseData.data.is_final)
        {
            this.WaitText.active = false;
            if (responseData.data.rank == 1)
            {
                this.HandleFirstAwardData(responseData);
                // SoundComponent.Instance.PlaySFX(SoundComponent.SFX_MTT_RANKING);
            }
            else
            {
                this.HandleAfterFirstAwardData(responseData);

            }

            //icon_pocker.gameObject.SetActive(true);

            this.ShowVoiceprint();
        }
        else
        {
            // TextRank.text = string.Format(LanguageManager.Get("MTT_end_rank"), $"{responseData.data.rank}/{UIMatchMTTModel.Instance.MttInfo.mtt.participants}");
            // TextRank.gameObject.SetActive(true);
            this.WaitText.active = false;
            // FailText.gameObject.SetActive(true);
        }
        // RewardDetail.SetActive(true);
    }

    /// <summary>
    /// 处理第一名奖励
    /// </summary>
    /// <param name="responseData"></param>
    HandleFirstAwardData(responseData)
    {
        // firstRank.SetActive(true);
        // if (shareSwitch)
        // {
        //     shareBtn.SetActive(true);
        // }
        // else
        // {
        //     shareBtn.SetActive(false);
        // }
        // checkTips.SetActive(true);
        // firstRank.transform.Find("firstRankNum").GetComponent<Text>().text = $"{responseData.data.rank}/{UIMatchMTTModel.Instance.MttInfo.mtt.participants}";
        // firstRank.transform.Find("firstGameNameBg/name").GetComponent<Text>().text = gameName;

        if (responseData.data.award_gold > 0)
        {
            // Text money = firstRank.transform.Find("moneyNum").GetComponent<Text>();
            // money.gameObject.SetActive(true);
            // money.text = string.Format("{0:N2}", responseData.data.award_gold / 100);
        }
        else
        {
            // firstRank.transform.Find("firstRank_baoxiang").gameObject.SetActive(true);
        }

        let awardTypeNum = 0;
        if (responseData.data.award_gold > 0)
        {
            // go = GetCreatePrefab(MemberExtraAward, FirstAwardObj.transform);
            // go.SetActive(true);
            // SetItemData(go, responseData.data.award_gold, false, null, responseData);
            //BgHeight += 260;
            awardTypeNum++;
        }
        if (responseData.data.hunter_award > 0)
        {
            // go = GetCreatePrefab(FirstAwardTrans, FirstAwardObj.transform);
            // go.SetActive(true);
            // SetItemData(go, responseData.data.hunter_award, true, null, responseData);
            // BgHeight += 260;
            awardTypeNum++;
        }
        if (responseData.data.award_goods != null)
        {
            // foreach (var item in responseData.data.award_goods)
            // {
            //     if (awardTypeNum >= 2)
            //     {
            //         break;
            //     }
            //     go = GetCreatePrefab(FirstAwardTrans, FirstAwardObj.transform);
            //     go.SetActive(true);
            //     SetItemData(go, responseData.data.hunter_award, false, item, responseData);
            //     BgHeight += 260;
            //     awardTypeNum++;
            // }
        }
    }

    /// <summary>
    /// 处理第一名之后的奖励
    /// </summary>
    /// <param name="responseData"></param>
    HandleAfterFirstAwardData(responseData)
    {
        // Text_Rank.gameObject.SetActive(true);
        // Text_Rank.text = string.Format(LanguageManager.Get("MTT_end_rank"), $"{responseData.data.rank}/{UIMatchMTTModel.Instance.MttInfo.mtt.participants}");
        // checkTips.SetActive(VerifyGoodsNullOrZero(responseData));
        // AwardObj.SetActive(VerifyGoodsNullOrZero(responseData) || responseData.data.award_gold > 0 || responseData.data.award_gold > 0);
        // Text_GameName.transform.parent.gameObject.SetActive(true);
        // Text_GameName.text = gameName;

        if (responseData.data.award_gold <= 0 && responseData.data.hunter_award <= 0 && this.VerifyGoodsNullOrZero(responseData))
        {
            // FailText.gameObject.SetActive(true);
        }
        else
        {
            // if (shareSwitch)
            // {
            //     shareBtn.SetActive(true);
            // }
            // else
            // {
            //     shareBtn.SetActive(false);
            // }
            let awardTypeNum = 0;
            // if (responseData.data.award_gold > 0)
            // {
            //     awardTypeNum++;
            //     go = GetCreatePrefab(MemberExtraAward, AwardObj.transform);
            //     go.SetActive(true);
            //     SetItemData(go, responseData.data.award_gold, false, null, responseData);
            //     //BgHeight += 260;
            // }
            // if (responseData.data.hunter_award > 0)
            // {
            //     awardTypeNum++;
            //     go = GetCreatePrefab(AwardTrans, AwardObj.transform);
            //     go.SetActive(true);
            //     SetItemData(go, responseData.data.hunter_award, true, null, responseData);
            // }
            // if (responseData.data.award_goods != null)
            // {
            //     foreach (var item in responseData.data.award_goods)
            //     {
            //         if (awardTypeNum >= 3)
            //         {
            //             break;
            //         }
            //         go = GetCreatePrefab(AwardTrans, AwardObj.transform);
            //         go.SetActive(true);
            //         SetItemData(go, responseData.data.hunter_award, false, item, responseData);
            //         awardTypeNum++;
            //     }
            // }
            //SoundComponent.Instance.PlaySFX(SoundComponent.SFX_MTT_RANKING);
        }

        //RewardDetail.transform.GetComponent<RectTransform>().SetSizeWithCurrentAnchors(RectTransform.Axis.Vertical, BgHeight);
    }

    /// <summary>
    /// 判断奖励是否为空 为空返回false 
    /// </summary>
    /// <param name="responseData"></param>
    /// <returns></returns>
    VerifyGoodsNullOrZero(responseData)
    {
        if (responseData.data.award_goods == null)
        {
            return false;
        }
        else
        {
            if (responseData.data.award_goods.Count <= 0)
            {
                return false;
            }
            else
            {
                return true;
            }
        }
    }

    /// <summary>
    /// 设置各项奖励
    /// </summary>
    /// <param name="gameObject"></param>
    /// <param name="gold"></param>
    /// <param name="isHunter"></param>
    /// <param name="awardGoods"></param>
    SetItemData(gameObject, gold, isHunter, awardGoods, responseData)
    {

        if (awardGoods != null)
        {
            // propu_icon = gameObject.transform.Find("Award/Propul_icon").GetComponent<RawImage>();
            // propu_icon.gameObject.SetActive(false);
            // //MemberExtraAward.gameObject.SetActive(false);
            // Log.Debug($"{GlobalData.Instance.PropIconUrl}image-normal/prop-{awardGoods.i}.png");
            // WebImageHelper.SyncSetUrlImage(propu_icon, $"{GlobalData.Instance.PropIconUrl}image-normal/prop-{awardGoods.i}.png", isSuc =>
            // {

            //     if (!IsDisposed)
            //     {
            //         if (isSuc)
            //         {
            //             propu_icon.gameObject.SetActive(true);
            //         }
            //         else
            //         {
            //             propu_icon.gameObject.SetActive(false);
            //         }
            //     }
            // });//设置道具icon
            // gameObject.transform.Find("Award/Image").gameObject.SetActive(false);

            // gameObject.transform.Find("Award/Text_reward").GetComponent<Text>().text = UILoginModel.mInstance.GetRoomNameByKey(awardGoods.na);
            // gameObject.transform.Find("Award/Text_several").GetComponent<Text>().text = "X" + awardGoods.n;
        }
        else
        {
            if (isHunter)
            {
                // gameObject.transform.Find("Award/Text_reward").GetComponent<Text>().text = string.Format(LanguageManager.Get("MTT_end_Hunter_reward"), StringHelper.GetSignedLongString(gold));

                // gameObject.transform.Find("Award/Text_several").GetComponent<Text>().text = "";
                // gameObject.transform.Find("Award/Image/icon_name").GetComponent<Text>().text = LanguageManager.Get("UIMine_WalletSC001");
                // gameObject.transform.Find("Award/Image").gameObject.SetActive(true);
                // propu_icon.gameObject.SetActive(false);
            }
            else
            {
                // Transform MemberExtraAward = gameObject.transform; MemberExtraAward.gameObject.SetActive(false);
                // RawImage itemRIM = gameObject.transform.Find("itemImage").GetComponent<RawImage>(); itemRIM.gameObject.SetActive(false);
                // goldOBJ = gameObject.transform.Find("itemText").gameObject; goldOBJ.gameObject.SetActive(false);
                // plusOBJ = gameObject.transform.Find("plus").gameObject; plusOBJ.gameObject.SetActive(false);
                // RawImage itemRIM1 = gameObject.transform.Find("itemImage1")?.GetComponent<RawImage>(); if (itemRIM1) itemRIM1.gameObject.SetActive(false);
                // goldOBJ1 = gameObject.transform.Find("itemText1")?.gameObject; if (goldOBJ1) goldOBJ1.gameObject.SetActive(false);
                // plusOBJ1 = gameObject.transform.Find("plus1")?.gameObject; if (plusOBJ1) plusOBJ1.gameObject.SetActive(false);
                // RawImage rawImage2Use;
                // plus;
                // goldO;

                // MemberExtraAward.gameObject.SetActive(true);
                if (responseData.data.award_replace_prop_id >= 0)
                {//奖励金额大于等于物品金额,显示图片和剩余奖励
                    //Log.Error("展示图片和金钱" + $"{GlobalData.Instance.PropIconUrl}image-normal/prop-{responseData.data.award_replace_prop_id}.png");
                    // if (itemRIM1 != null)
                    // {
                    //     rawImage2Use = itemRIM1;
                    // }
                    // else
                    // {
                    //     itemRIM1 = rawImage2Use = GameObject.Instantiate(itemRIM, MemberExtraAward); itemRIM1.gameObject.name = itemRIM.name + "1";
                    //     // itemRIM
                    // }
                    // string url = $"{GlobalData.Instance.PropIconUrl}image-normal/prop-{responseData.data.award_replace_prop_id}.png";
                    // //url = url.Replace("dev","test");
                    // WebImageHelper.SetUrlImage(rawImage2Use, url);
                    // rawImage2Use.gameObject.SetActive(true);

                    // if (responseData.data.award_replace_remain > 0)
                    // {
                    //     if (!plusOBJ1)
                    //     {
                    //         plusOBJ1 = plus = GameObject.Instantiate(plusOBJ, MemberExtraAward); plus.gameObject.name = plusOBJ.name + "1";
                    //     }
                    //     else
                    //     {
                    //         plus = plusOBJ1;
                    //     }
                    //     plus.SetActive(true);
                    //     if (!goldOBJ1)
                    //     {
                    //         goldOBJ1 = goldO = GameObject.Instantiate(goldOBJ, MemberExtraAward); goldO.gameObject.name = goldOBJ.name + "1";
                    //     }
                    //     else
                    //     {
                    //         goldO = goldOBJ1;
                    //     }
                    //     goldO.SetActive(true);
                    //     goldO.transform.Find("num").GetComponent<Text>().text =(responseData.data.award_replace_remain/100.0f).ToString();
                    //     if (rawImage2Use.gameObject.activeSelf) rawImage2Use.transform.SetSiblingIndex(0);
                    //     if (plus.activeSelf) plus.transform.SetSiblingIndex(1);
                    //     if (goldO.activeSelf) goldO.transform.SetSiblingIndex(2);
                    // }
                }
                else
                {
                    // Log.Error("展示金钱");
                    // if (!goldOBJ1)
                    // {
                    //     goldOBJ1 = goldO = GameObject.Instantiate(goldOBJ, MemberExtraAward); goldO.gameObject.name = goldOBJ.name + "1";
                    // }
                    // else
                    // {
                    //     goldO = goldOBJ1;
                    // }
                    // goldO.SetActive(true);
                    // goldO.transform.Find("num").GetComponent<Text>().text = StringHelper.GetLongString(gold);
                }
                //gameObject.transform.Find("Award/Text_reward").GetComponent<Text>().text = string.Format(LanguageManager.Get("MTT_end_normal_reward"), StringHelper.GetSignedLongString(gold));
            }
        }
    }

    GetCreatePrefab(obj, pr)
    {
        // go = GameObject.Instantiate(obj, pr);
        // go.transform.localScale = Vector3.one;

        // return go;
    }

    /// <summary>
    /// 得到MTT比赛信息
    /// </summary>
    /// <param name="resultCallback"></param>
    GetMatchRoomsInfo(resultCallback)
    {
        let data = {"code":0,"data":{"alive":1,"more":{"ante":0,"bl":1,"nante":0,"nbl":2,"nsb":5000,"prize_pool":100,"sb":2500},"mtt":{"match_id":95756690,"name":"MTT202206181655524636341059","type":512,"game_type":0,"poker_type":0,"limit_bet_type":0,"rank_type":1,"enter_time":"2022-11-11T09:17:21Z","start_time":"2022-11-11T09:17:22Z","end_time":null,"hunter_on":0,"hunter_bonus":0,"partial_on":0,"parital_return_bl":0,"straddle_on":0,"straddle_max":0,"muck_on":0,"rooms":1,"max_room_id":1,"delay_view_card_on":0,"limit_min":2,"limit_delay_times":2,"limit_auto_check_times":2,"limit_auto_fold_times":2,"participants":2,"alive":1,"award_num":1,"money_sync":0,"status":1,"seat_count":9,"final_seat_count":0,"no_user_wait_duration":2,"initial_score":20000,"blindtable_type":0,"upblind_interval":120,"apply_start_time":"2022-11-11T07:16:13Z","op_duration":15,"max_delay_apply_bl":15,"rebuy_times":2,"max_rebuy_bl":15,"limit_total_buy_times":10000,"total_buy_times":2,"total_buyin_times":2,"total_rebuy_times":0,"addon_begin_bl":0,"addon_end_bl":0,"addon_score":0,"total_addon_times":0,"apply_fee_pool":0,"apply_fee_service":500,"apply_fee_hunter":0,"prize_type":1,"prize_base_pool":100,"tribe_id":1,"create_time":"2022-11-11T09:17:01Z","update_time":"2022-11-11T09:17:43Z","buy_prop_id":0,"prop_buy_type":0,"game_icon":"http://static.awanptesting.com/awanptesting-h5-dev/image-normal/20221111081310-mbPXa.png","voiceprint_verify_on":0,"voiceprint_verify_duration":0,"addonplus_m1_on":0,"addonplus_m1_max_times":0,"addonplus_m1_limit":0,"total_addonplus_m1_times":0,"addonplus_m2_on":0,"addonplus_m2_max_times":0,"addonplus_m2_max_bl":0,"total_addonplus_m2_times":0,"buy_ratio":1,"pre_buyin_bonus":0,"tablecloth_tag":"","limit_tag":"","bonustable_type":1,"buyin_free_times":0,"rebuy_free_times":0,"multi_ratio_free_times":0,"addon_free_times":0,"buyin_free_incl_svr":0,"rebuy_free_incl_svr":0,"multi_ratio_free_incl_svr":0,"addon_free_incl_svr":0,"award_replace_prop_id":0,"award_replace_prop_value":0,"award_extra_buy_times":0,"award_extra_add_count":0,"award_extra_prop_id":0,"award_extra_gold_value":0,"award_extra_gold_buy":0,"award_extra_ticket_buy":0,"award_extra_free_buy":0,"break_base_pool":0,"total_extra_buy_times":0,"award_extra_prop_value":0,"rebuy_ticket_limit_times":0,"addon_ticket_limit_times":0},"state":{"left_rebuy_times":2,"chip":0,"store":0,"init_score":20000,"partial_enable":false},"state_code":6,"top":40000}};
        this.MttInfo = data;
        resultCallback(data);


        // UIMatchMttModel.Instance.RequestMTTDetails(this.mineRankDate.matchId, code => {
        //     if (code == 0) {
        //         this.MttInfo = UIMatchMttModel.Instance.MttInfo;
        //     }
        //     else {
        //         // UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(code));
        //     }
        //     if (resultCallback) {
        //         resultCallback(code);
        //     }
        // }, httpState => {
        //     // UIComponent.Instance.Toast($"{nameof(HTTPRequestStates)}: {httpState}");
        // });
}

    /// <summary>
    /// 得到我的奖励
    /// </summary>
    GetMyawardApi()
    {
        let data = {"code":0,"data":{"uid":96855706,"rank":1,"award_gold":100,"award_goods":[],"hunter_award":0,"hunter_rank":0,"hunter_kill":0,"is_final":true,"awarded":true,"award_replace_prop_id":0,"award_replace_remain":0,"award_extra_prop_id":0,"award_extra_gold_value":0,"username":"Player","avatar":"http://static.awanptesting.com/image-normal/20220310094721-zdArt.png"}};
        this.isRequest = false;
        this.HandleRankDate(data);

        // Image_Mask.SetActive(true);
        // HttpRequest.Send({
        //     api: Web_Room_Center_Mtt_Myaward.API.replace("{id}", this.mineRankDate.matchId.toString()),
        //     request: Web_Room_Center_Mtt_Myaward,
        //     body: Web_Room_Center_Mtt_Myaward.Request({}),
        //     onSuccess: function () {
        //         let tResp = Web_Room_Center_Mtt_Myaward.Response;
        //         if (tResp.code == 0)
        //         {
        //             this.isRequest = false;
        //             this.HandleRankDate(tResp);
        //         }
        //         else
        //         {
                    
        //         }
        //     }.bind(this),
        //     onFailure: function (content) {
        //         if (this.RequestTimes > 0)
        //         {
        //             this.WaitText.active = true;
        //             if (this.MttInfo.more.bl >= this.MttInfo.mtt.max_rebuy_bl)
        //             {
        //                 if (this.RequestTimes > 5)
        //                 {
        //                     this.WaitText.string = i18nMgr.Get("Ranking_check");
        //                 }
        //                 else
        //                 {
        //                     this.WaitText.string = i18nMgr.Get("Ranking_patient");
        //                 }
        //             }
        //             else
        //             {
        //                 this.WaitText.string = i18nMgr.Get("UIMTT_Ranking_TiaoZheng");
        //             }
        //         }
        //         this.lastTime = TimeHelper.Now;
        //         this.isRequest = true;
        //     }.bind(this)
        // });
        
    }



    
    onCloseClick() {
        UIComponent.close(UIDefine.UIMTTMineRankComponent);
    }

}
