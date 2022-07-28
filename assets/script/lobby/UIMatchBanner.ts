/**
 * 循环滚动思路：
 * 添加5个view，
 * 第一view第三张图片，第二view第一张图片。第三view第二图片。第四view第三图片，第5view第一图片，
 * 滑动到第5个view时候，需要做判断，调用scrollToPage瞬间滑倒第二个view，滑动到第1个view时候，需要做判断，调用scrollToPage瞬间滑倒第四个view，伪装成无限滚动 
 */
// 语言(zh_CN:简体中文,zh_HK:繁体中文,en_US:英文，pt_BR：葡萄牙语
const { ccclass, property } = cc._decorator;
import UIBase from "../../../assets/script/ui/UIBase";
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
        super.lateLoad();
        if(UIMatchBanner.instance===null){
            UIMatchBanner.instance = this;
        }else{
            this.destroy();
            return;
        }
    }
    onShow(param: typeof Web_Misc_Banner_List.RequestParams): void {
        this.onRemoveAllPage()
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
            cc.assetManager.loadRemote(img, { ext: '.jpg' }, function (err, texture: cc.Texture2D) {
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
            if (pageView["_touchBeganPosition"]) {
                this.unschedule(this.autoScrollPage)
                if (pageView["_touchEndPosition"]) {
                    pageView["_touchBeganPosition"] = null;
                    pageView["_touchEndPosition"] = null;
                    this.scheduleOnce(() => {
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
}
