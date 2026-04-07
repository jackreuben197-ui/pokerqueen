import { table } from "console";
import BaseFormPlus from "../../ui/form/BaseFormPlus";
import UITableTemplate from "./UITableTemplate";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIPokerListItem extends cc.Component {

    @property(cc.Prefab)
    pokerTablePrefab: cc.Prefab = null;

    //
    // 界面细节信息：
    @property(cc.Label)
    protected cc_Label$gametype: cc.Label = null;
    @property(cc.Label)
    protected cc_Label$sbinfo: cc.Label = null;
    @property(cc.Label)
    protected cc_Label$tablenum: cc.Label = null;
    @property(cc.Label)
    protected cc_Label$usernum: cc.Label = null;

    @property(cc.Node)
    protected $dropdownBtn: cc.Node = null;

    @property(cc.Node)
    protected $tableLayout: cc.Node = null;

    // 记录当前的游戏类型:
    protected curGameType: number = -1;
    protected curPokerType :number = -1;

    // 记录 tableLayout 完全展开时的原始高度
    private _originalTableHeight: number = 0;
    // 记录当前是否正在动画中
    private _isAnimating: boolean = false;
    // 记录当前是否已展开，初始为展开状态
    private _isExpanded: boolean = true;

    protected onDestroy(): void {
        if (this.$tableLayout) {
            cc.tween(this.$tableLayout).stop();
            let innerLayout = this.$tableLayout.getComponent(cc.Layout);
            if (innerLayout) innerLayout.enabled = true;
        }
    }

    protected onLoad(): void {

        if (this.$dropdownBtn)
            this.$dropdownBtn.on(cc.Node.EventType.TOUCH_END, this.onDropDownBtn, this);

        // 当前 item 锚点 Y 设为 1（顶部），高度增加时顶部不动，只往下扩展
        this.node.setAnchorPoint(0.5, 1);

        // 初始状态为展开
        if (this.$tableLayout) {
            this.$tableLayout.setAnchorPoint(0.5, 1);
        }
    }

    protected onDropDownBtn() {
        if (!this.$tableLayout || this._isAnimating) return;

        // 首次点击时记录原始高度（此时处于展开状态）
        if (this._originalTableHeight <= 0) {
            this._originalTableHeight = this.$tableLayout.height;
        }
        if (this._originalTableHeight <= 0) return;

        this._isAnimating = true;
        let isShowing = this._isExpanded;

        // 动画期间禁用内部 Layout，防止子节点重新排列
        let innerLayout = this.$tableLayout.getComponent(cc.Layout);
        if (innerLayout) innerLayout.enabled = false;

        if (!isShowing) {
            // 展开：激活并设为极小缩放
            this.$tableLayout.active = true;
            this.$tableLayout.scaleY = 0.001;
            this.$tableLayout.height = 0;
            cc.tween(this.$tableLayout)
                .to(0.25, { scaleY: 1 }, { easing: "sineOut" })
                .call(() => {
                    this.$tableLayout.height = this._originalTableHeight;
                    if (innerLayout) {
                        innerLayout.enabled = true;
                        innerLayout.updateLayout();
                    }
                    this._isAnimating = false;
                    this._isExpanded = true;
                })
                .start();
        } else {
            // 收起：动画缩放到极小
            cc.tween(this.$tableLayout)
                .to(0.25, { scaleY: 0.001 }, { easing: "sineIn" })
                .call(() => {
                    this.$tableLayout.active = false;
                    this.$tableLayout.height = this._originalTableHeight;
                    if (innerLayout) innerLayout.enabled = true;
                    this._isAnimating = false;
                    this._isExpanded = false;
                })
                .start();
        }
    }

    protected update(dt: number): void {
        // 动画期间每帧同步 height = originalHeight * scaleY，让父级 Layout 实时跟随
        if (this._isAnimating && this.$tableLayout && this.$tableLayout.active && this._originalTableHeight > 0) {
            this.$tableLayout.height = this._originalTableHeight * Math.max(this.$tableLayout.scaleY, 0.001);
        }
    }

    /**
     * 扑克专区要过滤的game_type是： 0，1，2，3
     *  game_type为0时:  poker_type 0 表示当前游戏类型为德州  2 表示游戏类型为6+
     *  game_type 1,2,3都是奥马哈
     * @param type 
     * @param poker_type 
     * @returns 
     */
    protected getGTypeStr(type: number,poker_type:number): string {
        if( type == 0 ){
            if(poker_type == 0)
                return "德州扑克";
            else if(poker_type == 2)
                return "6+";
        }else {
            return "奥马哈";
        }
    }

    /**
     * 根据类型来决定当前的数据是否显示.
     * @param type 
     */
    public showByGameType(type: Array<number>,poker_type:number): void {
        if (type.length <= 0)
            this.node.active = true;
        else {
            if( (type.indexOf( this.curGameType)>=0) && (poker_type==this.curPokerType) ) {
                this.node.active = true;
            } else {
                this.node.active = false;
            }
        }
    }

    /**
     * 设置当前List需要的数据
     * @param data
     */
    public setListData(data: Array<any>): void {
        if (data && data.length > 0) {
            let tblNum: number = data.length;
            let userNum: number = 0;
            for (let ti: number = 0; ti < data.length; ti++) {
                userNum += data[ti].users.length;
            }

            this.cc_Label$gametype.string = this.getGTypeStr(data[0].game_type,data[0].poker_type);
            this.cc_Label$sbinfo.string = data[0].sb + "/" + data[0].sb * 2;
            this.cc_Label$tablenum.string = tblNum + "桌";
            this.cc_Label$usernum.string = userNum + "人";

            this.curGameType = data[0].game_type;
            this.curPokerType = data[0].poker_type;

            //
            // 给桌子加数据：
            for (let tblidx: number = 0; tblidx < tblNum; tblidx++) {
                let table: cc.Node = cc.instantiate(this.pokerTablePrefab);
                let script: UITableTemplate = table.getComponent(UITableTemplate);
                script.setTableData(data[tblidx]);

                this.$tableLayout.addChild(table);
            }
        }
    }


}
