import { UIDefine } from "../../define/UIDefine";
import GameUtil, { GameEnterType } from "../../game/util/GameUtil";
import UIComponent from "../../ui/UIComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UITableTemplate extends cc.Component {


    @property(cc.Label)
    protected tableName: cc.Label = null;

    @property(cc.Label)
    protected userLabel: cc.Label = null;

    @property(cc.Label)
    protected timeLabel: cc.Label = null;

    @property(cc.Label)
    protected betLabel: cc.Label = null;

    @property(cc.Sprite)
    protected himg0: cc.Sprite = null;
    @property(cc.Sprite)
    protected himg1: cc.Sprite = null;
    @property(cc.Sprite)
    protected himg2: cc.Sprite = null;
    @property(cc.Sprite)
    protected himg3: cc.Sprite = null;
    @property(cc.Sprite)
    protected himg4: cc.Sprite = null;
    @property(cc.Sprite)
    protected himg5: cc.Sprite = null;
    @property(cc.Sprite)
    protected himg6: cc.Sprite = null;
    @property(cc.Sprite)
    protected himg7: cc.Sprite = null;
    @property(cc.Sprite)
    protected himg8: cc.Sprite = null;

    // 记录当前持有的 SpriteFrame 引用，用于清理
    private _spriteFrames: cc.SpriteFrame[] = [];

    // 记录当前的Table数据。
    private _data: any = null;

    protected onDestroy(): void {
        this.releaseSpriteFrames();
    }

    /**
     * 释放所有已加载的 SpriteFrame
     */
    protected releaseSpriteFrames(): void {
        for (let i = 0; i < this._spriteFrames.length; i++) {
            if (this._spriteFrames[i]) {
                this._spriteFrames[i].destroy();
            }
        }
        this._spriteFrames.length = 0;
    }

    /**
     * 设置TableName:
     * @param data
     */
    public setTableData(data: any): void {
        this.tableName.string = data.name;
        if( data.start_time )
            this.timeLabel.string = this.getTimeDiffString(data.start_time) + "/" + this.getMaxTimeString(data.play_duration);
        else
            this.timeLabel.string = '0m/' + this.getMaxTimeString(data.play_duration);
        
        this.userLabel.string = data.users.length + "/" + data.seat_count;

        // min_rate*sb*2/100
        // sb的单位是分，所以除以100
        this.betLabel.string = data.min_rate * data.sb / 50 + "买入";

        // 处理对应的头像数据：
        this.loadHeadImage(data.users);

        this._data = data;

        this.node.on( cc.Node.EventType.TOUCH_END, this.enterRoomTable, this );
    }

    /**
     *　处理进入牌桌房间的逻辑.
     */
    protected enterRoomTable(): void {
        if (this._data) {
            UIComponent.Instance.CloseNoAnimation(UIDefine.UIPokerRoomList);
            GameUtil.EnterRoomAPI(this._data, {
                game_enter_type: GameEnterType.Club,
            });
        }
    }

    /**
     * 处理时间相关：
     * @param dur
     * @returns
     */
    protected getMaxTimeString(dur: number): string {
        if (dur < 3600)
            return dur / 60 + "m";
        else {
            return dur / 3600 + "h";
        }
    }

    /**
     * 加载头像数据：
     */
    protected loadHeadImage(users: Array<any>): void {
        // 清理旧的 SpriteFrame
        this.releaseSpriteFrames();

        // 先清空所有头像
        let arrHeadImg: Array<cc.Sprite> = [this.himg0, this.himg1, this.himg2,
        this.himg3, this.himg4, this.himg5, this.himg6, this.himg7, this.himg8];

        for (let ti: number = 0; ti < arrHeadImg.length; ti++) {
            if (arrHeadImg[ti]) {
                arrHeadImg[ti].spriteFrame = null;
            }
        }

        for (let ti: number = 0; ti < users.length; ti++) {
            if (users[ti].avatar) {
                cc.assetManager.loadRemote(users[ti].avatar, (err, texture: cc.Texture2D) => {
                    if (err) {
                        cc.error("加载失败", err);
                        return;
                    }
                    // 异步回调中校验节点是否仍然有效
                    if (!cc.isValid(this.node)) return;

                    texture.packable = false; // 2.4.x 建议设置此属性
                    const sf = new cc.SpriteFrame();
                    sf.setTexture(texture);
                    this._spriteFrames.push(sf);
                    if (arrHeadImg[ti] && cc.isValid(arrHeadImg[ti].node)) {
                        arrHeadImg[ti].spriteFrame = sf;
                    }
                });
            }
        }
    }

    /**
     * 计算给定 ISO 时间字符串距离当前时间的差值
     * 输出格式: "1h28m"
     * @param isoString 时间字符串 (如: 2026-04-03T02:44:12Z)
     */
    protected getTimeDiffString(isoString: string): string {
        const targetDate = new Date(isoString);
        const now = new Date();

        // 获取毫秒差值的绝对值（防止计算未来的时间出现负数）
        const diffMs = Math.abs(now.getTime() - targetDate.getTime());

        // 转换为总分钟数
        const totalMinutes = Math.floor(diffMs / (1000 * 60));

        // 计算小时和剩余分钟
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        // 拼接字符串
        if (hours > 0)
            return `${hours}h${minutes}m`;
        return `${minutes}m`;
    }

}
