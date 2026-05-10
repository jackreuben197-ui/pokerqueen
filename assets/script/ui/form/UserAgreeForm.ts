/*
 * @Author: xfj
 * @Date: 2022-10-24 10:50:55
 * @description:
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-03-30 10:45:06
 * @FilePath: /pokerqueen/assets/script/ui/form/UserAgreeForm.ts
 */
import { StringHelper } from '../../helper/StringHelper';
import { i18nMgr } from '../../i18n/i18nMgr';
import BaseForm from './BaseForm';
const { ccclass, property } = cc._decorator;

@ccclass
export default class UserAgreeForm extends BaseForm {
    webview: cc.WebView = null;
    UserAgentURL = 'https://test2-h5-protocol.awanptest.com/#/?lan={id}';
    private mUrl_Suffix = { cn: 'cn', en: 'en_US', pt: 'pt_BR' };

    /**
     * 节点|组件 定义
     */
    ///////////////////////////////////
    /**
     * 声明内容
     */
    ///////////////////////////////////
    /**
     * onLoad之后处理的内容
     */
    protected lateLoad() {
        super.lateLoad();
        this.webview = this.getChildNodeOrComponent('webview').getComponent(cc.WebView);
    }

    /**
     * 关闭需要处理的内容
     */
    lateClose(param?: any) {
        super.lateClose(param);
    }

    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: cc.Node): void {
        super.onShow(param, fromUI);
        this.webview.url = StringHelper.Replace(this.UserAgentURL, this.GetUrlSuffix());
    }

    /// <summary>
    /// 得到 后缀语言  ?lan=cn   ?lan=en    ?lan=ft
    /// </summary>
    public GetUrlSuffix() {
        return this.mUrl_Suffix[i18nMgr.language];
    }

    /**
     * 注册触摸事件
     */
    protected regiterTouchEvents() {
        super.regiterTouchEvents();
    }

    /**
     * 注册广播事件
     */
    protected regiterDispatchEvent() {}

    /**
     * 停止所有 动作，包括 tween ,update，等
     */
    protected stopAllThings() {}

    mainFadeIn(style: any) {
        this.content.active = false;
        super.mainFadeIn(style);
    }

    async mainFadeOut(style: any) {
        this.content.active = false;
        super.mainFadeOut(style);
    }

    fadeInComplete() {
        super.fadeInComplete();
        this.content.active = true;
    }
}
