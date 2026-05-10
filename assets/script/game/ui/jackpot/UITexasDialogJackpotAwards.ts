import BaseTouchBoard from '../../../ui/board/BaseTouchBoard';
import UIComponent from '../../../ui/UIComponent';
type JackpotAwardDialogParam = {
    awardUsers?: Array<{
        userRid?: number;
        nickname?: string;
        avatar?: string;
        award?: number;
        cardsType?: number;
        handValue?: number;
    }>;
    noAnimation?: boolean;
};
const { ccclass } = cc._decorator;

@ccclass
export default class UITexasDialogJackpotAwards extends BaseTouchBoard {
    private textTMP: cc.Label | cc.RichText = null;
    private spineResult: cc.Node = null;

    protected lateLoad(): void {
        super.lateLoad();
        const textNode = this.getChildNodeOrComponent('TextTMP');
        this.textTMP = textNode?.getComponent(cc.Label) || textNode?.getComponent(cc.RichText) || null;
        this.spineResult = this.getChildNodeOrComponent('spineResult');
    }

    protected regiterTouchEvents(): void {
        this.setButtonClick(this.mask, this.onClickClose);
    }

    protected lateShow(param?: JackpotAwardDialogParam): void {
        super.lateShow(param);
        const firstAward = Number(param?.awardUsers?.[0]?.award || 0);
        if (this.textTMP) {
            this.textTMP.string = '';
        }
        this.PlayAnim();
        this.scheduleOnce(() => {
            if (this.textTMP?.node?.isValid) {
                this.textTMP.string = `${Math.floor(firstAward / 100)}`;
            }
        }, 0.05);
        this.scheduleOnce(this.onClickClose, 2.6);
    }

    lateClose(param?: any): void {
        super.lateClose(param);
        this.unscheduleAllCallbacks();
        const anim = this.spineResult?.getComponent(cc.Animation);
        anim?.stop();
    }

    private PlayAnim(): void {
        const anim = this.spineResult?.getComponent(cc.Animation);
        if (!anim) {
            return;
        }
        const clips = anim.getClips?.() || [];
        if (!anim.defaultClip && clips.length > 0) {
            anim.defaultClip = clips[0];
        }
        anim.play(anim.defaultClip?.name || '');
    }
    private onClickClose = (): void => {
        UIComponent.close(this.UIDefine);
    };
}
