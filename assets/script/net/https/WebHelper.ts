/*
 * @Author: xfj
 * @Date: 2022-08-22 00:32:52
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-24 18:55:43
 * @FilePath: /pokerqueen/assets/script/net/https/WebHelper.ts
 */
import { APIOrgClubShareApplyList, APIOrgClubSharePendingList, APIOrgClubApprovalJoin, APIOrgClubCancleJoinClub, APIOrgClubGetJoinlList, APIOrgClubQuit, APIOrgClubShareApproveList, APIOrgClubShareAudit, Web_Config_Global_Config, Web_Config_Multi_Language_Template, Web_Msg_Message_Unread, Web_Org_Club_Create, Web_Org_Club_Get, Web_Org_Club_Join, Web_Org_Club_Player_Apply_List, Web_Org_Club_Search_By_Id, Web_Room_Center_Groups } from "./WebRequest";

export default class WebHelper {

    /**
     * 忽略菊花的Web API接口
     */
    static _IgnoreShowJuhua_APIS = [
        //Web_Chat_Messages.API,
        //Web_Chat.API,
        //Web_Send_Messages.API,
        //Web_User_Voiceprint_suspect.API,
        //Web_Config_Global_Config.API,
        Web_Msg_Message_Unread.API,
        Web_Room_Center_Groups.API,
        // Web_Misc_Banner_List.API,
        Web_Org_Club_Create.API,
        Web_Org_Club_Get.API,
        Web_Org_Club_Player_Apply_List.API,
        Web_Org_Club_Player_Apply_List.API,
        Web_Org_Club_Search_By_Id.API,
        Web_Org_Club_Join.API,
        APIOrgClubCancleJoinClub.API,
        APIOrgClubApprovalJoin.API,
        APIOrgClubGetJoinlList.API,
        APIOrgClubQuit.API,
        APIOrgClubShareAudit.API,
        APIOrgClubShareApproveList.API,
        APIOrgClubSharePendingList.API,
        APIOrgClubShareApplyList.API
        //Web_Pay_Apple_Order_Recharge.API,
        //Web_Pay_Apple_Order_Verifyreceipt.API,
    ];
    static NeedJuhua(api: string): boolean {
        return this._IgnoreShowJuhua_APIS.indexOf(api) == -1;
    }
    //忽略打印信息的接口
    static _IgnoreConsole_APIS = [
        Web_Config_Multi_Language_Template.API,
    ]

    static NeedConsole(api: string) {
        return this._IgnoreConsole_APIS.indexOf(api) == -1;
    }

}
