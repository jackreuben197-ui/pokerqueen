
import { UIType } from "./EIDefine";

export type UIDefineType = {
    UIType?: UIType,
    Name?: string,
    Bundle?: string,
    Path?: string,
    Title?: string,
}

export const UIDefine = {

    //预加载UI
    UIPreloadingComponent: {
        Name: "UIPreloadingComponent"
    },
    //GM界面
    UIGMComponent: {
        Name: "UIGMComponent"
    },
    /**
     *  场景
     */
    //登录场景
    LoginScene: {
        UIType: UIType.Scene,
        Name: "LoginScene",
        Bundle: null,
        Path: "login/scene/LoginScene"
    },
    //大厅场景
    LobbyScene: {
        UIType: UIType.Scene,
        Name: "LobbyScene",
        Bundle: null,
        Path: "main/lobby/LobbyScene"
    },
    //基础牌桌
    UITexas: {
        UIType: UIType.Scene,
        Name: "UITexas",
        Bundle: "texas",
        Path: "purple_prefab/scene/UITexas"
    },
    /**
     *  标题窗口
     */
    //标题模板(不使用)
    BaseForm: {
        UIType: UIType.Form,
        Name: "BaseForm",
        Bundle: null,
        Path: "login/form/BaseForm",
        Title: "BaseForm",
    },
    //语言
    LanguageForm: {
        UIType: UIType.Form,
        Name: "LanguageForm",
        Bundle: null,
        Path: "main/prefab/form/LanguageForm",
        Title: "UIMine_SettingLanguage",
    },
    //电话区号
    AreaCodeForm: {
        UIType: UIType.Form,
        Name: "AreaCodeForm",
        Bundle: null,
        Path: "login/form/AreaCodeForm",
        Title: "UILogin_Local",
    },
    //电话区号
    UserAgreeForm: {
        UIType: UIType.Form,
        Name: "UserAgreeForm",
        Bundle: null,
        Path: "login/form/UserAgreeForm",
        Title: "tc_5E0V3qlb",
    },
    //设置
    SettingsForm: {
        UIType: UIType.Form,
        Name: "SettingsForm",
        Bundle: null,
        Path: "main/lobby/prefab/UIMine_Setting",
        Title: "UIMine_btn_setting",
    },
    //设置-客服
    UIMine_Service: {
        UIType: UIType.Form,
        Name: "UIMine_Service",
        Bundle: null,
        Path: "main/lobby/prefab/UIMine_Service",
        Title: "UIMineMain01",
    },
    //工会-消息推送
    UIMsg_Send: {
        UIType: UIType.Form,
        Name: "UIMsg_Send",
        Bundle: null,
        Path: "main/lobby/prefab/UIMsg_Send",
        Title: "消息推送",
    },
    //公会消息
    UIMine_MessageList: {
        UIType: UIType.Form,
        Name: "UIMine_MessageList",
        Bundle: null,
        Path: "main/new_club/message/UIMine_MessageList",
        Title: "UIMine_MsgSummary",
    },
    //系统公会等消息
    UIMine_Message: {
        UIType: UIType.Form,
        Name: "UIMine_Message",
        Bundle: null,
        Path: "main/new_club/message/UIMine_Message",
        Title: "UIMine_MsgSummary",
    },
    //带入申请消息
    UIMsgIntoList: {
        UIType: UIType.Form,
        Name: "UIMsgIntoList",
        Bundle: null,
        Path: "main/new_club/message/UIMsgIntoList",
        Title: "UIClub_IntoApply",
    },
    //设置-玩家信息
    UIMine_PlayInfo: {
        UIType: UIType.Form,
        Name: "UIMine_PlayInfo",
        Bundle: null,
        Path: "main/lobby/prefab/UIMine_PlayInfo",
        Title: "玩家信息",
    },

    //设置-版本
    UIMine_SettingVersion: {
        UIType: UIType.Form,
        Name: "UIMine_SettingVersion",
        Bundle: null,
        Path: "main/lobby/prefab/UIMine_SettingVersion",
        Title: "UIMine_SettingVersion",
    },
    //设置-关于
    UIMine_About: {
        UIType: UIType.Form,
        Name: "UIMine_About",
        Bundle: null,
        Path: "main/lobby/prefab/UIMine_About",
        Title: "UIMine_SettingAboutus",
    },
    //公会-成员详细
    UIMember: {
        UIType: UIType.Form,
        Name: "UIMember",
        Bundle: null,
        Path: "main/lobby/prefab/record/UIMember",
        Title: "详细资料",
    },
    //战绩
    UIRecord: {
        UIType: UIType.Form,
        Name: "UIRecord",
        Bundle: null,
        Path: "main/lobby/prefab/record/UIRecord",
        Title: "UICareerRecord",
    },
    //成就
    UIMineArch: {
        UIType: UIType.Form,
        Name: "UIMineArch",
        Bundle: null,
        Path: "main/lobby/prefab/achi/UIMineArch",
        Title: "牌型成就",
    },
    //背包
    UIMineBag: {
        UIType: UIType.Form,
        Name: "UIMineBag",
        Bundle: null,
        Path: "main/lobby/prefab/bag/UIMineBag",
        Title: "UIMine_Backpack",
    },
    //门票
    UIBagTicket: {
        UIType: UIType.Form,
        Name: "UIBagTicket",
        Bundle: null,
        Path: "main/lobby/prefab/bag/UIBagTicket",
        Title: "",
    },
    // //战绩详情
    // UIRecordDetail: {
    //     UIType: UIType.Form,
    //     Name: "UIRecordDetail",
    //     Bundle: null,
    //     Path: "main/lobby/prefab/record/UIRecordDetail",
    //     Title: "",
    // },
    //本局牌谱
    UIRecordScore: {
        UIType: UIType.Form,
        Name: "UIRecordScore",
        Bundle: null,
        Path: "main/lobby/prefab/record/UIRecordScore",
        Title: "UIMine_RecordDetailForNormal_FENSVUz3",
    },
    //收藏牌谱
    UICollectScore: {
        UIType: UIType.Form,
        Name: "UICollectScore",
        Bundle: null,
        Path: "main/lobby/prefab/record/UICollectScore",
        Title: "收藏牌谱",
    },
    //带入申请
    UIRecordInto: {
        UIType: UIType.Form,
        Name: "UIRecordInto",
        Bundle: null,
        Path: "main/lobby/prefab/record/UIRecordInto",
        Title: "带入申请",
    },
    //保险详情
    UIRecordBXList: {
        UIType: UIType.Form,
        Name: "UIRecordBXList",
        Bundle: null,
        Path: "main/lobby/prefab/record/MttRecordBXListForm",
        Title: "",
    },
    //房间模版
    UIMatchPlayViewForm: {
        UIType: UIType.Form,
        Name: "UIMatchPlayViewForm",
        Bundle: null,
        Path: "main/lobby/prefab/matchView/UIMatchPlayViewForm"
    },

    UIMatchChessView: {
        UIType: UIType.CommonUI,
        Name: "UIMatchChessView",
        Bundle: null,
        Path: "main/lobby/prefab/matchView/UIMatchChessView"
    },

    UIMatchSportsView: {
        UIType: UIType.CommonUI,
        Name: "UIMatchSportsView",
        Bundle: null,
        Path: "main/lobby/prefab/matchView/UIMatchSportsView"
    },

    UIMatchGameView: {
        UIType: UIType.CommonUI,
        Name: "UIMatchGameView",
        Bundle: null,
        Path: "main/lobby/prefab/matchView/UIMatchGameView"
    },

    UIMatchRealityView: {
        UIType: UIType.CommonUI,
        Name: "UIMatchRealityView",
        Bundle: null,
        Path: "main/lobby/prefab/matchView/UIMatchRealityView"
    },

    UIMttSignDialogComponent: {
        UIType: UIType.CommonUI,
        Name: "UIMttSignDialogComponent",
        Bundle: null,
        Path: "main/mtt/detail/UIMttSignDialogComponent"
    },

    /**
     *  触摸板子（触摸黑色底板关闭）
     */
    //触摸板子模板(不使用)
    BaseTouchBoard: {
        UIType: UIType.Board,
        Name: "BaseTouchBoard",
        Bundle: null,
        Path: "main/prefab/board/BaseTouchBoard",

    },
    RightTouchBoard: {
        UIType: UIType.Board,
        Name: "RightTouchBoard",
        Bundle: null,
        Path: "main/prefab/board/RightTouchBoard",

    },

    /**
     * 确认取消 弹窗面板(默认触摸全屏可关闭)
     */
    UIDialogComponent: {
        UIType: UIType.Dialog,
        Name: "UIDialogComponent",
        Bundle: null,
        Path: "main/prefab/dialog/UIDialogComponent",
    },

    /**
    * 确认取消 弹窗面板(默认触摸全屏可关闭)
    */
    UIDialogEditComponent: {
        UIType: UIType.Dialog,
        Name: "UIDialogEditComponent",
        Bundle: null,
        Path: "main/prefab/dialog/UIDialogEditComponent",
    },
    /**
    * 确认取消 弹窗面板(默认触摸全屏可关闭)新版
    */
    UINewDialogComponent: {
        UIType: UIType.Dialog,
        Name: "UINewDialogComponent",
        Bundle: null,
        Path: "main/prefab/dialog/UINewDialogComponent",
    },


    UIPromptComponent: {
        UIType: UIType.Prompt,
        Name: "UIPromptComponent",
        Bundle: null,
        Path: "login/UIPromptComponent",
    },
    TexasPreLoad: {
        UIType: UIType.TexasPreLoad,
        Name: "TexasPreLoad",
        Bundle: null,
        Path: "main/prefab/component/TexasPreLoad",
    },
    UITexasSettingComponent: {
        UIType: UIType.CommonUI,
        Name: "UITexasSetting",
        Bundle: 'texas',
        Path: "prefab/widgetLayer/UITexasSetting",
    },
    UITexasRule: {
        UIType: UIType.CommonUI,
        Name: "UITexasRule",
        Bundle: 'texas',
        Path: "prefab/widgetLayer/UITexasRule",
    },
    UITexasReportComponent: {
        UIType: UIType.CommonUI,
        Name: "UITexasReport",
        Bundle: 'texas',
        Path: "prefab/widgetLayer/UITexasReport",
    },
    UITexasHistoryComponent: {
        UIType: UIType.CommonUI,
        Name: "UITexasHistory",
        Bundle: 'texas',
        Path: "prefab/widgetLayer/UITexasHistory",
    },
    UITexasGameEndComponent: {
        UIType: UIType.CommonUI,
        Name: "UITexasGameEndComponent",
        Bundle: 'texas',
        Path: "prefab/ui/UITexasGameEnd",
    },

    //房间模版
    UILaborPlayViewForm: {
        UIType: UIType.CommonUI,
        Name: "UILaborPlayViewForm",
        Bundle: null,
        Path: "main/prefab/UILaborPlayViewForm"
    },

    UITexasPlayerInfoComponent: {
        UIType: UIType.CommonUI,
        Name: "UITexasPlayerInfo",
        Bundle: 'texas',
        Path: "prefab/ui/UITexasPlayerInfo",
    },
    UITexasReportPlayerInfo: {
        UIType: UIType.CommonUI,
        Name: "UITexasReportPlayerInfo",
        Bundle: 'texas',
        Path: "prefab/widgetLayer/UITexasReportPlayerInfo",
    },

    UITexasInsuranceComponent: {
        UIType: UIType.CommonUI,
        Name: "UITexasInsuranceComponent",
        Bundle: 'texas',
        Path: "prefab/ui/UITexasInsurance",
    },



    UIlaborMerberManager: {
        UIType: UIType.Form,
        Name: "UIlaborMerberManager",
        Bundle: null,
        Path: "main/club/UIlaborMerberManager",
    },
    UIlaborExaminatMerber: {
        UIType: UIType.Form,
        Name: "UIlaborExaminatMerber",
        Bundle: null,
        Path: "main/club/UIlaborExaminatMerber",
    },

    UIClubLevel: {
        UIType: UIType.Form,
        Name: "UIClubLevel",
        Bundle: null,
        Path: "main/club/UIClubLevel",
    },
    UIClubEdit: {
        UIType: UIType.Form,
        Name: "UIClubEdit",
        Bundle: null,
        Path: "main/new_club/lookClub/UIClubEdit",
    },
    // MyWalletForm: {
    //     UIType: UIType.Form,
    //     Name: "MyWalletForm",
    //     Bundle: null,
    //     Path: "main/wallet/MyWalletForm",
    // },

    //钱包主界面
    UIWallet: {
        UIType: UIType.Form,
        Name: "UIWallet",
        Bundle: null,
        Path: "main/new_club/wallet/UIWallet",
        //Title: "UIMine_WalletMy",
    },
    //跳转充值页面
    UIToRecharge: {
        UIType: UIType.Form,
        Name: "UIToRecharge",
        Bundle: null,
        Path: "main/new_club/wallet/UIToRecharge",
        Title: "UIGuildFund_RechargeText",
    },
    //豆充值页面
    UIRecharge: {
        UIType: UIType.Form,
        Name: "UIRecharge",
        Bundle: null,
        Path: "main/new_club/wallet/UIRecharge",
        Title: "UIGuildFund_RechargeText",
    },
    //豆转换界面
    UIExchange: {
        UIType: UIType.Form,
        Name: "UIExchange",
        Bundle: null,
        Path: "main/new_club/wallet/UIExchange",
        Title: "UIGuildFund_ExchangeText",
    },

    // WalletJumpForm: {
    //     UIType: UIType.Form,
    //     Name: "WalletJumpForm",
    //     Bundle: null,
    //     Path: "main/wallet/WalletJumpForm",
    // },

    GoldOprationForm: {
        UIType: UIType.Form,
        Name: "GoldOprationForm",
        Bundle: null,
        Path: "main/wallet/GoldOprationForm",
    },

    UICreateMatchHome: {
        UIType: UIType.Form,
        Name: "UICreateMatchHome",
        Bundle: null,
        Path: "main/club/UICreateMatchHome",
    },

    UICreateMatch: {
        UIType: UIType.Form,
        Name: "UICreateMatch",
        Bundle: null,
        Path: "main/club/UICreateMatch",
    },

    LookRateListDlg: {
        UIType: UIType.CommonUI,
        Name: "LookRateListDlg",
        Bundle: null,
        Path: "main/wallet/rate/LookRateListDlg",
    },
    RateManagerListForm: {
        UIType: UIType.Form,
        Name: "RateManagerListForm",
        Bundle: null,
        Path: "main/wallet/rate/RateManagerListForm",
    },
    EditRateForm: {
        UIType: UIType.Form,
        Name: "EditRateForm",
        Bundle: null,
        Path: "main/wallet/rate/EditRateForm",
    },
    OrderRecordsForm: {
        UIType: UIType.Form,
        Name: "OrderRecordsForm",
        Bundle: null,
        Path: "main/wallet/record/OrderRecordsForm",
        Title: "Text_RecordLine"
    },
    GoldIssueListForm: {
        UIType: UIType.Form,
        Name: "GoldIssueListForm",
        Bundle: null,
        Path: "main/wallet/issue/GoldIssueListForm",
    },
    OrderApplyForm: {
        UIType: UIType.Form,
        Name: "OrderApplyForm",
        Bundle: null,
        Path: "main/wallet/apply/OrderApplyForm",
    },

    MttListForm: {
        UIType: UIType.Form,
        Name: "MttListForm",
        Bundle: null,
        Path: "main/mtt/MttListForm",
    },
    MttDetailForm: {
        UIType: UIType.Form,
        Name: "MttDetailForm",
        Bundle: null,
        Path: "main/mtt/detail/MttDetailForm",
    },
    MttRealTime: {
        UIType: UIType.CommonUI,
        Name: "MttRealTime",
        Bundle: null,
        Path: "main/mtt/realTime/MttRealTime",
    },
    UIApplyJoin: {
        UIType: UIType.Form,
        Name: "UIApplyJoin",
        Bundle: null,
        Path: "main/club/UIApplyJoin",
    },
    UIAuditAdmin: {
        UIType: UIType.Form,
        Name: "UIAuditAdmin",
        Bundle: null,
        Path: "main/club/UIAuditAdmin",
    },
    UIAddAdmin: {
        UIType: UIType.Form,
        Name: "UIAddAdmin",
        Bundle: null,
        Path: "main/club/UIAddAdmin",
    },
    UIActiveMange: {
        UIType: UIType.Form,
        Name: "UIActiveMange",
        Bundle: null,
        Path: "main/club/UIActiveMange",
    },
    UIClubDataMange: {
        UIType: UIType.Form,
        Name: "UIClubDataMange",
        Bundle: null,
        Path: "main/new_club/dataManger/UIClubDataMange",
    },

    UICalendar: {
        UIType: UIType.Board,
        Name: "UICalendar",
        Bundle: null,
        Path: "main/club/prefab/UICalendar",
    },
    UIMine_SafeAdmin: {
        UIType: UIType.Form,
        Name: "UIMine_SafeAdmin",
        Bundle: null,
        Path: "main/lobby/prefab/UIMine_SafeAdmin",
        Title: "UIMine_SafeAdmin"
    },
    UIMine_bindMess: {
        UIType: UIType.Form,
        Name: "UIMine_bindMess",
        Bundle: null,
        Path: "main/lobby/prefab/UIMine_bindMess",
    },
    UIMineChangeBind: {
        UIType: UIType.Form,
        Name: "UIMineChangeBind",
        Bundle: null,
        Path: "main/lobby/prefab/UIMineChangeBind",
    },

    UIMineThridBind: {
        UIType: UIType.Form,
        Name: "UIMineThridBind",
        Bundle: null,
        Path: "main/lobby/prefab/UIMineThridBind",
    },
    //比赛结算等级
    UIMTTMineRankComponent: {
        UIType: UIType.CommonUI,
        Name: "UIMTTMineRankComponent",
        Bundle: 'texas',
        Path: "prefab/ui/UIMTTMineRankComponent",
    },
    //成员管理
    UIClubMerberManager: {
        UIType: UIType.Form,
        Name: "UIClubMerberManager",
        Bundle: null,
        Path: "main/new_club/memberAdmin/UIClubMerberManager",
    },
    //俱乐部主页
    UIClubHome: {
        UIType: UIType.Form,
        Name: "UIClubHome",
        Bundle: null,
        Path: "main/new_club/clubList/UIClubHome",
    },
    //公会-成员详细
    UIClubMember: {
        UIType: UIType.Form,
        Name: "UIClubMember",
        Bundle: null,
        Path: "main/new_club/memberAdmin/UIClubMember",
    },
    //创建比赛选择
    UIClubCreateMatchHome: {
        UIType: UIType.Form,
        Name: "UIClubCreateMatchHome",
        Bundle: null,
        Path: "main/new_club/createMatch/UIClubCreateMatchHome",
    },
    //创建比赛
    UIClubCreateMatch: {
        UIType: UIType.Form,
        Name: "UIClubCreateMatch",
        Bundle: null,
        Path: "main/new_club/createMatch/UIClubCreateMatch",
    },
    //排座列表管理
    UIMatchView: {
        UIType: UIType.CommonUI,
        Name: "UIMatchView",
        Bundle: null,
        Path: "main/new_club/createMatch/UIMatchView"
    },
    //俱乐部升级
    UIClubUpLevel: {
        UIType: UIType.Form,
        Name: "UIClubUpLevel",
        Bundle: null,
        Path: "main/new_club/upLevel/UIClubUpLevel",
    },
    //汇率设置
    UIClubRateSet: {
        UIType: UIType.Form,
        Name: "UIClubRateSet",
        Bundle: null,
        Path: "main/new_club/rateSet/UIClubRateSet",
    },
    //活动推送
    UIClubActive: {
        UIType: UIType.Form,
        Name: "UIClubActive",
        Bundle: null,
        Path: "main/new_club/active/UIClubActive",
    },
    //活动弹窗
    UIClubActiveBord: {
        UIType: UIType.Board,
        Name: "UIClubActiveBord",
        Bundle: null,
        Path: "main/new_club/active/UIClubActiveBord",
    },
    //共享牌局
    UIClubShareMatch: {
        UIType: UIType.Form,
        Name: "UIClubShareMatch",
        Bundle: null,
        Path: "main/new_club/shareMatch/UIClubShareMatch",
    },
    //创建俱乐部
    UICreatelabor: {
        UIType: UIType.Form,
        Name: "UICreatelabor",
        Bundle: null,
        Path: "main/new_club/createClub/UICreatelabor",
    },
    //加入俱乐部
    UIlaborJoin: {
        UIType: UIType.Form,
        Name: "UIlaborJoin",
        Bundle: null,
        Path: "main/new_club/createClub/UIlaborJoin",
    },
    //加入联盟
    UIJoinUnion: {
        UIType: UIType.Form,
        Name: "UIJoinUnion",
        Bundle: null,
        Path: "main/new_club/createClub/UIJoinUnion",
    },
    //确认加入联盟
    UISearchJoin: {
        UIType: UIType.Form,
        Name: "UISearchJoin",
        Bundle: null,
        Path: "main/new_club/createClub/UISearchJoin",
    },

    UIPlayerLookLabor: {
        UIType: UIType.Form,
        Name: "UIPlayerLookLabor",
        Bundle: null,
        Path: "main/new_club/lookClub/UIPlayerLookLabor",
    },
    UIManageLabor: {
        UIType: UIType.Form,
        Name: "UIManageLabor",
        Bundle: null,
        Path: "main/new_club/lookClub/UIManageLabor",
    },




    /////////////////////////////////////////
    //公会贵宾详情统计
    UIClubVipStatistics: {
        UIType: UIType.Form,
        Name: "UIClubVipStatistics",
        Bundle: null,
        Path: "main/new_club/vip/UIClubVipStatistics",
        Title: "UIGuild_MemberDetails_VipCount"
    },
    //绑定贵宾
    UIAgentLink: {
        UIType: UIType.CommonUI,
        Name: "UIAgentLink",
        Bundle: null,
        Path: "main/new_club/vip/link/UIAgentLink",
    },
    //解绑贵宾
    UIAgentUnlink: {
        UIType: UIType.CommonUI,
        Name: "UIAgentUnlink",
        Bundle: null,
        Path: "main/new_club/vip/link/UIAgentUnlink",
    },

    //公会贵宾的线下管理
    UIClubVipOffline: {
        UIType: UIType.CommonUI,
        Name: "UIClubVipOffline",
        Bundle: null,
        Path: "main/new_club/vip/UIClubVipOffline",
        Title: "UIGuild_MemberDetails_VipManager"
    },

    //贵宾管理
    UIClubVipManage: {
        UIType: UIType.Form,
        Name: "UIClubVipManage",
        Bundle: null,
        Path: "main/new_club/vip/UIClubVipManage",
        Title: "贵宾管理"
    },
    //贵宾打开的成员详细资料
    UIClubVipMemberDetail: {
        UIType: UIType.Form,
        Name: "UIClubVipMemberDetail",
        Bundle: null,
        Path: "main/new_club/vip/UIClubVipMemberDetail",
        Title: "详细资料"
    },
    //贵宾的成员管理
    UIClubVipMemberManage: {
        UIType: UIType.Form,
        Name: "UIClubVipMemberManage",
        Bundle: null,
        Path: "main/new_club/vip/UIClubVipMemberManage",
        Title: "成员管理"
    },

    //mtt支付列表
    MttPayforList: {
        UIType: UIType.Form,
        Name: "MttPayforList",
        Bundle: null,
        Path: "main/mtt/detail/MttPayforList",
    },

    MttPayforHome: {
        UIType: UIType.Form,
        Name: "MttPayforHome",
        Bundle: null,
        Path: "main/mtt/detail/MttPayforHome",
    },

    MttAgainBuy: {
        UIType: UIType.Form,
        Name: "MttAgainBuy",
        Bundle: null,
        Path: "main/mtt/detail/MttAgainBuy",
    },

    /////////////////
    //通用提示面板
    UICommonDialog: {
        UIType: UIType.CommonUI,
        Name: "UICommonDialog",
        Bundle: null,
        Path: "main/prefab/dialog/UICommonDialog",
    },

    //标题通用提示面板
    UISuperDialog: {
        UIType: UIType.CommonUI,
        Name: "UISuperDialog",
        Bundle: null,
        Path: "main/prefab/dialog/UISuperDialog",
    },
    //密码输入提示面板
    UIPasswordDialog: {
        UIType: UIType.CommonUI,
        Name: "UIPasswordDialog",
        Bundle: null,
        Path: "main/prefab/dialog/UIPasswordDialog",
    },
    //背包提示面板
    UIBackDialog: {
        UIType: UIType.CommonUI,
        Name: "UIBackDialog",
        Bundle: null,
        Path: "main/prefab/dialog/UIBackDialog",
    },
    //公会钱包列表
    UIClubWalletList: {
        UIType: UIType.CommonUI,
        Name: "UIClubWalletList",
        Bundle: "texas",
        Path: "purple_prefab/ui/UIClubWalletList",
    },

    //新版下拉框
    dropDownBoxNew: {
        UIType: UIType.Board,
        Name: "dropDownBoxNew",
        Bundle: null,
        Path: "common/dropDownBoxNew",
    },
    //战绩
    UICareerRecord: {
        UIType: UIType.Form,
        Name: "UICareerRecord",
        Bundle: null,
        Path: "main/career/UICareerRecord",
        Title: "UICareerRecord"
    },
    //战绩详情
    UIRecordDetail: {
        UIType: UIType.Form,
        Name: "UIRecordDetail",
        Bundle: null,
        Path: "main/career/UIRecordDetail",
        Title: "战绩详情"
    },
    //牌谱列表
    UIRecordHands: {
        UIType: UIType.Form,
        Name: "UIRecordHands",
        Bundle: null,
        Path: "main/career/UIRecordHands",
        Title: "牌谱"
    },
    //牌谱详情
    UIMine_Poker: {
        UIType: UIType.Form,
        Name: "UIMine_Poker",
        Bundle: null,
        Path: "main/career/UIMine_Poker",
        Title: "牌谱详情",
    },
    //战绩详情
    UIMttRecordDetail: {
        UIType: UIType.Form,
        Name: "UIMttRecordDetail",
        Bundle: null,
        Path: "main/career/UIMttRecordDetail",
        Title: "战绩详情"
    },

    //编辑资料-new
    UIEditInformation: {
        UIType: UIType.Form,
        Name: "UIEditInformation",
        Bundle: null,
        Path: "main/lobby/me/UIEditInformation",
        Title: "UIMine_UserInfoSetting_title"
    },
    //修改昵称-new
    UIChangeName: {
        UIType: UIType.Form,
        Name: "UIChangeName",
        Bundle: null,
        Path: "main/lobby/me/UIChangeName",
        Title: "UIMine_Mission_8"
    },
    //钻石商城-new
    UIMall: {
        UIType: UIType.Form,
        Name: "UIMall",
        Bundle: null,
        Path: "main/lobby/me/UIMall",
        Title: "UIHappyShop_ActivityShop"
    },
    //我的背包-new
    UIMyPack: {
        UIType: UIType.Form,
        Name: "UIMyPack",
        Bundle: null,
        Path: "main/lobby/me/UIMyPack",
        Title: "UIMine_Backpack"
    },
    //我的消息
    UIMyMessage: {
        UIType: UIType.Form,
        Name: "UIMyMessage",
        Bundle: null,
        Path: "main/lobby/message/UIMyMessage",
        Title: "UIMine_MsgSummary"
    },
    //我的设置
    UIMeSettings: {
        UIType: UIType.Form,
        Name: "UIMeSettings",
        Bundle: null,
        Path: "main/lobby/me/UIMeSettings",
        Title: "UIMine_Setting"
    },
    //重置密码
    UIResetPassword:
    {
        UIType: UIType.Form,
        Name: "UIResetPassword",
        Bundle: null,
        Path: "main/lobby/me/UIResetPassword",
        Title: "UIMine_SettingPassword"
    },
    //關於我們
    UIAboutus: {
        UIType: UIType.Form,
        Name: "UIAboutus",
        Bundle: null,
        Path: "main/lobby/me/UIAboutus",
        Title: "tc_YQAGnw3p"
    },
    //版本号
    UIVersion: {
        UIType: UIType.Form,
        Name: "UIVersion",
        Bundle: null,
        Path: "main/lobby/me/UIVersion",
        Title: "tc_NO5NT6aa"
    },
    //语言
    UILanguage: {
        UIType: UIType.Form,
        Name: "UILanguage",
        Bundle: null,
        Path: "main/lobby/me/UILanguage",
        Title: "tc_PpNL8LVJ"
    },
    //问题反馈
    UIReport: {
        UIType: UIType.Form,
        Name: "UILaUIReportnguage",
        Bundle: null,
        Path: "main/lobby/me/UIReport",
        Title: "tc_wV5t3xsr"
    },
    //webview通用面板
    UIWebCommon:
    {
        UIType: UIType.Form,
        Name: "UIWebCommon",
        Bundle: null,
        Path: "main/lobby/me/UIWebCommon",
    },

    //系统消息面板
    UIMsgSystem: {
        UIType: UIType.Form,
        Name: "UIMsgSystem",
        Bundle: null,
        Path: "main/lobby/message/UIMsgSystem",
    },
    //带入申请列表
    UIMsgBring: {
        UIType: UIType.Form,
        Name: "UIMsgBring",
        Bundle: null,
        Path: "main/lobby/message/UIMsgBring",
    },
    //下方条目选择器
    UIDownSelector: {
        UIType: UIType.CommonUI,
        Name: "UIDownSelector",
        Bundle: null,
        Path: "main/prefab/component/UIDownSelector",
    },
    //键盘
    UIKeyNode: {
        UIType: UIType.Board,
        Name: "UIKeyNode",
        Bundle: null,
        Path: "main/new_club/createMatch/UIKeyNode",
    },
    UIClubList: {
        UIType: UIType.CommonUI,
        Name: "UIClubList",
        Bundle: null,
        Path: "main/lobby/prefab/UIClubList",
    },
    UIEditMess: {
        UIType: UIType.CommonUI,
        Name: "UIEditMess",
        Bundle: '',
        Path: "login/form/UIEditMess",
    },



}
//批量设置
cc.game.on(cc.game.EVENT_GAME_INITED, () => {
    for (const key in UIDefine) {
        let constructor = cc.js.getClassByName(key);
        if (constructor) constructor['UIDefine'] = UIDefine[key];
    }
});

(window as any).UIDefine = UIDefine;