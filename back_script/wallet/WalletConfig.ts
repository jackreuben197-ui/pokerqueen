import { IUIDefine } from "../define/EIDefine"

export enum EWalletGoldOpration {
    in = 0, //充值
    out = 1, //提取
    issue = 2, //发放
}


export type TWalletGoldOpration = {
    icon?: string,
    title: string,
    goto: IUIDefine,
    param?: any
}