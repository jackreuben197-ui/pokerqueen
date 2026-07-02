import { StringHelper } from '../../helper/StringHelper';
import TimeHelper from '../../helper/TimeHelper';
import { i18nMgr } from '../../i18n/i18nMgr';
import { Def } from '../../protobuf/holdem/define_pb';
import { ServerMessageEnterRoom } from '../../protobuf/holdem/req_th_enter_room_pb';
import { ServerMessageWinner } from '../../protobuf/holdem/recv_th_winner_pb';
import { UIDefine } from '../../define/UIDefine';
import UIDialogSquid from '../../ui/dialog/UIDialogSquid';
import { UIConfirmDialogParam } from '../../crazyPoker/gameplay/common/view/common/UIConfirmDialog';
import UIComponent from '../../ui/UIComponent';
import { CPlayer } from '../CPlayer';
import { GameCache } from '../GameCache';
import { sampleLiveBounds, getAnimDuration } from '../util/SpineBoundsUtil';

interface TexasGameSquidHost {
    squidEnabled: boolean;
    squidBase: number;
    squidMode: number;
    squidHead: number;
    squidTail: number;
    squidMaxCount: number;
    squidTotalLimit: number;
    squidPool: number;
    squidRound: number;
    squidCurrentRound: number;
    squidOpenNumber: number;
    squidDeposit: number;
    squidExtraCount: number;
    squidCountRates: { count: number; rate: number }[];
    isGameInSquidRound: boolean;
    listSeat: any[];
    mainPlayer: CPlayer;
    uirc: any;

    GetLocalSeatID(serverSeatID: number): number;

    UpdateRoomDes(): void;

    SendSquidInActive(enable: boolean): void;

    Standup(): void;
}

interface SquidEndRowData {
    userID: number;
    nick: string;
    avatar: string;
    money: number;
    squidNum: number;
    rate: number;
    isPunish: boolean;
}

export default class TexasGameSquid {
    private roundEndPopupToken: number = 0;
    // 鱿鱼开局 Spine 动画：静态缓存 SkeletonData + 当前播放节点
    private static _squidStartSkeletonData: sp.SkeletonData = null;
    /** 鱿鱼开局动画目标尺寸（像素，包围盒较大边缩放到此值；与旧帧动画大小相近，按需微调）*/
    private static readonly SQUID_START_TARGET_SIZE = 1880;
    /** 居中微调：开局动画水平偏移（像素，负值向左）。骨骼内容左重（鱿鱼角色在左），需向左拉回视觉中心 */
    private static readonly SQUID_START_OFFSET_X = 110;
    private squidStartSpineNode: cc.Node = null;

    constructor(private host: TexasGameSquidHost) {}

    public UpdateRoomConfig(rec: ServerMessageEnterRoom.AsObject): void {
        const roomInfoAny = rec.roomInfo as any;
        const entryAny = GameCache.Instance as any;
        this.host.squidMode = entryAny.room_squid_mode || 0;
        this.host.squidHead = entryAny.room_squid_head || 0;
        this.host.squidTail = entryAny.room_squid_tail || 0;
        this.host.squidMaxCount = entryAny.room_squid_max || 0;
        this.host.squidBase = (roomInfoAny.squidBase || 0) > 0 ? roomInfoAny.squidBase : entryAny.room_squid_base || 0;
        this.host.squidTotalLimit = roomInfoAny.squidTotalLimit || 0;
        this.host.squidPool = (rec.handInfo as any)?.pools?.squidPool || 0;
        this.host.squidRound = roomInfoAny.rounds || 0;
        this.host.squidCurrentRound = (rec.handInfo as any)?.conRounds || 0;
        this.host.squidOpenNumber = entryAny.room_squid_open_number || 0;
        this.host.squidDeposit = roomInfoAny.deposit || 0;
        this.host.squidExtraCount = Number(entryAny.room_squid_extra_count || roomInfoAny.squidExtraCount || roomInfoAny.squid_extra_count || 0);
        this.host.squidCountRates = (entryAny.room_squid_count_rate || [])
            .map((cfg: any) => ({ count: Number(cfg?.count || 0), rate: Number(cfg?.rate || 0) }))
            .filter(cfg => cfg.count > 0 && cfg.rate > 0)
            .sort((a, b) => a.count - b.count);
        this.host.isGameInSquidRound = (rec.handInfo as any).inSquid || false;
        this.host.squidEnabled = this.host.squidBase > 0 || this.host.isGameInSquidRound || (entryAny.room_squid_on || 0) > 0;
        this.RefreshJoinSwitch();
    }

    public TryShowGuideDialog(): void {
        if (!this.host.squidEnabled) return;
        if (!UIDialogSquid.IsOverDayLastUpload()) return;
        UIComponent.open(UIDefine.UIDialogSquid, {
            squidMode: this.host.squidMode,
            squidBase: this.host.squidBase,
            squidHead: this.host.squidHead,
            squidTail: this.host.squidTail,
            squidExtraCount: this.host.squidExtraCount,
            squidCountRates: this.host.squidCountRates,
            seatCount: GameCache.Instance.seat_count,
            noAnimation: true
        });
    }

    public ApplyPlayerState(player: CPlayer, playerRec: any, myInfo: any, isMainSeat: boolean): void {
        player.inSquid = playerRec.inSquid || false;
        player.squidCount = playerRec.squidCount || 0;
        player.squidEscaped = playerRec.squidEscaped || false;
        player.squidRoundSeated = playerRec.squidRoundSeated || player.inSquid;
        if (isMainSeat) {
            player.squidRoundSeated = myInfo?.squidRoundSeated || player.squidRoundSeated;
        }
    }

    public RefreshMarks(): void {
        // 图标显隐只依赖 squidEnabled / uirc,不依赖座位列表,先刷新避免被 listSeat 时序竞态吞掉。
        this.RefreshGlobalRemain();
        if (!this.host.listSeat) return;
        this.host.listSeat.forEach(seat => {
            seat?.UpdateSquidTag(this.host.squidEnabled, this.host.isGameInSquidRound);
        });
        this.RefreshJoinSwitch();
    }

    public OnClickJoinSwitch(): void {
        if (!this.CanShowJoinSwitch()) return;
        UIComponent.open<UIConfirmDialogParam>(UIDefine.UIConfirmDialog, {
            content: this.GetJoinDialogContent(),
            commit: i18nMgr.Get('UIClub_RoomJoin'),
            cancel: i18nMgr.Get('UITexas_Holding'),
            commit_click: () => {
                this.host.SendSquidInActive(true);
            }
        });
    }

    public OnClickStandUp(): void {
        const p = this.host.mainPlayer;
        if (!p || p.seatID < 0) {
            UIComponent.Instance.Toast(i18nMgr.Get('Good_luck'));
            return;
        }
        if (this.host.squidEnabled && this.host.isGameInSquidRound && p.inSquid) {
            if (this.host.squidMode === 0) {
                this.host.Standup();
                return;
            }
            if (this.host.squidMode === 1) {
                if ((p.squidCount || 0) <= 0) {
                    UIComponent.open<UIConfirmDialogParam>(UIDefine.UIConfirmDialog, {
                        title: i18nMgr.Get('UIGuild_TipsTitle'),
                        content: i18nMgr.Get('UISquid_Tips3'),
                        commit: i18nMgr.Get('adaptation10012'),
                        cancel: i18nMgr.Get('adaptation10013'),
                        commit_click: () => this.host.Standup()
                    });
                } else {
                    UIComponent.open<UIConfirmDialogParam>(UIDefine.UIConfirmDialog, {
                        title: '',
                        content: i18nMgr.Get('UIDelayLeaveTips'),
                        commit: i18nMgr.Get('UILeave'),
                        cancel: i18nMgr.Get('UIPause_sdXLZk7S'),
                        commit_click: () => this.host.Standup()
                    });
                }
                return;
            }
        }
        this.host.Standup();
    }

    public CountInRoundPlayers(): number {
        if (!this.host.listSeat) return 0;
        let count = 0;
        this.host.listSeat.forEach(seat => {
            if (seat?.Player?.inSquid) {
                count++;
            }
        });
        return count;
    }

    public CountNoMarkPlayers(): number {
        if (!this.host.listSeat || !this.host.squidEnabled || !this.host.isGameInSquidRound) return 0;
        let count = 0;
        this.host.listSeat.forEach(seat => {
            const p = seat?.Player;
            if (!p) return;
            if (!p.inSquid || p.squidEscaped) return;
            if (p.squidCount <= 0) {
                count++;
            }
        });
        return count;
    }

    public BuildRoomDesc(): string {
        if (!this.host.squidEnabled) return '';
        let info = '';
        if (this.host.isGameInSquidRound) {
            info += `\n${i18nMgr.Get('UISquidOpen')}:1/1`;
        } else {
            const currentRound = (this.host.squidCurrentRound || 0) + 1;
            const totalRound = this.host.squidRound || 1;
            info += `\n${i18nMgr.Get('UISquidWaitOpen')}:${currentRound}/${totalRound}`;
        }
        info += `\n${i18nMgr.Get('UIGameTableSquidShow')}:${StringHelper.GetLongString(this.host.squidBase)}`;
        info += `\n${i18nMgr.Get('UIFantasy_dairuyajin')}:${StringHelper.GetLongString(this.host.squidDeposit)}`;
        info += `\n${i18nMgr.Get('UISquidOpenPeopleNumber')}:${this.host.squidOpenNumber}/${GameCache.Instance.seat_count}`;
        return info;
    }

    public PlayRoundStartAnim(): void {
        const node = this.host?.uirc?.SquidStart as cc.Node;
        if (!node) {
            UIComponent.Instance.Toast(i18nMgr.Get('UISquidOpen'));
            return;
        }
        // 改用新的 Spine 动画：停掉旧帧动画、隐藏旧静态精灵
        const anim = this.host?.uirc?.SquidStartAnim as cc.Animation;
        anim?.stop();
        const sprite = node.getComponent(cc.Sprite);
        if (sprite) sprite.enabled = false;
        // 旧帧动画把节点固定在 (0,-1200)（桌面正中），这里复刻其落点：居中、缩放归位、不透明
        node.setPosition(0, -1200);
        node.scale = 1;
        node.opacity = 255;
        node.active = true;
        this._playSquidStartSpine(node);
    }

    /** 在 squid_start 节点上动态加载并播放新的 Spine 开局动画 */
    private _playSquidStartSpine(parent: cc.Node): void {
        this._stopSquidStartSpine();

        const create = (skeletonData: sp.SkeletonData) => {
            if (!cc.isValid(parent)) return;
            const spineNode = new cc.Node('SquidStartSpine');
            const skeleton = spineNode.addComponent(sp.Skeleton);
            // 首帧透明，跳过 setup pose
            spineNode.opacity = 0;
            skeleton.skeletonData = skeletonData;
            // 放慢播放速度，让开局动画停留更久（原速太短）
            skeleton.timeScale = 0.45;
            parent.addChild(spineNode);
            skeleton.setAnimation(0, 'animation', false);
            // 下一帧：按实际包围盒归一化到目标尺寸并居中（保持与旧动画相近大小、位置）
            const dur = getAnimDuration(skeleton, 'animation');
            skeleton.scheduleOnce(() => {
                if (!spineNode.isValid) return;
                // 注意：采样包围盒会把动画轨道推进到末尾，必须在“注册 complete 回调”之前采样，
                // 采样后再从头重播并绑定结束回调，否则一上来就触发 complete 把节点隐藏掉。
                const b = sampleLiveBounds(skeleton, dur);
                if (b.max > 0) {
                    const scale = TexasGameSquid.SQUID_START_TARGET_SIZE / b.max;
                    spineNode.scale = scale;
                    spineNode.x = -(b.offX + b.szX / 2) * scale + TexasGameSquid.SQUID_START_OFFSET_X;
                    spineNode.y = -(b.offY + b.szY / 2) * scale;
                }
                skeleton.setAnimation(0, 'animation', false);
                skeleton.setCompleteListener(() => {
                    this._stopSquidStartSpine();
                    if (cc.isValid(parent)) parent.active = false;
                });
                spineNode.opacity = 255;
            }, 0);
            this.squidStartSpineNode = spineNode;
        };

        if (TexasGameSquid._squidStartSkeletonData) {
            create(TexasGameSquid._squidStartSkeletonData);
        } else {
            cc.resources.load('spine/SquidGame/SquidGame', sp.SkeletonData, (err, data: sp.SkeletonData) => {
                if (err) {
                    console.error('加载 SquidGame Spine 失败:', err.message);
                    if (cc.isValid(parent)) parent.active = false;
                    return;
                }
                TexasGameSquid._squidStartSkeletonData = data;
                create(data);
            });
        }
    }

    private _stopSquidStartSpine(): void {
        if (this.squidStartSpineNode) {
            if (this.squidStartSpineNode.isValid) this.squidStartSpineNode.destroy();
            this.squidStartSpineNode = null;
        }
    }

    public async PlayRoundEndAnim(rec?: ServerMessageWinner.AsObject): Promise<void> {
        const rows = this.BuildRoundEndRows(rec);
        if (!rows.length) {
            return;
        }
        const token = ++this.roundEndPopupToken;
        const cacheRoomID = GameCache.Instance.room_id;
        await TimeHelper.Sleep(2000);
        if (token !== this.roundEndPopupToken) {
            return;
        }
        if (cacheRoomID !== GameCache.Instance.room_id) {
            return;
        }
        UIComponent.close(UIDefine.UISquidEnd);
        UIComponent.open(UIDefine.UISquidEnd, { rows: rows });
    }

    public ResetRoundState(): void {
        this.host.isGameInSquidRound = false;
        this.host.squidPool = 0;
        this.host.listSeat?.forEach(seat => {
            const p = seat?.Player;
            if (!p) return;
            p.inSquid = false;
            p.squidCount = 0;
            p.squidEscaped = false;
            p.squidRoundSeated = false;
            seat.ClearSquidTag();
        });
        // 对齐 Unity:每手结束只隐藏数字(惩罚池),鱿鱼图标在鱿鱼桌内常驻保留。
        if (this.host.uirc?.RemainingSquidLabel) {
            this.host.uirc.RemainingSquidLabel.active = false;
        }
        this.RefreshGlobalRemain();
        this.RefreshJoinSwitch();
        this.host.UpdateRoomDes();
    }

    public ResetState(): void {
        this.host.squidEnabled = false;
        this.host.squidBase = 0;
        this.host.squidMode = 0;
        this.host.squidHead = 0;
        this.host.squidTail = 0;
        this.host.squidMaxCount = 0;
        this.host.squidTotalLimit = 0;
        this.host.squidPool = 0;
        this.host.squidRound = 0;
        this.host.squidCurrentRound = 0;
        this.host.squidOpenNumber = 0;
        this.host.squidDeposit = 0;
        this.host.squidExtraCount = 0;
        this.host.squidCountRates = [];
        this.host.isGameInSquidRound = false;
        this.roundEndPopupToken++;
        UIComponent.close(UIDefine.UIDialogSquid);
        UIComponent.close(UIDefine.UISquidEnd);
        // 退房:squidEnabled 已置 false,图标与数字一并隐藏。
        if (this.host.uirc?.RemainingSquidLabel) {
            this.host.uirc.RemainingSquidLabel.active = false;
        }
        if (this.host.uirc?.RemainingSquidCount) {
            this.host.uirc.RemainingSquidCount.active = false;
        }
        this.RefreshJoinSwitch();
    }

    private GetMarkedTotal(): number {
        if (!this.host.listSeat) return 0;
        let count = 0;
        this.host.listSeat.forEach(seat => {
            const p = seat?.Player;
            if (!p || !p.inSquid) return;
            count += Math.max(0, p.squidCount || 0);
        });
        return count;
    }

    private GetRoundTotal(): number {
        if (!this.host.squidEnabled || !this.host.isGameInSquidRound) return 0;
        const mode = this.host.squidMode || 0;
        const headOn = this.host.squidHead === 1;
        const tailOn = this.host.squidTail === 1;
        let total = 0;
        if (mode === 1) {
            total = Math.max(this.host.squidTotalLimit || 0, this.host.squidMaxCount || 0);
            if (tailOn) total += 1;
        } else {
            total = Math.max(this.CountInRoundPlayers() - 1, 0);
            if (headOn) total += 1;
            if (tailOn) total += 1;
        }
        return Math.max(0, total);
    }

    private GetRemainCount(): number {
        const total = this.GetRoundTotal();
        if (total <= 0) return 0;
        return Math.max(0, total - this.GetMarkedTotal());
    }

    private RefreshGlobalRemain(): void {
        const node = this.host.uirc?.RemainingSquidCount;
        const labelNode = this.host.uirc?.RemainingSquidLabel;
        const label = this.host.uirc?.RemainingSquidLabelCount;
        if (!node) return;
        // 对齐 Unity:鱿鱼图标(squidIcon)只要是鱿鱼桌就常驻显示,不随 isGameInSquidRound 隐藏。
        node.active = this.host.squidEnabled;
        if (!this.host.squidEnabled) {
            if (labelNode) labelNode.active = false;
            return;
        }
        // 数字容器(惩罚池)才按鱿鱼轮显隐。
        const showNum = this.host.isGameInSquidRound;
        if (labelNode) labelNode.active = showNum;
        if (showNum && label) {
            label.string = `${this.GetRemainCount()}`;
        }
    }

    private CanShowJoinSwitch(): boolean {
        const p = this.host.mainPlayer;
        if (!p) return false;
        if (p.seatID < 0) return false;
        return this.host.squidEnabled && this.host.isGameInSquidRound && !p.inSquid;
    }

    private GetJoinDialogContent(): string {
        const p = this.host.mainPlayer;
        if (this.host.squidMode === 1 && p && !p.squidRoundSeated) {
            const remain = Math.max(0, this.GetRemainCount());
            return StringHelper.Format(i18nMgr.Get('UISquidJoinInNewTips2'), [remain, remain + 1]);
        }
        return i18nMgr.Get('UISquidJoinTips');
    }

    private RefreshJoinSwitch(): void {
        const switchNode = this.host.uirc?.SquidSwitch as cc.Node;
        const label = this.host.uirc?.SquidJoinLabel as cc.Label;
        if (label) {
            label.string = i18nMgr.Get('UIClub_RoomJoin');
        }
        if (switchNode) {
            switchNode.active = this.CanShowJoinSwitch();
        }
    }


    private BuildRoundEndRows(rec?: ServerMessageWinner.AsObject): SquidEndRowData[] {
        if (!rec?.resultsList?.length) {
            return [];
        }
        const rows: SquidEndRowData[] = [];
        rec.resultsList.forEach(r => {
            const player = this.GetPlayerByServerSeatID(r.seatId);
            if (!player) {
                return;
            }
            r.ehcsList?.forEach(ehc => {
                if (ehc.ehcType !== Def.EHCType.EHC_SQUID) {
                    return;
                }
                const inNum = Number((ehc as any).pb_in || (ehc as any).in || 0);
                const outNum = Number((ehc as any).out || 0);
                if (inNum <= 0 && outNum <= 0) {
                    return;
                }
                rows.push({
                    userID: Number(player.userID || 0),
                    nick: player.nick || '',
                    avatar: player.headPic || '',
                    money: inNum > 0 ? inNum : -outNum,
                    squidNum: Number((r as any).squidCount || 0),
                    rate: this.GetRateBySquidNum(Number((r as any).squidCount || 0)),
                    isPunish: false
                });
            });
        });
        const punishList = rec.pools?.squidDetailsList || [];
        if (rows.length > 0 && punishList.length > 0) {
            punishList.forEach(p => {
                rows.push({
                    userID: Number(p.userRid || 0),
                    nick: p.name || '',
                    avatar: p.avatar || '',
                    money: -Number(p.punishFee || 0),
                    squidNum: 0,
                    rate: 0,
                    isPunish: true
                });
            });
        }
        return rows;
    }

    private GetPlayerByServerSeatID(serverSeatID: number): CPlayer | null {
        const localSeatID = this.host.GetLocalSeatID(serverSeatID);
        const seat = this.host.listSeat?.[localSeatID];
        return seat?.Player || null;
    }

    private GetRateBySquidNum(squidNum: number): number {
        if (!this.host.squidCountRates?.length) {
            return 0;
        }
        let rate = 0;
        this.host.squidCountRates.forEach(cfg => {
            if (squidNum >= cfg.count) {
                rate = cfg.rate;
            }
        });
        return Math.max(0, rate);
    }
}
