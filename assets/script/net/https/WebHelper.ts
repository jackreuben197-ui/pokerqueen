/*
 * @Author: xfj
 * @Date: 2022-08-22 00:32:52
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-23 17:08:25
 * @FilePath: /pokerqueen/assets/script/net/https/WebHelper.ts
 */
import { Web_Config_Global_Config, Web_Misc_Banner_List, Web_Msg_Message_Unread, Web_Room_Center_Groups, Web_Org_Club_Create, Web_Org_Club_Get } from "./WebRequest";

export default class WebHelper {

    /**
     * 忽略菊花的Web API接口
     */
    static _IgnoreShowJuhua_APIS = [
        //Web_Chat_Messages.API,
        //Web_Chat.API,
        //Web_Send_Messages.API,
        //Web_User_Voiceprint_suspect.API,
        Web_Config_Global_Config.API,
        Web_Msg_Message_Unread.API,
        Web_Room_Center_Groups.API,
        Web_Misc_Banner_List.API,
        Web_Org_Club_Create.API,
        Web_Org_Club_Get.API,
        //Web_Pay_Apple_Order_Recharge.API,
        //Web_Pay_Apple_Order_Verifyreceipt.API,
    ];
    static NeedJuhua(api: string): boolean {
        return this._IgnoreShowJuhua_APIS.indexOf(api) == -1;
    }

}
