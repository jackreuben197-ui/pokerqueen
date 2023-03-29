/*
 * @Author: xfj
 * @Date: 2022-10-24 16:03:27
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-03-29 16:44:21
 * @FilePath: /pokerqueen/assets/script/config/EventName.ts
 */
export const enum EventName {
    serverResponse = "serverResponse",

    switchLanguages = "switchLanguages",

    matchModelChange = "matchModelChange",
    myGoldChange = "myGoldChange", // 更新个人金币
    curSelectRateChange = "curSelectRateChange", //点前选择的汇率变化
    addRateItem = "addRateItem",    //添加汇率

    clubGoldChange = "clubGoldChange", //联盟金币变化

    updateChessView = "updateChessView", //刷新牌桌列表
    updateFriendChessView = "updateFriendChessView", //刷新朋友牌桌列表

    orderApplyItemChange = "orderApplyItemChange", //订单申请变化
    updateFrendApplyList = "updateFrendApplyList", //更新申请列表
    adminChange = 'adminChange',//  管理员改变
    reFreshApplyState = 'reFreshApplyState',//刷新按钮状态
    refreshAdmin = 'refreshAdmin',//添加管理员
    refreshActive = 'refreshActive',//刷新活动
    refresh_Btn_Data = 'refresh_Btn_Data',//
    refresh_bind = 'refresh_bind',//
    // refreshClubLevel = 'refreshClubLevel', 
    refreshMess = 'refreshMess',  //刷新信息
    refreshLobby = 'refreshLobby',
    refresh_vip_ui = 'refresh_vip_ui',//刷新成员贵宾ui

    //new_club
    refreshClubData = 'refreshClubData',
    requestClubMemList = 'requestClubMemList',
    refreshClubTitle = 'refreshClubTitle',
    refreshShareMatch = 'refreshShareMatch',
    selectMttWwllet = 'selectMttWwllet',  //选择钱包
    refreshApplyList = 'refreshApplyList', //加入俱乐部或者加入联盟
    refreshClubList = 'refreshClubList',  //刷新俱乐部列表
    refreshUserData = 'refreshUserData', //刷新玩家信息

}