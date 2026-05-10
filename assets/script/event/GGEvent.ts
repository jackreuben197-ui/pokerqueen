/**
 * 消息名称
 */
export default class GGEvent {
    //改变电话区号
    static Change_AreaCode: string = 'Change_AreaCode';
    //修改语言
    static CHANGE_LAUNCH: string = 'change_launch';
    //刷新个人信息
    static Refresh_UserInfo: string = 'Refresh_UserInfo';
    //刷新个人头像
    static Refresh_UserHead: string = 'Refresh_UserHead';
    //刷新个人昵称
    static Refresh_UserName: string = 'Refresh_UserName';
    //删除公会成员
    static CLUB_DELE_USER: string = 'CLUB_DELE_USER';
    //收藏牌谱更新
    static UPD_CARD_SCORE: string = 'UPD_CARD_SCORE';
    //二套牌同意刷新
    static AgreeSecondPcsRefresh: string = 'AgreeSecondPcsRefresh';
    //刷新未读消息
    static Refresh_Unread: string = 'Refresh_Unread';
    //刷新申请带入提示
    static Apply_Refresh_MsgNum: string = 'Apply_Refresh_MsgNum';
}
