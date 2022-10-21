

export enum EOrderType {
    chongzhi = 1,
    tiqu = 2,
    fafang = 3
}

export enum EOrderOprationStatus {
    agree = 1,
    refused = 2
}

export enum EApplyStatus {
    ing = 1, //-申请中,
    agree = 2, //-同意,
    refused = 3, //-拒绝,
    cancel = 4, //-取消申请）
}

export enum EMttItemStatus {
    create = 0,// 创建，
    run = 1,// 运行，
    end = 2,// 结束，
    cancel = 3,// 取消

    // 游戏状态 0 = 可报名 1 = 等待开赛 2 = 延迟报名 3 = 进行中 4 = 立即进入 5 = 报名截止 6 = 等待审批 7 = 重购条件不足
}