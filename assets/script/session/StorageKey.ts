/*
 * @Author: xfj
 * @Date: 2022-08-22 00:32:52
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-08-26 15:51:56
 * @FilePath: /pokerqueen/assets/script/session/StorageKey.ts
 */

export default class StorageKey {

    //token字符串
    static TOKEN: string = "TOKEN";
    //token有效期
    static TOKEN_EXPIREAT = "TOKEN_EXPIREAT";
    //电话区号
    static AERA_CODE = "AERA_CODE";
    //手机号
    static PHONE = "PHONE";
    //语言
    static Language = "Language";

    static KEY_USERID = "KEY_USERID";
    static KEY_PHONE = "KEY_PHONE";
    static KEY_PHONE_FIRST = "KEY_PHONE_FIRST";



    //=======================设置相关========================
    //桌布类型
    static SettingDeskType = "SettingDeskType";
    static kQuickActionIndexKEY = "kQuickActionIndexKEY"; //自定义加注
    static kQuickActionIndexValueKEY = "kQuickActionIndexValueKEY";
    static togglesCardType = 'togglesCardType'; // 牌面
    static soundIsOpen = 'soundIsOpen'; // 声音

}
(window as any).StorageKey = StorageKey;