/**
 * 循环滚动思路：
 * 添加5个view，
 * 第一view第三张图片，第二view第一张图片。第三view第二图片。第四view第三图片，第5view第一图片，
 * 滑动到第5个view时候，需要做判断，调用scrollToPage瞬间滑倒第二个view，滑动到第1个view时候，需要做判断，调用scrollToPage瞬间滑倒第四个view，伪装成无限滚动 
 */
// let testData = {
//     "code": 0,
//     "message": "",
//     "data": {
//         "limit": 10,
//         "list": [{ "id": 50, "lang": "en_US", "status": 1, "banner_type": 1, "image_url": "http://static.awanptesting.com/image-normal/20220608102646-WmJuh.png", "redirect_url": "", "description": "", "creator_id": 7, "create_time": "2022-06-08T10:26:48Z", "update_time": "2022-06-08T10:26:48Z" }
//             , { "id": 49, "lang": "en_US", "status": 1, "banner_type": 1, "image_url": "http://static.awanptesting.com/image-normal/20220608102619-reFYc.png", "redirect_url": "", "description": "", "creator_id": 7, "create_time": "2022-06-08T10:26:26Z", "update_time": "2022-06-08T10:26:26Z" }
//             , { "id": 48, "lang": "en_US", "status": 1, "banner_type": 1, "image_url": "http://static.awanptesting.com/image-normal/20220608102605-yqPHq.png", "redirect_url": "", "description": "", "creator_id": 7, "create_time": "2022-06-08T10:26:08Z", "update_time": "2022-06-08T10:26:08Z" }],
//         "offset": 0,
//         "total": 3
//     }
// }
// 语言(zh_CN:简体中文,zh_HK:繁体中文,en_US:英文，pt_BR：葡萄牙语
const { ccclass, property } = cc._decorator;
import UIBase from "../../../assets/script/ui/UIBase";

import HttpRequest from "../../../assets/script/net/https/HttpRequest";
import { Web_Misc_Banner_List } from "../../../assets/script/net/https/WebRequest";

@ccclass
export default class UIMatchBanner extends UIBase {
    private curNum: number = 0;
    public static instance:UIMatchBanner = null;
    private markData: Date = null;
    private layout: cc.Node = null;
    private pageView: cc.Node = null;
    private pageData: any = null;
    protected lateLoad(): void {
        cc.log(`UIMatchBanner on lateLoad`);
        super.lateLoad();
        this.initBannerList("zh_CN");
        if(UIMatchBanner.instance===null){
            UIMatchBanner.instance = this;
        }else{
            this.destroy();
            return;
        }
    }
    public initBannerList(lang:string){
        this.onRemoveAllPage()
        let data: typeof Web_Misc_Banner_List.RequestParams = {};
        data.lang = lang;
        data.type = 1;
        data.limit = 10;
        data.offset = 0;
        this.GetBannerList(data).then((res) => {
            this.setBanner(res);
        })
    }
    setBanner(param: typeof Web_Misc_Banner_List.RequestParams): void {
        this.layout = this.getChildNodeOrComponent("Banner_Layout");
        this.pageView = this.getChildNodeOrComponent("ScrollView_TopCards");
        this.pageData = param;
        let list: Array<any> = this.pageData.data.list;
        if(list.length>0){
            let beginData = list[0];
            let endData = list[list.length - 1];
            //处理一下list在开始和结束分别添加一个数据
            this.curNum = list.length;
            list.push(beginData);
            list.unshift(endData);
            let bannerPrefab = this.getChildNodeOrComponent("Banner_Prefab");
            //添加banner
            for (let i = 0; i < list.length; i++) {
                let banner = null;
                banner = this.layout.getChildByName("banner_" + i);
                if (banner) {
                    banner.active = true;
                    this.pageView.getComponent(cc.PageView).addPage(banner);
                    banner.setPageBanner(banner, list[i]);
                } else {
                    banner = cc.instantiate(bannerPrefab);
                    banner.active = true;
                    this.pageView.getComponent(cc.PageView).addPage(banner);
                    banner.name = "banner_" + i;
                    this.setPageBanner(banner, list[i]);
                }
            }
            this.addPageEvent();
            this.setDots(true);
            this.schedule(this.autoScrollPage, 5)
        }
    }
    /**
     * @description: 
     * @param {string} img:远程图片url地址
     * @return {*}
     */
    private loadRawImage(img: string): Promise<cc.SpriteFrame> {
        //异步的写一个promise
        return new Promise(function (resolve, reject) {
            cc.assetManager.loadRemote(img, { ext: '.png' }, function (err, texture: cc.Texture2D) {
                if (err) {
                    reject(img + " load error")
                } else {
                    texture.packable = false;
                    let frame = new cc.SpriteFrame(texture);
                    resolve(frame);
                }
            });
        })
    }
    /**
     * @description: 
     * @param {cc} banner:banner节点
     * @param {any} data:banner数据
     * @return {*}
     */
    setPageBanner(banner: cc.Node, data: any): void {
        this.loadRawImage(data.image_url).then((fram: cc.SpriteFrame) => {
            banner.getChildByName("icon").getComponent(cc.Sprite).spriteFrame = fram;
        }).catch((err) => {
            cc.log(err);
        })
    }
    addPageEvent(): void {
        console.log("addPageEvent");
        var pageViewEventHandler = new cc.Component.EventHandler();
        pageViewEventHandler.target = this.node; // 这个是你的事件处理代码组件所属的节点
        pageViewEventHandler.component = "UIMatchBanner"
        pageViewEventHandler.handler = "pageEvent";
        // pageViewEventHandler.customEventData = "foobar";

        this.pageView.getComponent(cc.PageView).pageEvents.push(pageViewEventHandler);
        this.scheduleOnce(() => {
            let curPage = this.pageView.getComponent(cc.PageView).getCurrentPageIndex();
            cc.log("curPage--", curPage);
            this.onJumpHome();
        })
    }
    /**
     * @description: 
     * @param {cc} pageView 是一个 PageView 组件对象实例
     * @param {cc} eventType  eventType === cc.PageView.EventType.PAGE_TURNING
     * @param {string} customEventData  参数就等于你之前设置的 "自定义参数"
     * @return {*}
     */
    pageEvent(pageView: cc.PageView, eventType: cc.PageView.EventType, customEventData: string): void {
        if (eventType !== cc.PageView.EventType.PAGE_TURNING) {
            return;
        } else {
            // console.log("当前所在的页面索引:" + pageView.getCurrentPageIndex());
            if (pageView["_touchBeganPosition"]) {
                cc.log("取消自动");
                this.unschedule(this.autoScrollPage)
                if (pageView["_touchEndPosition"]) {
                    pageView["_touchBeganPosition"] = null;
                    pageView["_touchEndPosition"] = null;
                    this.scheduleOnce(() => {
                        cc.log("恢复自动");
                        if (this.markData) {
                            let date = new Date();
                            if ((date.getTime() - this.markData.getTime()) / 1000 > 10) {
                                this.markData = date;
                                this.schedule(this.autoScrollPage, 5);
                            }
                        } else {
                            this.markData = new Date();
                            this.schedule(this.autoScrollPage, 5);
                        }
                    }, 5)
                }
            }
            if (pageView.getCurrentPageIndex() === this.curNum + 1) {
                this.onJumpHome();
            } else if (pageView.getCurrentPageIndex() === 0) {
                this.onJumpEnd();
            } else {
                this.setDots(false);
            }
        }
    }
    //移除所有页面
    onRemoveAllPage(): void {
        let page:cc.PageView = this.getChildNodeOrComponent("ScrollView_TopCards").getComponent(cc.PageView)
        let _pages = page.getPages();
        if(_pages.length>0){
            page.removeAllPages();
            this.curNum = 0;
        }
    }
    // 返回首页
    onJumpHome(): void {
        // 第二个参数为滚动所需时间，默认值为 0.3 秒
        this.layout.x = -1863;
        this.pageView.getComponent(cc.PageView).setCurrentPageIndex(1);
        let index = this.pageView.getComponent(cc.PageView).getCurrentPageIndex();
        console.log("当前的index=", index);
        this.setDots(false);
    }
    //跳到尾页
    onJumpEnd(): void {
        this.layout.x = -621 - 1242 * this.curNum;
        this.pageView.getComponent(cc.PageView).setCurrentPageIndex(this.curNum);
        this.setDots(false);
    }
    //设置Dots
    setDots(isInit: boolean): void {
        let curPage = this.pageView.getComponent(cc.PageView).getCurrentPageIndex();
        if (isInit) {
            curPage = 1;
        }
        let Dots: cc.Node = this.getChildNodeOrComponent("Dots");
        for (let i = 1; i <= 5; i++) {
            let dot = Dots.children[i - 1];
            if (i <= this.curNum) {
                dot.active = true;
                dot.opacity = 120;
            } else {
                dot.active = false;
            }
            if (i === curPage) {
                dot.opacity = 255;
            }
        }
    }
    autoScrollPage(): void {
        //看看 自动滚动是否会触发pageEvent;
        let pageview = this.pageView.getComponent(cc.PageView);
        let index = pageview.getCurrentPageIndex();
        pageview.scrollToPage(index + 1, 0.3);
    }
    //socket port 请求
    async GetBannerList(param: typeof Web_Misc_Banner_List.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Misc_Banner_List,
                param: Web_Misc_Banner_List.Request(
                    {
                        lang: param.lang,        // 语言(zh_CN:简体中文,zh_HK:繁体中文,en_US:英文，pt_BR：葡萄牙语
                        type: param.type,        // 1-大厅Banner,2-发现页(工会)Banner
                        limit: param.limit,        // unity 默认10
                        offset: param.offset,        // 开始下标。例子（offset=0，limit=10，0-9。)默认0
                    }),
                onSuccess: function () {
                    cc.log("Web_Misc_Banner_List.Data", Web_Misc_Banner_List.Response.data);
                    resolve(Web_Misc_Banner_List.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
}
