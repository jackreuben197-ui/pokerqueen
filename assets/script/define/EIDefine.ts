/**
 * 全局枚举和接口定义
 */

/**
 * 流程
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
 * UI 渐入渐出样式
 */
export enum UIFadeStyleEnum {
    None = 0,
    //右边渐入渐出
    RightInOut = 1,
    //左边渐入渐出
    LeftInOut = 2,
    //缩放渐入渐出
    ScaleInOut = 3,

}
/**
 * Dialog参数接口
 */
export interface DialogParam {
    title?: string;
    content?: string;
    confirm?: string;
}
