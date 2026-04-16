import GC from "../../frame/GameControl";
import { GameCache } from "../GameCache";

interface TexasGameBombPotHost {
    isBombPot: boolean;
    uirc: any;
    listDefaultPublicCardsLPos: cc.Vec3[];
    listDefaultSecondPublicCardsLPos: cc.Vec3[];
    GetPublicCards(n: number): number[];
    GetPublicCardsCount(n: number): number;
    UpdateSecondPublicCardsCardType(secondPublicCards: number[]): void;
}

const JOINED_ROOMS_KEY = "BombPotJoinedRooms";
const JOINED_ROOMS_MAX = 64;

/**
 * Bomb Pot 玩法（Unity BombPotGame 对齐）
 * - 进入房间开屏动画（首次/非首次）
 * - BombPot 第二套公共牌发牌动画（3 + 1 + 1）
 */
export default class TexasGameBombPot {
    private isPlayingOpenAnim = false;
    private isPlayedOpenAnim = false;

    constructor(private host: TexasGameBombPotHost) {
    }

    public EnterGame(): void {
        if (!this.host.isBombPot) return;
        if (this.IsJoinedRoom()) {
            this.PlayOpenScreen();
            return;
        }
        this.PlayEnterGameAnim();
    }

    public PlayOpenScreen(): void {
        if (!this.host.isBombPot) return;
        if (this.isPlayingOpenAnim) return;

        this.isPlayingOpenAnim = true;
        const anim = this.host.uirc?.BombPotOpenAnim as cc.Animation;
        const node = this.host.uirc?.BombPotOpen as cc.Node;
        if (!anim || !node) {
            this.isPlayingOpenAnim = false;
            return;
        }

        node.active = true;
        anim.stop();
        anim.off("finished", this.OnOpenFinished, this);
        anim.on("finished", this.OnOpenFinished, this);

        // Unity 通常使用 usually，首帧兜底 default clip
        const clipName = this.ResolveClip(anim, ["usually", "bombpot_open", "BombPotOpen"]);
        anim.play(clipName);
    }

    public AppendDealSecondCardTween(tween: cc.Tween, cardIndex: number): void {
        if (!this.host.isBombPot) return;
        const info = this.host.uirc?.listSecondCards?.[cardIndex];
        if (!info) return;
        const cards = this.host.GetPublicCards(2);
        const cardId = cards?.[cardIndex];
        if (cardId == null || cardId < 0) return;

        const startPos = this.host.listDefaultPublicCardsLPos?.[cardIndex];
        const endPos = this.host.listDefaultSecondPublicCardsLPos?.[cardIndex];
        if (!startPos || !endPos) return;

        info.trans.setPosition(startPos);
        info.trans.setScale(1, 1);
        info.trans.active = true;
        info.imageCard.node.color = cc.Color.WHITE;
        info.imageSelect.node.active = false;
        info.SetSpriteFrame(cardId);

        tween.then(cc.callFunc(() => {
            cc.tween(info.trans)
                .to(0.2, { scaleX: 1.2, scaleY: 1.2 })
                .call(() => {
                    GC.sound?.Play?.("sfx_desk_chat");
                })
                .parallel(
                    cc.scaleTo(0.2, 1, 1),
                    cc.moveTo(0.4, cc.v2(endPos.x, endPos.y))
                )
                .call(() => {
                    if (cardIndex === 2) {
                        const copy = cards.slice();
                        copy[cardIndex + 1] = -1;
                        copy[cardIndex + 2] = -1;
                        this.host.UpdateSecondPublicCardsCardType(copy);
                    } else {
                        this.host.UpdateSecondPublicCardsCardType(cards);
                    }
                })
                .start();
        }));
        tween.delay(0.6);
    }

    public ResetState(): void {
        this.isPlayingOpenAnim = false;
        this.isPlayedOpenAnim = false;
        const open = this.host.uirc?.BombPotOpen as cc.Node;
        const logo = this.host.uirc?.BombPotLogo as cc.Node;
        const openAnim = this.host.uirc?.BombPotOpenAnim as cc.Animation;
        const logoAnim = this.host.uirc?.BombPotLogoAnim as cc.Animation;
        openAnim?.off("finished", this.OnOpenFinished, this);
        openAnim?.stop();
        logoAnim?.stop();
        if (open) open.active = false;
        if (logo) logo.active = false;
    }

    private PlayEnterGameAnim(): void {
        if (this.isPlayedOpenAnim) return;
        this.RecordJoinedRoom();

        this.isPlayingOpenAnim = true;
        const openAnim = this.host.uirc?.BombPotOpenAnim as cc.Animation;
        const openNode = this.host.uirc?.BombPotOpen as cc.Node;
        const logoAnim = this.host.uirc?.BombPotLogoAnim as cc.Animation;
        const logoNode = this.host.uirc?.BombPotLogo as cc.Node;

        if (openAnim && openNode) {
            openNode.active = true;
            openAnim.stop();
            openAnim.off("finished", this.OnOpenFinished, this);
            openAnim.on("finished", this.OnOpenFinished, this);
            // Unity 首次状态 first
            const clipName = this.ResolveClip(openAnim, ["first", "bombpot_open_first", "BombPotOpenFirst", "usually"]);
            openAnim.play(clipName);
        } else {
            this.isPlayingOpenAnim = false;
            this.isPlayedOpenAnim = true;
        }

        if (logoAnim && logoNode) {
            logoNode.active = true;
            logoAnim.stop();
            // Unity logo 状态 loding2_GG_NP（可循环）
            const logoClip = this.ResolveClip(logoAnim, ["loding2_GG_NP", "bombpot_logo", "BombPotLogo"]);
            logoAnim.play(logoClip);
        }
    }

    private OnOpenFinished(): void {
        this.isPlayingOpenAnim = false;
        this.isPlayedOpenAnim = true;
        const openNode = this.host.uirc?.BombPotOpen as cc.Node;
        if (openNode && cc.isValid(openNode)) {
            openNode.active = false;
        }
    }

    private ResolveClip(anim: cc.Animation, preferred: string[]): string {
        const clips = anim.getClips?.() || [];
        if (!anim.defaultClip && clips.length > 0) {
            anim.defaultClip = clips[0];
        }
        for (let i = 0; i < preferred.length; i++) {
            const name = preferred[i];
            if (clips.find(c => c && c.name === name)) {
                return name;
            }
        }
        return anim.defaultClip?.name || "";
    }

    private IsJoinedRoom(): boolean {
        const roomId = Number(GameCache.Instance.room_id || 0);
        if (roomId <= 0) return true;
        return this.GetJoinedRooms().indexOf(roomId) >= 0;
    }

    private RecordJoinedRoom(): void {
        const roomId = Number(GameCache.Instance.room_id || 0);
        if (roomId <= 0) return;
        const rooms = this.GetJoinedRooms();
        const idx = rooms.indexOf(roomId);
        if (idx >= 0) {
            rooms.splice(idx, 1);
        }
        rooms.push(roomId);
        if (rooms.length > JOINED_ROOMS_MAX) {
            rooms.splice(0, rooms.length - JOINED_ROOMS_MAX);
        }
        cc.sys.localStorage.setItem(JOINED_ROOMS_KEY, rooms.join(","));
    }

    private GetJoinedRooms(): number[] {
        const raw = cc.sys.localStorage.getItem(JOINED_ROOMS_KEY) || "";
        return raw
            .split(",")
            .map(v => Number(v))
            .filter(v => Number.isFinite(v) && v > 0);
    }
}

