import SceneManager from '../../../../../manager/SceneManager';

/**
 * 弹幕管理器：独立于 UITexas 组件，通过 cc.find 直接操作 DanmuPanel 节点。
 * 避免跨模块 getComponent 引用不一致的问题。
 */
export default class DanmuManager {
    private static _instance: DanmuManager = null;
    private _danmuPanel: cc.Node = null;
    private _danmuLabel: cc.Label = null;
    private _danmuQueue: string[] = [];
    private _danmuPlaying: boolean = false;

    static get Instance(): DanmuManager {
        if (!DanmuManager._instance) {
            DanmuManager._instance = new DanmuManager();
        }
        return DanmuManager._instance;
    }

    /** 播放弹幕：入队，如果当前没在播放则立即开始 */
    playDanmu(text: string): void {
        this._danmuQueue.push(text);
        this._tryPlayNext();
    }

    private _tryPlayNext(): void {
        if (this._danmuPlaying) return;
        if (this._danmuQueue.length === 0) return;
        // 懒加载：从场景中查找 DanmuPanel
        if (!this._danmuPanel || !this._danmuPanel.isValid) {
            const sceneNode = SceneManager.Instance.currUI;
            if (!sceneNode) return;
            this._danmuPanel = cc.find('main/DanmuPanel', sceneNode);
            if (!this._danmuPanel) return;
            this._danmuLabel = this._danmuPanel.getChildByName('DanmuLabel')?.getComponent(cc.Label);
            if (!this._danmuLabel) return;
        }
        const text = this._danmuQueue.shift();
        this._danmuLabel.string = text;
        const panelWidth = this._danmuPanel.width;
        this._danmuPanel.active = true;
        // 等 Label 更新完尺寸再拿宽度
        const labelWidth = this._danmuLabel.node.width;
        const startX = panelWidth / 2;
        const endX = -panelWidth / 2 - labelWidth;
        this._danmuLabel.node.x = startX;
        this._danmuPlaying = true;
        const duration = (startX - endX) / 100;
        cc.tween(this._danmuLabel.node)
            .to(duration, { x: endX })
            .call(() => {
                this._danmuPlaying = false;
                this._danmuPanel.active = false;
                this._tryPlayNext();
            })
            .start();
    }
}
