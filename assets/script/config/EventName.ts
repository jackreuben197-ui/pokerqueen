export const enum EventName {
    serverResponse = "serverResponse",

    matchModelChange = "matchModelChange",
    myGoldChange = "myGoldChange", // 更新个人金币
    curSelectRateChange = "curSelectRateChange", //点前选择的汇率变化
    addRateItem = "addRateItem",    //添加汇率

    clubGoldChange = "clubGoldChange", //联盟金币变化

    updateChessView = "updateChessView", //刷新牌桌列表

    orderApplyItemChange = "orderApplyItemChange", //订单申请变化
}