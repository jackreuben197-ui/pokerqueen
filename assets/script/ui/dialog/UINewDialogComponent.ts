
/**
 * 基础小弹窗类
 */
import BaseTouchBoard from "../board/BaseTouchBoard";


export type UIDialogParam = {
    type?: number,
    title?: string,
    content?: string,
    contentCommit?: string,
    contentCommitColor?: string,
    contentCancel?: string,
    contentCancelColor?: string,
    actionCommit?: Function,
    actionCancel?: Function,
    actionClose?: Function,
    noAnimation?: boolean,
}
const { ccclass } = cc._decorator;

@ccclass
export default class UIDialogComponent extends BaseTouchBoard {

    /**
     * 类型
     */
    static DialogType = cc.Enum({
        Commit: 1,//提交按钮
        CommitCancel: 2//提交&取消按钮
    })

    mask: cc.Node = null;
    main: cc.Node = null;
    content: cc.Node = null;
    //顶部block遮挡
    top_block: cc.Node = null;

    protected mainFadeInIsComplete: boolean = false;
    protected maskFadeInIsComplete: boolean = false;



    main_block: cc.BlockInputEvents = null;

    Text_Title: cc.Label = null;
    Text_Content: cc.RichText = null;


    Button_Commit: cc.Node = null;
    Text_Commit: cc.Label = null;

    Button_Cancel: cc.Node = null;
    Text_Cancel: cc.Label = null;

    Rectangle1201: cc.Node = null;



    private _actionCommit: Function = null;
    private _actionCancel: Function = null;
    private _actionClose: Function = null;


    //面板渐入渐出样式
    protected defaultStyle: any = {
        //动效总开关
        fade_switch_on: true,
        //内容顶层节点
        main_fadeIn_active: true,
        main_fadeIn_duration: .3,
        main_fadeIn_ease: cc.easeBackOut(),

        main_fadeOut_active: true,
        main_fadeOut_duration: .2,
        main_fadeOut_ease: cc.easeBackIn(),

        //mask节点
        mask_fadeIn_active: true,
        mask_fadeIn_duration: .2,
        mask_fadeIn_ease: null,

        mask_fadeOut_active: true,
        mask_fadeOut_duration: .2,
        mask_fadeOut_ease: null,

        maskOpacity: 128,

    }

    protected lateLoad(): void {
        super.lateLoad();

        this.Text_Title = this.getChildNodeOrComponent("Text_Title", cc.Label);
        this.Text_Content = this.getChildNodeOrComponent("Text_Content", cc.RichText);

        this.Button_Commit = this.getChildNodeOrComponent("Button_Commit");
        this.Text_Commit = this.getChildNodeOrComponent("Text_Commit", cc.Label);

        this.Button_Cancel = this.getChildNodeOrComponent("Button_Cancel");
        this.Text_Cancel = this.getChildNodeOrComponent("Text_Cancel", cc.Label);
        this.Rectangle1201 == this.getChildNodeOrComponent("Rectangle1201");
    }


    protected regiterTouchEvents(): void {
        // super.regiterTouchEvents();
        this.Button_Commit?.on("click", this.onCommitClick, this);
        this.Button_Cancel?.on("click", this.onCancelClick, this);

        this.mask.on("click", () => {
            this.goClose();
            this._actionClose && this._actionClose();
        }, this);
    }

    protected lateShow(param?: UIDialogParam) {

        super.lateShow(param);

        this.Button_Cancel.active = param?.type == UIDialogComponent.DialogType.CommitCancel;
        this.Rectangle1201.active = param?.type == UIDialogComponent.DialogType.CommitCancel;
        this.setText(this.Text_Title, param?.title || "")
        this.setText(this.Text_Content, param?.content || "")
        this.setText(this.Text_Commit, param?.contentCommit || "ok")
        this.setText(this.Text_Cancel, param?.contentCancel || "cancel")
        this.Text_Commit.node.color = cc.color().fromHEX(param?.contentCommitColor || '#7187FF')
        this.Text_Cancel.node.color = cc.color().fromHEX(param?.contentCancelColor || '#757CAB')
        this._actionCommit = param?.actionCommit || null;
        this._actionCancel = param?.actionCancel || null;
        this._actionClose = param?.actionClose || null;
    }


    lateClose(param: any = null) {
        super.lateClose(param);
    }

    protected onCommitClick() {
        super.goClose();

        if (this._actionCommit) {
            this._actionCommit();
        }
    }

    protected onCancelClick() {
        super.goClose();

        if (this._actionCancel) {
            this._actionCancel();
        }
    }

    // maskFadeIn(style: any) {

    //     let mask_opacity = style?.maskOpacity >= 0 ? style.maskOpacity : this.defaultStyle.maskOpacity;
    //     if (style?.fade_switch_on == false || style?.main_fadeIn_active == false) {
    //         this.mask.opacity = mask_opacity;
    //         this.maskFadeInComplete();
    //     } else {
    //         this.mask.opacity = 1;
    //         let duration = style?.mask_fadeIn_duration || this.defaultStyle.mask_fadeIn_duration;
    //         let ease = style?.mask_fadeIn_ease || this.defaultStyle.mask_fadeIn_ease;
    //         cc.tween(this.mask).to(duration, { opacity: mask_opacity }, ease).call(this.maskFadeInComplete, this).start();
    //     }
    // }
    // mainFadeIn(style: any) {

    //     this.top_block.active = true;

    //     if (style?.fade_switch_on || style?.main_fadeIn_active == false) {
    //         this.main.scale = 1;
    //         this.mainFadeInComplete();
    //     } else {
    //         this.main.scale = 0;
    //         let duration = style?.main_fadeIn_duration || this.defaultStyle.main_fadeIn_duration;
    //         let ease = style?.main_fadeIn_ease || this.defaultStyle.main_fadeIn_ease;
    //         cc.tween(this.main).to(duration, { scale: 1 }, ease).call(this.mainFadeInComplete, this).start();
    //     }
    // }

    // maskFadeOut(style: any) {
    //     this.mask.opacity = 1;
    //     let duration = style?.mask_fadeOut_duration || this.defaultStyle.mask_fadeOut_duration;
    //     let ease = style?.mask_fadeOut_ease || this.defaultStyle.mask_fadeOut_ease;
    //     cc.tween(this.mask).to(duration, { opacity: 128 }, ease).start();
    // }
    // mainFadeOut(style: any) {
    //     this.main.scale = 0;
    //     let duration = style?.main_fadeOut_duration || this.defaultStyle.main_fadeOut_duration;
    //     let ease = style?.main_fadeOut_ease || this.defaultStyle.main_fadeOut_ease;
    //     cc.tween(this.main).to(duration, { scale: 1 }, ease).start();
    // }

}
