import { IUIDefine } from "../define/EIDefine"

export enum EWalletGoldOpration {
    in = 0, //充值
    out = 1 //提取
}


export type TWalletGoldOpration = {
    icon?: string,
    title: string,
    goto: IUIDefine,
    param?: any
}