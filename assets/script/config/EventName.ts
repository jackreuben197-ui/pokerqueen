export const enum EventName {
    serverResponse = "serverResponse",

    matchModelChange = "matchModelChange",
    myGoldChange = "myGoldChange", // 更新个人金币
    curSelectRateChange = "curSelectRateChange", //点前选择的汇率变化
    addRateItem = "addRateItem",    //添加汇率

    updateChessView = "updateChessView", //刷新牌桌列表
    updateFriendChessView = "updateFriendChessView", //刷新朋友牌桌列表
}