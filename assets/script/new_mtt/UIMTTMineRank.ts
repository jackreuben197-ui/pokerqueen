import { UIDefine } from "../define/UIDefine";
import { GameCache } from "../game/GameCache";
import { StringHelper } from "../helper/StringHelper";
import TimeHelper from "../helper/TimeHelper";
import WebImageHelper from "../helper/WebImageHelper";
import { i18nMgr } from "../i18n/i18nMgr";
import { WWW, Web_Room_Center_Mtt_Details, Web_Room_Center_Mtt_Myaward } from "../net/https/WebRequest";
import UIShareModel from "../share/UIShareModel";
import UIBasePlus from "../ui/UIBasePlus";
import UIComponent from "../ui/UIComponent";
import { UIMTTModel } from "./UIMTTModel";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMTTMineRank extends UIBasePlus {

    $award_ui: cc.Node = null; // 奖励ui界面
    cc_Label$waiting: cc.Label = null;
    cc_Sprite$head: cc.Sprite = null;
    cc_Label$name: cc.Label = null;
    cc_Label$time: cc.Label = null;
    $haveRewardColor: cc.Node = null;//彩色烟花
    $win: cc.Node = null;//胜利奖杯
    $lost: cc.Node = null;//失败奖杯
    cc_Label$rank: cc.Label = null;//排名文本
    cc_Label$game_name: cc.Label = null;//比赛名称
    $award_node: cc.Node = null;//奖励节点
    cc_Label$fail: cc.Label = null;//失败文本
    $btn_share: cc.Node = null;//分享按钮
    $pool_reward: cc.Node = null;//普通奖励
    $hunter_reward: cc.Node = null;//猎人奖励

    $btn_close: cc.Node = null;//关闭按钮
    ///////////////////////////////////////

    shareSwitch: boolean = false;//分享按钮  false关闭 true打开
    gameName: string;
    //{matchId,matchName,isRebuy}D
    mineRankDate: any;
    MttInfo: any;

    private isRequest = false;
    private lastTime = 0;
    private IntervalTime = 3;
    private RequestTimes = 0;

    protected update(dt: number): void {
        if (this.RequestTimes > 5) {
            return;
        }
        if (!this.isRequest) {
            return;
        }
        if (TimeHelper.NowS - this.lastTime < this.IntervalTime) {
            return;
        }
        this.lastTime = TimeHelper.NowS;
        this.RequestTimes++;
        this.GetMyawardApi();
    }

    onShow(param: any): void {

        this.reset();


        UIShareModel.Instance.APIShareUsable(UIShareModel.Instance.SHARE_TYPE_MTT, res => {//邀请玩家分享开关

            this.shareSwitch = false;
            //res.data.usable; 分享暂时未开发

            if (null != param) {
                //MineRankData data = obj as MineRankData;
                //if (null != data) {
                this.mineRankDate = param;
                //Text_GameName.text = mineRankDate.matchName;
                this.gameName = param.matchName;
                this.InitDefaultUI();
                this.InitUIData();
                //}
            }

        });
    }
    protected regiterTouchEvents(): void {
        this.setButtonClick(this.$btn_close, this.close)
    }

    reset(): void {
        this.lastTime = 0;
        this.isRequest = false;
        this.RequestTimes = 0;

        this.$award_ui.active = false;
        this.cc_Label$waiting.node.active = false;


        this.cc_Label$fail.node.active = false;
        this.$pool_reward.active = false;
        this.$hunter_reward.active = false;
        this.$haveRewardColor.active = false;
    }


    // 初始化UI
    private InitDefaultUI() {
        this.cc_Label$waiting.node.active = true;
        this.cc_Label$waiting.string = i18nMgr.Get("UIMTTWaitforend");
    }
    // 初始化数据
    private InitUIData() {
        this.GetMatchRoomsInfo(() => {

            WebImageHelper.SetHeadImage(this.cc_Sprite$head, GameCache.Instance.headPic);
            this.cc_Label$name.string = GameCache.Instance.nick;
            this.cc_Label$time.string = TimeHelper.TransformUTC(this.MttInfo.mtt.start_time);
            //是否取消rebuy，
            if (this.mineRankDate.isRebuy) {
                //若是当前盲注大于最大盲注级别，不能重购，请求排名
                if (this.MttInfo.more.bl >= this.MttInfo.mtt.max_rebuy_bl) {
                    this.GetMyawardApi();
                }
                else {
                    this.close();
                }
            }
            else {
                this.GetMyawardApi();
            }
        });
    }
    private GetMatchRoomsInfo(resultCallback: Function) {
        WWW.Instance.CommonAPI(
            {
                web_class: Web_Room_Center_Mtt_Details,
                api_id: this.mineRankDate.matchId
            }
        ).then(
            (res: any) => {
                this.MttInfo = res.data;
                resultCallback();
            },
            () => {

            }
        );
    }

    // 得到我的奖励
    private GetMyawardApi() {

        WWW.Instance.CommonAPI(
            {
                web_class: Web_Room_Center_Mtt_Myaward,
                api_id: this.mineRankDate.matchId
            }
        ).then(
            (res: any) => {
                this.isRequest = false;
                this.HandleRankDate(res);
            },
            () => {
                if (this.RequestTimes > 0) {
                    this.cc_Label$waiting.node.active = true;
                    if (this.MttInfo.more.bl >= this.MttInfo.mtt.max_rebuy_bl) {
                        if (this.RequestTimes > 5) {

                            this.cc_Label$waiting.node.active = false;

                            this.$haveRewardColor.active = false;

                            this.$win.active = false;
                            this.$lost.active = true;

                            this.cc_Label$rank.node.active = false;

                            this.cc_Label$game_name.string = this.gameName;

                            this.$award_node.active = false;

                            this.cc_Label$fail.node.active = true;

                            this.$btn_share.active = this.shareSwitch;

                            this.$award_ui.active = true;
                        }
                        else {
                            this.cc_Label$waiting.string = i18nMgr.Get("Ranking_check");
                        }
                    }
                    else {
                        this.cc_Label$waiting.string = i18nMgr.Get("UIMTT_Ranking_TiaoZheng");
                    }
                }
                this.lastTime = TimeHelper.NowS;
                this.isRequest = true;

            }
        );
    }

    //处理排名相关
    private HandleRankDate(res: any) {
        // if (IsDisposed) {
        //     return;
        // }

        this.HandleAwardDataNew(res);
        //this.ShowVoiceprint();

        this.$award_ui.active = true;
    }

    // 处理奖励
    private HandleAwardDataNew(res: any) {

        let isHaveReward = res.data.award_gold > 0 || res.data.award_gold > 0;

        this.cc_Label$waiting.node.active = false;

        this.$haveRewardColor.active = isHaveReward;

        this.$win.active = isHaveReward;
        this.$lost.active = isHaveReward;

        //设置排名文本
        if (res.data.is_final) {
            this.cc_Label$rank.node.active = true;
            this.cc_Label$rank.string = StringHelper.Format(i18nMgr.Get("MTT_end_rank"), [`${res.data.rank}/${UIMTTModel.Instance.MttInfo.mtt.participants}`]);
        }
        else {
            this.cc_Label$rank.node.active = false;
        }
        this.cc_Label$game_name.string = this.gameName;

        this.$award_node.active = isHaveReward;

        this.cc_Label$fail.node.active = !isHaveReward;


        this.$btn_share.active = this.shareSwitch;

        //$pool_reward: cc.Node = null;//普通奖励
        // $hunter_reward: cc.Node = null;//猎人奖励

        if (res.data.award_gold <= 0 && res.data.hunter_award <= 0) {
            this.cc_Label$fail.node.active = true;
        }
        else {
            if (res.data.award_gold > 0) {
                this.$pool_reward.active = true;

                this.setChildVisible(this.$pool_reward, "uc", this.MttInfo.mtt.gold_type == 1);
                this.setChildVisible(this.$pool_reward, "gc", this.MttInfo.mtt.gold_type == 2);
                this.setChildVisible(this.$pool_reward, "dc", this.MttInfo.mtt.gold_type == 4);
                this.setChildLabel(this.$pool_reward, "label_coin", StringHelper.GetSignedLongString(res.data.award_gold));
            }
            if (res.data.hunter_award > 0) {

                this.$hunter_reward.active = true;

                this.setChildVisible(this.$hunter_reward, "uc", this.MttInfo.mtt.gold_type == 1);
                this.setChildVisible(this.$hunter_reward, "gc", this.MttInfo.mtt.gold_type == 2);
                this.setChildVisible(this.$hunter_reward, "dc", this.MttInfo.mtt.gold_type == 4);
                this.setChildLabel(this.$hunter_reward, "label_coin", StringHelper.GetSignedLongString(res.data.hunter_award));


            }
        }

        //RewardDetail.transform.GetComponent<RectTransform>().SetSizeWithCurrentAnchors(RectTransform.Axis.Vertical, BgHeight);
    }

    close() {
        UIComponent.close(UIDefine.UIMTTMineRank);
    }
}
