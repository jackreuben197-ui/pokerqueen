import LocalStoreManager from "../frame/manager/LocalStoreManager";

/*
 * @Author: xfj
 * @Date: 2022-08-22 00:32:52
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-08-26 15:51:56
 * @FilePath: /pokerqueen/assets/script/session/StorageKey.ts
 */
export default class StorageKey {
    //登录数据
    static LOGIN_DATA:string = "LOGIN_DATA";
    //token字符串
    static TOKEN: string = "TOKEN";
    //token有效期
    static TOKEN_EXPIREAT = "TOKEN_EXPIREAT";
    //电话区号
    static AERA_CODE = "AERA_CODE";
    //手机号
    static PHONE = "PHONE";
    /////////////////////////////////////////
    //语言
    static Language = "Language";

    static KEY_USERID = "KEY_USERID";
    static KEY_PHONE = "KEY_PHONE";
    static KEY_PHONE_FIRST = "KEY_PHONE_FIRST";

    //验证码时间 忘记密码
    static CODE_TIME_RESET = "CODE_TIME_RESET";
    //验证码时间 注册
    static CODE_TIME_REGIST = "CODE_TIME_REGIST";

    static OpenBarrage: string = "OpenBarrage";//是否打开弹幕 1 关闭，0 打开

    //=======================设置相关========================
    //桌布样式
    static SettingDeskType = "SettingDeskType";
    //扑克牌样式
    static SettingPokerType = "SettingPokerType";


    static kQuickActionIndexKEY = "kQuickActionIndexKEY"; //自定义加注
    static kQuickActionIndexValueKEY = "kQuickActionIndexValueKEY";
    static togglesCardType = 'togglesCardType'; // 牌面
    static soundIsOpen = 'soundIsOpen'; // 声音

}

(window as any).StorageKey = StorageKey;