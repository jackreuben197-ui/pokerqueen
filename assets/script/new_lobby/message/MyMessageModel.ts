//我的消息数据

import { i18nMgr } from "../../i18n/i18nMgr";

export enum EnumMSG {
    MSG_Backpack = 1,//背包消息
    MSG_Club,//俱乐部
    MSG_Money,//钱包
    MSG_System,//系统
    MSG_League,//联盟
    MSG_ApplyList,//带入申请
}
export default class MyMessageModel {
    public static get Instance(): MyMessageModel {
        return (this as any).__Instance ??= new MyMessageModel();
    }
    //映射消息顺序
    message_order = {
        [EnumMSG.MSG_Backpack]: 2,
        [EnumMSG.MSG_Club]: 3,
        [EnumMSG.MSG_Money]: 1,
        [EnumMSG.MSG_System]: 0,
        [EnumMSG.MSG_League]: 4,
        [EnumMSG.MSG_ApplyList]: 5,
    }
    //展示的消息条目
    message_items = [
        {//0-系统消息
            name: "Msg3",
            msg_type: EnumMSG.MSG_System,
        },
        {//1-钱包消息
            name: "Msg4",
            msg_type: EnumMSG.MSG_Money,
        },
        {//2-背包消息
            name: "Msg6",
            msg_type: EnumMSG.MSG_Backpack,
        },
        {//3-公会消息
            name: "Msg1",
            msg_type: EnumMSG.MSG_Club,
        },
        {//4-联盟消息
            name: "Msg2",
            msg_type: EnumMSG.MSG_League,
        },
        {//5-带入申请消息
            name: "UIClub_RoomSitApplyRecords_title",
            msg_type: EnumMSG.MSG_ApplyList,
        },
    ]
    //面板开启来源 对应索引-message_items //0 朋友桌 1 公会桌 2 我的
    ui_show_from = {
        0: [5],//朋友桌来源
        1: [0, 3, 4, 5],//公会来源
        2: [0, 1, 2, 3, 4, 5],//我的来源
        10: [0, 3, 4],//公会来源，普通用户
    }
    //消息状态颜色
    content_colors = ["#757CAB", "#FF7C7C"]

    //通过code值获取消息内容
    public GetMsg(code: number): string {
        let key = `MsgInfo_${code}`;
        var str = i18nMgr.Get(key);
        return str == key ? null : str;
    }
}

