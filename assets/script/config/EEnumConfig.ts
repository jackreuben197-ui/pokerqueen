

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
}


export enum EMttRealTimeTabType {
    sk = 0,
    pz = 1,
    jl = 2,
    mz = 3
}