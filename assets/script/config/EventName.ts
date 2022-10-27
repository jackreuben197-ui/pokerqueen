/*
 * @Author: xfj
 * @Date: 2022-10-24 16:03:27
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-27 15:34:25
 * @FilePath: /pokerqueen/assets/script/config/EventName.ts
 */
export const enum EventName {
    serverResponse = "serverResponse",

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

}