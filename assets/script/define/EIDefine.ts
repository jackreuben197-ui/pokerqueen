/**
 * 全局枚举和接口定义
 */

export enum ProcedureEnum {
    //初始化
    Init = 1,
    //预加载
    Preloading = 2,
    //登录
    Login = 3,

}
/**
 * UI 进出特效
 */
export enum UIFadeEffectEnum {
    None = 0,
    //右边划入划出
    RightInOut = 1,
}
export interface DialogParam {
    title?: string;
    content?: string;
    confirm?: string;
}
