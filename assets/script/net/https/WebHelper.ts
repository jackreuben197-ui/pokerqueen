import { Web_Config_Global_Config, Web_Misc_Banner_List, Web_Msg_Message_Unread, Web_Room_Center_Groups } from "./WebRequest";

export default class WebHelper {

    /**
     * 不需要菊花的Web API接口
     */
    static AbandonJuhua_APIS = [
        //Web_Chat_Messages.API,
        //Web_Chat.API,
        //Web_Send_Messages.API,
        //Web_User_Voiceprint_suspect.API,
        Web_Config_Global_Config.API,
        Web_Msg_Message_Unread.API,
        Web_Room_Center_Groups.API,
        Web_Misc_Banner_List.API,
        //Web_Pay_Apple_Order_Recharge.API,
        //Web_Pay_Apple_Order_Verifyreceipt.API,
    ];
    static NeedJuhua(api: string): boolean {
        return this.AbandonJuhua_APIS.indexOf(api) == -1;
    }

}
