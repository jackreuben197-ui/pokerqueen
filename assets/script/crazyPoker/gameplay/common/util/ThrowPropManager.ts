import TexasGame from '../../../../game/texas/TexasGame';
import Seat from '../../../../game/seat/Seat';
import { GameCache } from '../../../../game/GameCache';
const LN = '[ThrowProp]';
/** 道具类型基址: CT_EMOJI_2(6) * 100 = 600 */
const PROP_TYPE_BASE = 600;

/** 道具配置 */
interface PropAnimConfig {
    pattern: 'A' | 'B' | 'C' | 'D';
    /** spine 资源路径（不含 assets/resources/ 和扩展名） */
    spines: string[];
    /** 各spine对应的默认动画state名（模式A/B/C用） */
    anims: string[];
    /** 可选：独立的“飞行段”动画名。设置后，模式A会在飞行过程中播放该动画，
     *  飞行时长按动画真实时长，飞到目标后再播放 anims[0] 命中段（分段动画的正确时序）。 */
    flyAnim?: string;
    /** 可选：true 表示动画本身已包含位移/内部运动（如开枪喷火、摸头），
     *  直接在目标位置静止播放 anims[0]，不要再用tween搬动节点（否则整段动画被拖着走）。 */
    atTarget?: boolean;
    /** 命中音效相对“命中动画开始”的延迟秒数（默认0=命中即响，和动画同步）。 */
    soundDelay?: number;
    /** 飞行段时长覆盖(秒)。不设则用飞行动画真实时长(限幅)；用于让飞行更快/更慢。 */
    flyDur?: number;
}

/**
 * 扔道具动画管理器
 * 负责接收服务端广播后，在牌桌场景中播放对应的 Spine 动画
 */
export default class ThrowPropManager {
    private game: TexasGame;
    private skeletonCache: Map<string, sp.SkeletonData> = new Map();
    /** 音效文件路径前缀 */
    private static readonly SOUND_PREFIX = 'sound/PropOp/';
    /** 头像上播放的特效统一缩放系数（缩小一点，避免盖住头像） */
    private static readonly AVATAR_ANIM_SCALE = 0.7;
    /** 道具偏移量→音效文件名映射 (不含扩展名) */
    private static readonly SOUND_MAP: Record<number, string> = {
        0: 'sfx_tomato_mus', // 番茄
        1: 'sfx_rose_mus', // 花环
        2: 'sfx_kiss_mus', // 亲吻
        3: 'sfx_like_mus', // 大拇指
        4: 'sfx_cheers_mus', // 干杯-旁观者
        5: 'sfx_touch_mus', // 摸头
        6: 'sfx_shark_mus', // 鲨鱼
        7: 'sfx_zhuaji_mus', // 抓鸡
        11: 'sfx_shark_mus' // 炸弹：按需改用鲨鱼音效(鲨鱼本身改为静音)
    };
    /** 12个道具的动画配置，索引0=type600(番茄) ... 索引11=type611(棒球) */
    private static readonly CONFIGS: PropAnimConfig[] = [
        // 0: 番茄(600)→新dirt — 分段：dirt_flying 飞行 → dirt_splash 溅落；音效素材(sfx_tomato_mus)起音稍慢，提前0.2s播放对齐
        { pattern: 'A', spines: ['spine/Expression_Tomato/skeleton'], anims: ['dirt_splash'], flyAnim: 'dirt_flying', soundDelay: -0.2 },
        // 1: 花环(601)→新nice-hand — 模式A
        { pattern: 'A', spines: ['spine/Expression_Flower/skeleton'], anims: ['hand_wave'] },
        // 2: 亲吻(602)→新Kiss — 模式A
        { pattern: 'A', spines: ['spine/Expression_Kiss/kiss'], anims: ['lip_kissing'] },
        // 3: 大拇指(603)→新Thumbs up — 模式A（分段：fist_flying 飞行 → thumbs_up 命中）；飞行加快(0.5s)
        { pattern: 'A', spines: ['spine/Expression_Good/skeleton'], anims: ['thumbs_up'], flyAnim: 'fist_flying', flyDur: 0.5 },
        // 4: 干杯(604)→新beer — 单骨骼，改模式A
        { pattern: 'A', spines: ['spine/Expression_Beer/cheers_2'], anims: ['beer_cheers'] },
        // 5: 摸头(605)→新hand pat — 模式A，atTarget：动画自带摸头动作，直接在目标头顶静止播放一次
        { pattern: 'A', spines: ['spine/Expression_Touch/touch'], anims: ['hand_patting'], atTarget: true },
        // 6: 鲨鱼 (606) — 模式C（阴影/上升/小鱼三层叠加=鲨鱼出水，随后在轨道0衔接 shark_eaten 咬人收尾）
        { pattern: 'C', spines: ['spine/Expression_Shark/shark'], anims: ['shark_rising', 'shark_shadow', 'babyshark'] },
        // 7: 抓鸡(607)→新hen — 模式C (伸手飞行 hand_flying + 目标处母鸡挣扎 hen_struggling)
        { pattern: 'C', spines: ['spine/Expression_Chicken/chicken_spine'], anims: ['hand_flying', 'hen_struggling'] },
        // 8: 拳击(608)→新gun — 模式D(自定义)：枪停在发送者头像，子弹/火球朝目标飞去(旋转对准+缩放够到)
        { pattern: 'D', spines: ['spine/Expression_Box/box_local'], anims: ['bullets-fireballs'] },
        // 9: 撒钱 (609) — 模式C (简化，无伸手)
        { pattern: 'C', spines: ['spine/Expression_Money/attachments'], anims: ['attachments_1_receive'] },
        // 10: 鱼头 (610) — 模式D
        {
            pattern: 'D',
            spines: [
                'spine/Expression_Fish/sy3',
                'spine/Expression_Fish_Screen_Sender/sy2',
                'spine/Expression_Fish_Screen_Receiver/sy',
                'spine/Expression_Fish_Wave/hl'
            ],
            anims: []
        },
        // 11: 棒球(611)→新blast — 单骨骼，模式A：bomb_flying 飞行 → blast 爆炸（分段衔接）
        { pattern: 'A', spines: ['spine/Expression_BaseBall_Sender/skeleton'], anims: ['blast'], flyAnim: 'bomb_flying' }
    ];

    constructor(game: TexasGame) {
        this.game = game;
        // 进桌即预加载所有道具音效，保证首次投掷音效也能与动画同步（不受加载延迟影响）
        const extra = ['sfx_money', 'sfx_beer_screen'];
        const names = new Set<string>([...Object.keys(ThrowPropManager.SOUND_MAP).map(k => ThrowPropManager.SOUND_MAP[+k]), ...extra]);
        names.forEach(n => this.preloadSound(n));
    }

    // ─── 公开接口 ───
    /** 处理收到的扔道具广播 */
    handlePropMessage(broadcastMsg: { type: number; user_id: number; target_user_id: number }): void {
        console.log(LN, 'handlePropMessage 收到:', JSON.stringify(broadcastMsg));
        const offset = broadcastMsg.type - PROP_TYPE_BASE;
        if (offset < 0 || offset >= 12) return;
        const senderSeat = this.game.GetSeatByUserId(broadcastMsg.user_id);
        const targetSeat = this.game.GetSeatByUserId(broadcastMsg.target_user_id);
        console.log(LN, 'senderSeat=', !!senderSeat, 'targetSeat=', !!targetSeat, 'target_user_id=', broadcastMsg.target_user_id);
        if (!senderSeat || !targetSeat) return;
        const config = ThrowPropManager.CONFIGS[offset];
        // 立即预加载该道具音效，飞行期间完成加载，命中时即时播放，避免音效比动画慢
        this.preloadSound(ThrowPropManager.SOUND_MAP[offset]);
        console.log(LN, '播放道具动画 type=', broadcastMsg.type, 'pattern=', config.pattern);
        switch (config.pattern) {
            case 'A':
                this.playPatternA(offset, config, senderSeat, targetSeat);
                break;
            case 'B':
                this.playPatternB(offset, config, senderSeat, targetSeat);
                break;
            case 'C':
                this.playPatternC(offset, config, senderSeat, targetSeat);
                break;
            case 'D':
                this.playPatternD(offset, senderSeat, targetSeat);
                break;
        }
    }

    /** 清理所有缓存的骨骼数据和活跃节点 */
    cleanup(): void {
        this.skeletonCache.clear();
    }

    // ─── 骨骼加载 & 节点工厂 ───
    /** 带缓存的骨骼数据加载 */
    private loadSkeleton(path: string): Promise<sp.SkeletonData> {
        if (this.skeletonCache.has(path)) {
            console.log(LN, '骨骼命中缓存:', path);
            return Promise.resolve(this.skeletonCache.get(path));
        }
        console.log(LN, '开始加载骨骼:', path);
        return new Promise<sp.SkeletonData>((resolve, reject) => {
            cc.resources.load(path, sp.SkeletonData, (err, skeletonData: sp.SkeletonData) => {
                if (err) {
                    console.error(LN, '加载骨骼失败:', path, err.message);
                    reject(err);
                    return;
                }
                console.log(LN, '加载骨骼成功:', path, 'data=', !!skeletonData);
                this.skeletonCache.set(path, skeletonData);
                resolve(skeletonData);
            });
        });
    }

    /** 批量加载多个骨骼 */
    private loadSkeletons(paths: string[]): Promise<sp.SkeletonData[]> {
        console.log(LN, '批量加载骨骼:', JSON.stringify(paths));
        return Promise.all(paths.map(p => this.loadSkeleton(p)));
    }

    /** 获取动画根节点（seats_content） */
    private getAnimRoot(): cc.Node {
        return this.game.uirc ? this.game.uirc.seats_content : null;
    }

    /** 获取屏幕中心在 animRoot 中的本地坐标（全屏动画用） */
    private getScreenCenter(): cc.Vec3 {
        const root = this.getAnimRoot();
        if (!root) return cc.Vec3.ZERO;
        const canvas = cc.find('Canvas');
        if (canvas) {
            const worldCenter = canvas.convertToWorldSpaceAR(cc.Vec2.ZERO);
            return root.convertToNodeSpaceAR(new cc.Vec3(worldCenter.x, worldCenter.y, 0));
        }
        return cc.Vec3.ZERO;
    }

    /** 获取座位头像在 animRoot 中的本地坐标 */
    private getHeadLocalPos(seat: Seat): cc.Vec3 {
        const headNode = seat.uirc ? seat.uirc.Frame_Head : null;
        if (!headNode) return cc.Vec3.ZERO;
        const worldPos = headNode.parent.convertToWorldSpaceAR(headNode.position);
        const root = this.getAnimRoot();
        return root ? root.convertToNodeSpaceAR(worldPos) : cc.Vec3.ZERO;
    }

    /** 创建一个 Spine 动画节点并添加到父节点 */
    private createSpineNode(skeletonData: sp.SkeletonData, animName: string, loop: boolean, parentNode: cc.Node, localPos: cc.Vec3, scale: number = 1): cc.Node {
        const node = new cc.Node('PropSpine');
        const skeleton = node.addComponent(sp.Skeleton);
        skeleton.skeletonData = skeletonData;
        node.parent = parentNode;
        node.scale = scale;
        node.setPosition(localPos);
        // 设置完 parent 后再播放动画
        skeleton.setAnimation(0, animName, loop);
        return node;
    }

    /** 动画播放完毕后自动销毁节点 + 兜底超时 */
    private destroyAfterComplete(node: cc.Node, fallbackDelay: number = 5): void {
        if (!node) return;
        const skeleton = node.getComponent(sp.Skeleton);
        if (skeleton) {
            skeleton.setCompleteListener(() => {
                if (cc.isValid(node)) node.destroy();
            });
        }
        // 兜底：超时后强制销毁
        cc.tween(node)
            .delay(fallbackDelay)
            .call(() => {
                if (cc.isValid(node)) node.destroy();
            })
            .start();
    }

    /** 音效缓存：预加载后即可即时播放，避免每次 load 的异步延迟导致音效比动画慢半拍 */
    private audioClips: Map<string, cc.AudioClip> = new Map();

    /** 预加载音效到缓存（在投掷开始时调用，飞行期间完成加载，命中时即可即时播放） */
    private preloadSound(name: string): void {
        if (!name || this.audioClips.has(name)) return;
        this.audioClips.set(name, null); // 占位：标记加载中，避免重复加载
        const path = ThrowPropManager.SOUND_PREFIX + name;
        cc.resources.load(path, cc.AudioClip, (err, clip: cc.AudioClip) => {
            if (!err && clip) this.audioClips.set(name, clip);
            else this.audioClips.delete(name);
        });
    }

    /** 播放道具音效：命中缓存则即时播放(无延迟)；否则加载后播放并缓存 */
    private playSound(name: string): void {
        if (!name) return;
        const cached = this.audioClips.get(name);
        if (cached) {
            cc.audioEngine.playEffect(cached, false);
            return;
        }
        const path = ThrowPropManager.SOUND_PREFIX + name;
        cc.resources.load(path, cc.AudioClip, (err, clip: cc.AudioClip) => {
            if (!err && clip) {
                this.audioClips.set(name, clip);
                cc.audioEngine.playEffect(clip, false);
            }
        });
    }

    /** 仅延迟销毁（不监听动画完成） */
    private destroyAfterDelay(node: cc.Node, delay: number): void {
        if (!node) return;
        cc.tween(node)
            .delay(delay)
            .call(() => {
                if (cc.isValid(node)) node.destroy();
            })
            .start();
    }

    /**
     * 判断当前玩家角色。
     * 用「座位号 seatID」判定本地玩家，而不是用 gc.nUserId 比对广播里的 user_id。
     * 原因：广播里的 target_user_id 是接收者的座位 rid，而 gc.nUserId 在部分账号上
     * 并不等于 rid（可能是数据库 user_id）。当 nUserId!=rid 时，接收者会被错判为
     * bystander → 全屏(whole page)动画不播放（表现为：我方发送时对方全屏不触发）。
     * 座位已经能正确解析（座位动画正常播放），所以用 seatID 与 mainPlayer.seatID
     * 比对最可靠，且与全局 Seat.IsMySeat 的自我判定一致。
     */
    private getRole(senderSeat: Seat, targetSeat: Seat): 'sender' | 'receiver' | 'bystander' {
        const mainPlayer = this.game ? this.game.mainPlayer : null;
        const mySeatID = mainPlayer ? mainPlayer.seatID : -999;
        if (mySeatID >= 0) {
            if (targetSeat && targetSeat.seatID === mySeatID) return 'receiver';
            if (senderSeat && senderSeat.seatID === mySeatID) return 'sender';
            return 'bystander';
        }
        // 兜底：座位号不可用时退回 id 比对（用 == 容忍 JSON 解析出的 string/number 差异）
        const gc = GameCache.Instance;
        const myId = gc.nUserId || gc.userId;
        const senderId = senderSeat && senderSeat.Player ? senderSeat.Player.userID : 0;
        const targetId = targetSeat && targetSeat.Player ? targetSeat.Player.userID : 0;
        // eslint-disable-next-line eqeqeq
        if (myId == senderId) return 'sender';
        // eslint-disable-next-line eqeqeq
        if (myId == targetId) return 'receiver';
        return 'bystander';
    }

    // ─── 模式A: 通用飞行（番茄/花环/亲吻/大拇指） ───

    private playPatternA(offset: number, config: PropAnimConfig, senderSeat: Seat, targetSeat: Seat): void {
        const root = this.getAnimRoot();
        if (!root) return;
        const soundName = ThrowPropManager.SOUND_MAP[offset];
        const soundDelay = config.soundDelay != null ? config.soundDelay : 0; // 默认命中即响
        this.loadSkeleton(config.spines[0])
            .then(skeletonData => {
                if (!cc.isValid(root)) return;
                const startPos = this.getHeadLocalPos(senderSeat);
                const endPos = this.getHeadLocalPos(targetSeat);
                const impactAnim = config.anims[0];
                const node = new cc.Node('PropSpine');
                const skeleton = node.addComponent(sp.Skeleton);
                skeleton.skeletonData = skeletonData;
                node.parent = root;
                node.scale = ThrowPropManager.AVATAR_ANIM_SCALE; // 缩小头像上的特效
                node.setPosition(startPos);

                // 从投掷开始计时调度音效：在“命中时刻 + soundDelay”播放。
                // soundDelay 可为负=提前播放(用于音效素材本身起音稍慢、听起来偏晚的情况)。
                const scheduleSound = (impactTime: number) => {
                    if (!soundName) return;
                    const t = Math.max(0, impactTime + soundDelay);
                    if (t <= 0.001) {
                        this.playSound(soundName);
                    } else {
                        cc.tween(root).delay(t).call(() => this.playSound(soundName)).start();
                    }
                };

                // 动画自带内部运动（开枪/摸头）：直接在目标处静止播放，不要搬动节点
                if (config.atTarget) {
                    node.setPosition(endPos);
                    if (config.anims[0]) skeleton.setAnimation(0, config.anims[0], false);
                    this.destroyAfterComplete(node, 4);
                    scheduleSound(0);
                    return;
                }

                // 到达目标后：播放命中段（音效已独立调度，保证只触发一次）
                let arrived = false;
                const onArrive = () => {
                    if (arrived || !cc.isValid(node)) return;
                    arrived = true;
                    node.setPosition(endPos);
                    if (impactAnim) {
                        skeleton.setAnimation(0, impactAnim, false);
                        this.destroyAfterComplete(node, 4);
                    } else {
                        // 没有独立命中段（如棒球：飞行即全部），到达后短暂保留再销毁
                        this.destroyAfterDelay(node, 0.5);
                    }
                };

                if (config.flyAnim) {
                    // 分段动画：飞行过程中播放“飞行段”，到达再衔接命中段
                    const entry = skeleton.setAnimation(0, config.flyAnim, false);
                    let flyDur = config.flyDur != null ? config.flyDur : this.getEntryDuration(entry, 0.5);
                    flyDur = Math.max(0.3, Math.min(flyDur, 2.0));
                    scheduleSound(flyDur); // 命中时刻=飞行结束
                    cc.tween(node).to(flyDur, { x: endPos.x, y: endPos.y }, { easing: 'quadInOut' }).start();
                    // 飞行动画自然播完=到达目标，再播命中段（用动画真实结束事件衔接，避免硬编码延时）
                    skeleton.setCompleteListener(() => {
                        skeleton.setCompleteListener(() => {});
                        onArrive();
                    });
                    // 兜底：万一complete事件未触发，飞行时长后强制衔接命中段
                    cc.tween(root)
                        .delay(flyDur + 0.1)
                        .call(() => onArrive())
                        .start();
                } else {
                    // 无独立飞行段：移动0.5s到目标后播放命中段
                    scheduleSound(0.5); // 命中时刻=移动结束
                    cc.tween(node)
                        .to(0.5, { x: endPos.x, y: endPos.y }, { easing: 'quadInOut' })
                        .call(() => onArrive())
                        .start();
                }
            })
            .catch(err => {
                console.error(LN, 'playPatternA 骨骼加载失败:', config.spines[0], err);
            });
    }

    /** 安全读取 Spine TrackEntry 对应动画的真实时长（秒）；读取失败返回 fallback。 */
    private getEntryDuration(entry: any, fallback: number): number {
        try {
            if (entry && entry.animation && typeof entry.animation.duration === 'number' && entry.animation.duration > 0) {
                return entry.animation.duration;
            }
        } catch (e) {
            // ignore
        }
        return fallback;
    }

    // ─── 模式B: 飞行+循环（摸头） ───

    private playPatternB(offset: number, config: PropAnimConfig, senderSeat: Seat, targetSeat: Seat): void {
        const root = this.getAnimRoot();
        if (!root) return;
        const soundName = ThrowPropManager.SOUND_MAP[offset];
        this.loadSkeleton(config.spines[0])
            .then(skeletonData => {
                if (!cc.isValid(root)) return;
                const startPos = this.getHeadLocalPos(senderSeat);
                const endPos = this.getHeadLocalPos(targetSeat);
                const animName = config.anims[0];
                const node = new cc.Node('PropSpine');
                const skeleton = node.addComponent(sp.Skeleton);
                skeleton.skeletonData = skeletonData;
                node.parent = root;
                node.scale = ThrowPropManager.AVATAR_ANIM_SCALE;
                node.setPosition(startPos);
                cc.tween(node)
                    .to(0.5, { x: endPos.x, y: endPos.y }, { easing: 'quadInOut' })
                    .call(() => {
                        if (!cc.isValid(node)) return;
                        skeleton.setAnimation(0, animName, true);
                        // 到达后播放音效
                        this.playSound(soundName);
                        // 循环播放3秒后销毁
                        this.destroyAfterDelay(node, 3);
                    })
                    .start();
            })
            .catch(() => {});
    }

    // ─── 模式C: 简化双部件（鲨鱼/抓鸡/撒钱） ───

    private playPatternC(offset: number, config: PropAnimConfig, senderSeat: Seat, targetSeat: Seat): void {
        const root = this.getAnimRoot();
        if (!root) return;
        const targetPos = this.getHeadLocalPos(targetSeat);
        const soundName = ThrowPropManager.SOUND_MAP[offset];
        this.loadSkeletons(config.spines)
            .then(allData => {
                if (!cc.isValid(root)) return;
                // 鲨鱼(6)：所有鲨鱼动画都驱动同一批slot/bone，不能多轨叠加(会互相覆盖、只剩最后一个)。
                // 必须单轨顺序播放：babyshark(出水完整鲨鱼) → shark_eaten(咬人收尾)。
                if (offset === 6) {
                    const node = new cc.Node('PropSpine');
                    const skeleton = node.addComponent(sp.Skeleton);
                    skeleton.skeletonData = allData[0];
                    node.parent = root;
                    node.scale = ThrowPropManager.AVATAR_ANIM_SCALE;
                    node.setPosition(targetPos);
                    skeleton.setAnimation(0, 'babyshark', false);     // 鲨鱼出水
                    skeleton.addAnimation(0, 'shark_eaten', false, 0); // 紧接着咬人(用spine队列自动衔接)
                    this.destroyAfterDelay(node, 4); // babyshark(1.87)+shark_eaten(1.53)≈3.4s
                    // 鲨鱼按需静音，不播放音效
                    return;
                }
                if (config.anims.length === 1) {
                    // 抓鸡(7)/撒钱(9)：只在目标位置播放主效果
                    const node = this.createSpineNode(allData[0], config.anims[0], false, root, targetPos, ThrowPropManager.AVATAR_ANIM_SCALE);
                    this.destroyAfterComplete(node, 4);
                    // 撒钱：接收者播摸头声，其他人播放撒钱声
                    if (offset === 9) {
                        const role = this.getRole(senderSeat, targetSeat);
                        if (role === 'receiver') {
                            this.playSound('sfx_touch_mus');
                        } else {
                            this.playSound('sfx_money');
                        }
                    } else {
                        // 抓鸡：播放抓鸡声
                        this.playSound(soundName);
                    }
                } else if (config.anims.length >= 2) {
                    // 抓鸡(7)：伸手从发送者飞到目标 + 目标位置播抓鸡；鲨鱼(6)：发送者游泳 + 目标被吃
                    const senderPos = this.getHeadLocalPos(senderSeat);
                    if (offset === 7) {
                        // 分段动画：1.伸手飞行 hand_flying（飞行过程中播放，时长按真实动画）
                        //          2.飞到目标后再播 hen_struggling 抓鸡（用动画结束事件衔接，时序正确）
                        const handNode = new cc.Node('PropSpine');
                        const handSkeleton = handNode.addComponent(sp.Skeleton);
                        handSkeleton.skeletonData = allData[0];
                        handNode.parent = root;
                        handNode.scale = ThrowPropManager.AVATAR_ANIM_SCALE;
                        handNode.setPosition(senderPos);
                        const flyEntry = handSkeleton.setAnimation(0, config.anims[0], false);
                        let flyDur = this.getEntryDuration(flyEntry, 0.5);
                        flyDur = Math.max(0.3, Math.min(flyDur, 2.0));
                        cc.tween(handNode).to(flyDur, { x: targetPos.x, y: targetPos.y }, { easing: 'quadInOut' }).start();
                        let henPlayed = false;
                        const playHen = () => {
                            if (henPlayed) return;
                            henPlayed = true;
                            if (cc.isValid(handNode)) handNode.destroy();
                            const targetNode = this.createSpineNode(allData[0], config.anims[1], false, root, targetPos, ThrowPropManager.AVATAR_ANIM_SCALE);
                            this.destroyAfterComplete(targetNode, 4);
                            this.playSound(soundName);
                        };
                        handSkeleton.setCompleteListener(() => {
                            handSkeleton.setCompleteListener(() => {});
                            playHen();
                        });
                        // 兜底
                        cc.tween(root).delay(flyDur + 0.1).call(() => playHen()).start();
                    } else {
                        // 鲨鱼(6)：发送者位置播游泳，目标位置播吃（无飞行）
                        const senderNode = this.createSpineNode(allData[0], config.anims[0], false, root, senderPos, ThrowPropManager.AVATAR_ANIM_SCALE);
                        this.destroyAfterComplete(senderNode, 4);
                        // 目标：被吃动画，动画开始时播放音效（对应Unity spine "sfx"事件）
                        const targetNode = this.createSpineNode(allData[0], config.anims[1], false, root, targetPos, ThrowPropManager.AVATAR_ANIM_SCALE);
                        this.destroyAfterComplete(targetNode, 4);
                        this.playSound(soundName);
                    }
                }
            })
            .catch(() => {});
    }

    // ─── 模式D: 角色分镜（干杯/拳击/鱼头/棒球） ───

    private playPatternD(propOffset: number, senderSeat: Seat, targetSeat: Seat): void {
        const root = this.getAnimRoot();
        console.log(LN, 'playPatternD root=', !!root, 'propOffset=', propOffset);
        if (!root) return;
        const role = this.getRole(senderSeat, targetSeat);
        switch (propOffset) {
            case 4:
                this.playBeer(root, senderSeat, targetSeat, role);
                break;
            case 8:
                this.playGun(root, senderSeat, targetSeat);
                break;
            case 10:
                this.playFish(root, senderSeat, targetSeat, role);
                break;
            case 11:
                this.playBaseball(root, senderSeat, targetSeat, role);
                break;
        }
    }

    // ─── 干杯 (604) ───

    private playBeer(root: cc.Node, senderSeat: Seat, targetSeat: Seat, role: string): void {
        // spine[0]=Expression_Beer/cheers_2, spine[1]=Expression_Beer_Screen/cheers_1
        this.loadSkeletons(['spine/Expression_Beer/cheers_2', 'spine/Expression_Beer_Screen/cheers_1'])
            .then(([beerData, screenData]) => {
                if (!cc.isValid(root)) return;
                if (role === 'sender' || role === 'receiver') {
                    // 发送者/接收者：全屏干杯音效
                    this.playSound('sfx_beer_screen');
                    // 全屏干杯动画
                    const screenCenter = this.getScreenCenter();
                    const screenNode = this.createSpineNode(screenData, '1', false, root, screenCenter);
                    this.destroyAfterComplete(screenNode, 5);
                    // 座位干杯动画：发送者/接收者视角两个座位都播 "3"(BEER_SELF)
                    const senderPos = this.getHeadLocalPos(senderSeat);
                    const targetPos = this.getHeadLocalPos(targetSeat);
                    const senderAnim = this.createSpineNode(beerData, '3', false, root, senderPos);
                    const targetAnim = this.createSpineNode(beerData, '3', false, root, targetPos);
                    this.destroyAfterComplete(senderAnim, 5);
                    this.destroyAfterComplete(targetAnim, 5);
                } else {
                    // 旁观者：只在两个座位播 "2"(BEER_OTHER)，播cheers_mus
                    this.playSound(ThrowPropManager.SOUND_MAP[4]);
                    const senderPos = this.getHeadLocalPos(senderSeat);
                    const targetPos = this.getHeadLocalPos(targetSeat);
                    const s1 = this.createSpineNode(beerData, '2', false, root, senderPos);
                    const s2 = this.createSpineNode(beerData, '2', false, root, targetPos);
                    this.destroyAfterComplete(s1, 5);
                    this.destroyAfterComplete(s2, 5);
                }
            })
            .catch(() => {});
    }

    // ─── 枪 (608) ───
    /** 枪：该骨骼的3个动画各只显示一部分(gun=枪 / bullet_shots=枪火爆点 / bullets-fireballs=火球)，
     *  且都改写全部slot颜色无法叠加在同一骨骼上。因此用3个独立实例组合出完整效果：
     *  ① 枪停在发送者头像并对准目标 ② 火球从发送者飞向目标(旋转对准+按距离缩放够到)
     *  ③ 子弹飞到后在目标头像处爆出枪火(命中) */
    private playGun(root: cc.Node, senderSeat: Seat, targetSeat: Seat): void {
        this.loadSkeleton('spine/Expression_Box/box_local')
            .then(data => {
                if (!cc.isValid(root)) return;
                const senderPos = this.getHeadLocalPos(senderSeat);
                const targetPos = this.getHeadLocalPos(targetSeat);
                const dx = targetPos.x - senderPos.x;
                const dy = targetPos.y - senderPos.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                // 原生枪口/子弹朝 +Y(向上)。node.angle逆时针为正，使局部+Y对准目标 = atan2(-dx, dy)
                const aimAngle = (Math.atan2(-dx, dy) * 180) / Math.PI;
                const aimX = dist > 0 ? dx / dist : 0;
                const aimY = dist > 0 ? dy / dist : 1;

                const spawn = (anim: string, pos: cc.Vec3, angle: number, scale: number, life: number) => {
                    const node = new cc.Node('PropSpine');
                    const sk = node.addComponent(sp.Skeleton);
                    sk.skeletonData = data;
                    node.parent = root;
                    node.setPosition(pos);
                    node.angle = angle;
                    node.scale = scale;
                    sk.setAnimation(0, anim, false);
                    this.destroyAfterComplete(node, life);
                    return node;
                };

                // ① 枪：停在发送者头像、对准目标（原生尺寸），枪口约在原点上方 +86
                spawn('gun', senderPos, aimAngle, 1, 4);
                // ② 火球：原生从 y≈-240 飞到 y≈+500(span≈740)。缩放+前移，使其“从枪口(+86)出发、飞到目标”，
                //    避免看起来从枪下方冒出。 scale 让飞行距离=目标距离-枪口偏移；位置前移使起点落在枪口。
                const MUZZLE = 86;      // 枪口相对原点的native高度
                const FB_START = -240;  // 火球起始native y
                const FB_SPAN = 740;    // 火球飞行native跨度(起点→终点)
                let fbScale = dist > 0 ? (dist - MUZZLE) / FB_SPAN : 0.7;
                fbScale = Math.max(0.5, Math.min(1.8, fbScale));
                const fbOffset = MUZZLE - FB_START * fbScale; // 把火球起点搬到枪口处
                const fbPos = cc.v3(senderPos.x + aimX * fbOffset, senderPos.y + aimY * fbOffset, senderPos.z);
                spawn('bullets-fireballs', fbPos, aimAngle, fbScale, 4);
                // ③ 命中：子弹飞到后在目标头像处爆出枪火
                cc.tween(root)
                    .delay(0.7)
                    .call(() => {
                        if (!cc.isValid(root)) return;
                        spawn('bullet_shots', targetPos, 0, 1, 4);
                    })
                    .start();
            })
            .catch(() => {});
    }

    // ─── 拳击 (608) ───

    private playBoxing(root: cc.Node, senderSeat: Seat, targetSeat: Seat, role: string): void {
        // spine[0]=Expression_Box/box_local, spine[1]=Expression_Box_Screen/box_full
        this.loadSkeletons(['spine/Expression_Box/box_local', 'spine/Expression_Box_Screen/box_full'])
            .then(([boxData, screenData]) => {
                if (!cc.isValid(root)) return;
                const senderPos = this.getHeadLocalPos(senderSeat);
                const targetPos = this.getHeadLocalPos(targetSeat);
                const screenCenter = this.getScreenCenter();
                if (role === 'sender') {
                    // 发送者：全屏蓄势 → 座位被打
                    this.playSound('sfx_boxing_sender1'); // 全屏蓄势声（对应Unity SFX_BOX_SCREEN_READY）
                    const screenNode = this.createSpineNode(screenData, 'box_full_1', false, root, screenCenter);
                    const skeleton = screenNode.getComponent(sp.Skeleton);
                    skeleton.setCompleteListener(() => {
                        if (!cc.isValid(screenNode)) return;
                        screenNode.destroy();
                        // 全屏播完后 → 目标座位被打
                        this.playSound('sfx_boxing_sender2'); // 目标被打声（对应Unity SFX_BOX_SEAT_TARGET）
                        const hitNode = this.createSpineNode(boxData, 'box_local_1', false, root, targetPos);
                        this.destroyAfterComplete(hitNode, 4);
                    });
                    this.destroyAfterDelay(screenNode, 6);
                } else if (role === 'receiver') {
                    // 接收者：发送者座位摩拳擦掌 → 全屏被打
                    this.playSound('sfx_boxing_beaten1'); // 摩拳擦掌声（对应Unity SFX_BOX_SEAT_READY）
                    const readyNode = this.createSpineNode(boxData, 'box_local_2', false, root, senderPos);
                    const skeleton = readyNode.getComponent(sp.Skeleton);
                    skeleton.setCompleteListener(() => {
                        if (!cc.isValid(readyNode)) return;
                        readyNode.destroy();
                        // 蓄势完成 → 全屏被打
                        this.playSound('sfx_boxing_beaten2'); // 全屏被打声（对应Unity SFX_BOX_SCREEN_TARGET）
                        const hitNode = this.createSpineNode(screenData, 'box_full_2', false, root, screenCenter);
                        this.destroyAfterComplete(hitNode, 5);
                    });
                    this.destroyAfterDelay(readyNode, 4);
                } else {
                    // 旁观者：发送者蓄势 → 目标被打
                    this.playSound('sfx_boxing_beaten1'); // 蓄势声（对应Unity SFX_BOX_SEAT_READY）
                    const readyNode = this.createSpineNode(boxData, 'box_local_2', false, root, senderPos);
                    const skeleton = readyNode.getComponent(sp.Skeleton);
                    skeleton.setCompleteListener(() => {
                        if (!cc.isValid(readyNode)) return;
                        readyNode.destroy();
                        this.playSound('sfx_boxing_sender2'); // 被打声（对应Unity SFX_BOX_SEAT_TARGET）
                        const hitNode = this.createSpineNode(boxData, 'box_local_1', false, root, targetPos);
                        this.destroyAfterComplete(hitNode, 4);
                    });
                    this.destroyAfterDelay(readyNode, 4);
                }
            })
            .catch(() => {});
    }

    // ─── 鱼头 (610) ───

    private playFish(root: cc.Node, senderSeat: Seat, targetSeat: Seat, role: string): void {
        // spine[0]=Fish/sy3, [1]=Fish_Screen_Sender/sy2, [2]=Fish_Screen_Receiver/sy, [3]=Fish_Wave/hl
        const paths = [
            'spine/Expression_Fish/sy3',
            'spine/Expression_Fish_Screen_Sender/sy2',
            'spine/Expression_Fish_Screen_Receiver/sy',
            'spine/Expression_Fish_Wave/hl'
        ];
        this.loadSkeletons(paths)
            .then(([fishData, senderScreenData, receiverScreenData, waveData]) => {
                if (!cc.isValid(root)) return;
                const senderPos = this.getHeadLocalPos(senderSeat);
                const targetPos = this.getHeadLocalPos(targetSeat);
                const screenCenter = this.getScreenCenter();
                if (role === 'sender') {
                    // 发送者：全屏发送者动画 + 海浪
                    this.playSound('sfx_fish2'); // 发送者视角鱼头声
                    const screenNode = this.createSpineNode(senderScreenData, 'sy2', false, root, screenCenter);
                    this.destroyAfterComplete(screenNode, 6);
                    const waveNode = this.createSpineNode(waveData, 'hl1', false, root, screenCenter);
                    this.destroyAfterComplete(waveNode, 6);
                } else if (role === 'receiver') {
                    // 接收者：全屏接收者动画 + 海浪
                    this.playSound('sfx_fish'); // 接收者视角鱼头声
                    const screenNode = this.createSpineNode(receiverScreenData, 'sy', false, root, screenCenter);
                    this.destroyAfterComplete(screenNode, 6);
                    const waveNode = this.createSpineNode(waveData, 'hl2', false, root, screenCenter);
                    this.destroyAfterComplete(waveNode, 6);
                } else {
                    // 旁观者：鱼从发送者飞到目标 + 海浪
                    this.playSound('sfx_fish'); // 旁观者视角鱼头声
                    const fishNode = new cc.Node('PropSpine');
                    const skeleton = fishNode.addComponent(sp.Skeleton);
                    skeleton.skeletonData = fishData;
                    fishNode.parent = root;
                    fishNode.setPosition(senderPos);
                    // 计算方向用于旋转和镜像
                    const moveDir = cc.v2(targetPos.x - senderPos.x, targetPos.y - senderPos.y);
                    const angle = cc.v2(0, 1).signAngle(moveDir);
                    fishNode.angle = (-angle * 180) / Math.PI;
                    const factor = moveDir.x > 0 ? -1 : 1;
                    fishNode.scaleX = factor * Math.abs(fishNode.scaleX || 1);
                    // 播放游泳动画
                    skeleton.setAnimation(0, 'sy3_1', true);
                    // 移动到目标位置后播放第二段动画 + 气泡
                    cc.tween(fishNode)
                        .to(2.0, { x: targetPos.x, y: targetPos.y }, { easing: 'sineInOut' })
                        .call(() => {
                            if (!cc.isValid(fishNode)) return;
                            // 移动完成后播放第二段
                            skeleton.setAnimation(0, 'sy3_2', false);
                            // 气泡效果
                            const bubbleNode = this.createSpineNode(fishData, 'bl', false, root, targetPos);
                            this.destroyAfterComplete(bubbleNode, 4);
                        })
                        .delay(1.0)
                        .call(() => {
                            if (cc.isValid(fishNode)) fishNode.destroy();
                        })
                        .start();
                    // 海浪
                    const waveNode = this.createSpineNode(waveData, 'hl3', false, root, screenCenter);
                    this.destroyAfterComplete(waveNode, 6);
                }
            })
            .catch(() => {});
    }

    // ─── 棒球 (611) ───

    private playBaseball(root: cc.Node, senderSeat: Seat, targetSeat: Seat, role: string): void {
        // spine[0]=BaseBall_Sender/skeleton, [1]=BaseBall_Receiver/ballfolder1, [2]=BaseBall_Other/skeleton
        const paths = [
            'spine/Expression_BaseBall_Sender/skeleton',
            'spine/Expression_BaseBall_Receiver/ballfolder1',
            'spine/Expression_BaseBall_Other/skeleton'
        ];
        // 开始即播放棒球音效
        this.playSound(ThrowPropManager.SOUND_MAP[11]);
        this.loadSkeletons(paths)
            .then(([senderData, receiverData, otherData]) => {
                if (!cc.isValid(root)) return;
                const senderPos = this.getHeadLocalPos(senderSeat);
                const targetPos = this.getHeadLocalPos(targetSeat);
                if (role === 'sender') {
                    this.playBaseballSequence(senderData, root, senderPos, targetPos, ['1', '2', '3'], 0.333);
                } else if (role === 'receiver') {
                    this.playBaseballSequence(receiverData, root, senderPos, targetPos, ['1', '2', '3'], 0.333);
                } else {
                    // 旁观者：4段动画，第4段球飞出屏幕
                    this.playBaseballBystander(otherData, root, senderPos, targetPos);
                }
            })
            .catch(() => {});
    }

    /** 棒球动画序列播放（1→2移动→3击中） */
    private playBaseballSequence(
        skeletonData: sp.SkeletonData,
        root: cc.Node,
        startPos: cc.Vec3,
        targetPos: cc.Vec3,
        animNames: string[],
        moveDuration: number
    ): void {
        const node = new cc.Node('PropSpine');
        const skeleton = node.addComponent(sp.Skeleton);
        skeleton.skeletonData = skeletonData;
        node.parent = root;
        node.setPosition(startPos);
        // 阶段1: ready
        skeleton.setAnimation(0, animNames[0], false);
        skeleton.setCompleteListener(() => {
            if (!cc.isValid(node)) return;
            // 阶段2: move + 位移
            skeleton.setCompleteListener(() => {});
            skeleton.setAnimation(0, animNames[1], false);
            cc.tween(node).to(moveDuration, { x: targetPos.x, y: targetPos.y }, { easing: 'quadInOut' }).start();
            // 阶段2完成后播放阶段3
            // 用延时来触发（动画2的时长约等于移动时长）
            cc.tween(node)
                .delay(moveDuration)
                .call(() => {
                    if (!cc.isValid(node)) return;
                    skeleton.setAnimation(0, animNames[2], false);
                    this.destroyAfterComplete(node, 5);
                })
                .start();
        });
        this.destroyAfterDelay(node, 8);
    }

    /** 棒球旁观者：1→2移动→3击中→4飞出屏幕 */
    private playBaseballBystander(skeletonData: sp.SkeletonData, root: cc.Node, senderPos: cc.Vec3, targetPos: cc.Vec3): void {
        const node = new cc.Node('PropSpine');
        const skeleton = node.addComponent(sp.Skeleton);
        skeleton.skeletonData = skeletonData;
        node.parent = root;
        node.setPosition(senderPos);
        // 阶段1: ready
        skeleton.setAnimation(0, '1', false);
        skeleton.setCompleteListener(() => {
            if (!cc.isValid(node)) return;
            // 阶段2: move
            skeleton.setCompleteListener(() => {});
            skeleton.setAnimation(0, '2', false);
            cc.tween(node).to(0.333, { x: targetPos.x, y: targetPos.y }, { easing: 'quadInOut' }).start();
            cc.tween(node)
                .delay(0.333)
                .call(() => {
                    if (!cc.isValid(node)) return;
                    // 阶段3: attack
                    skeleton.setAnimation(0, '3', false);
                    skeleton.setCompleteListener(() => {
                        if (!cc.isValid(node)) return;
                        // 阶段4: exit — 球沿方向飞出屏幕
                        skeleton.setAnimation(0, '4', false);
                        const moveDir = cc.v2(targetPos.x - senderPos.x, targetPos.y - senderPos.y).normalize();
                        const exitPos = cc.v3(targetPos.x + moveDir.x * 2000, targetPos.y + moveDir.y * 2000, 0);
                        cc.tween(node)
                            .to(1.0, { x: exitPos.x, y: exitPos.y }, { easing: 'quadIn' })
                            .call(() => {
                                if (cc.isValid(node)) node.destroy();
                            })
                            .start();
                    });
                })
                .start();
        });
        this.destroyAfterDelay(node, 10);
    }

    // ─── 钻石赠送动画（diamond-give 美术：代码驱动，无需 spine 运行时） ───
    /** 钻石特效美术（resources/effect/diamond/）懒加载缓存 */
    private diamondArt: Map<string, cc.SpriteFrame> = new Map();

    /** 异步加载钻石特效美术（diamond / glow / glowmain），全部就绪后回调 */
    private loadDiamondArt(cb: () => void): void {
        const names = ['diamond', 'glow', 'glowmain'];
        if (names.every((n) => this.diamondArt.has(n))) { cb(); return; }
        let pending = names.length;
        let failed = false;
        const done = () => { if (--pending === 0 && !failed) cb(); };
        names.forEach((n) => {
            if (this.diamondArt.has(n)) { done(); return; }
            cc.resources.load('effect/diamond/' + n, cc.Texture2D, (err, tex: cc.Texture2D) => {
                if (err || !tex) {
                    console.warn(LN, 'diamond art load failed:', n, err && err.message);
                    failed = true;
                } else {
                    this.diamondArt.set(n, new cc.SpriteFrame(tex));
                }
                done();
            });
        });
    }

    /** 用钻石美术新建一个 Sprite 节点放到 parent 的 localPos，additive=true 用叠加混合(发光) */
    private makeDiamondArtNode(name: string, parent: cc.Node, localPos: cc.Vec3, additive: boolean): cc.Node {
        const sf = this.diamondArt.get(name);
        if (!sf) return null;
        const node = new cc.Node(name);
        const sprite = node.addComponent(cc.Sprite);
        sprite.spriteFrame = sf;
        sprite.sizeMode = cc.Sprite.SizeMode.TRIMMED;
        if (additive) {
            sprite.srcBlendFactor = cc.macro.BlendFactor.SRC_ALPHA;
            sprite.dstBlendFactor = cc.macro.BlendFactor.ONE;
        }
        node.parent = parent;
        node.setPosition(localPos);
        return node;
    }

    /** 播放钻石赠送飞行动画（由服务端广播触发，所有玩家都调用） */
    playDiamondAnimation(senderId: number, receiverId: number, amount: number): void {
        const root = this.getAnimRoot();
        if (!root) return;
        const senderSeat = this.game.GetSeatByUserId(senderId);
        const receiverSeat = this.game.GetSeatByUserId(receiverId);
        if (!senderSeat || !receiverSeat) return;
        if (!senderSeat.uirc?.Frame_Head || !receiverSeat.uirc?.Frame_Head) return;
        const senderWorldPos = senderSeat.uirc.Frame_Head.parent.convertToWorldSpaceAR(senderSeat.uirc.Frame_Head.position);
        const receiverWorldPos = receiverSeat.uirc.Frame_Head.parent.convertToWorldSpaceAR(receiverSeat.uirc.Frame_Head.position);
        // 数字 +/- 仍复用 diamondFly 预制体
        cc.resources.load('effect/diamondFly', cc.Prefab, (errFly, flyPrefab: cc.Prefab) => {
            if (errFly) console.warn(LN, 'diamondFly load failed:', errFly.message);
            const spawnNum = (worldPos: cc.Vec3, text: string) => {
                if (flyPrefab && cc.isValid(root)) this.spawnDiamondFlyNode(flyPrefab, root, worldPos, text);
            };
            this.loadDiamondArt(() => {
                if (!cc.isValid(root)) return;
                const startLocal = root.convertToNodeSpaceAR(senderWorldPos);
                const endLocal = root.convertToNodeSpaceAR(receiverWorldPos);
                // 1) 赠送方：-amount
                spawnNum(senderWorldPos, `-${amount}`);
                // 2) 钻石从赠送方头像飞到接收方头像（边飞边旋转）
                const fly = this.makeDiamondArtNode('diamond', root, startLocal, false);
                const onArrive = () => {
                    if (!cc.isValid(root)) return;
                    this.playDiamondBurst(root, endLocal);
                    spawnNum(receiverWorldPos, `+${amount}`);
                };
                if (fly) {
                    fly.scale = 0.7;
                    cc.tween(fly).by(0.85, { angle: -360 }).start();
                    cc.tween(fly)
                        .to(0.85, { position: endLocal }, { easing: 'quadInOut' })
                        .call(() => {
                            onArrive();
                            if (cc.isValid(fly)) fly.destroy();
                        })
                        .start();
                } else {
                    onArrive();
                }
            });
        });
    }

    /** 接收方头像处的钻石爆发特效：主光晕 + 闪光 + 钻石弹出 */
    private playDiamondBurst(parent: cc.Node, localPos: cc.Vec3): void {
        // 主光晕（叠加发光，放大旋转淡出）
        const glowMain = this.makeDiamondArtNode('glowmain', parent, localPos, true);
        if (glowMain) {
            glowMain.opacity = 0;
            glowMain.scale = 0.3;
            cc.tween(glowMain)
                .parallel(
                    cc.tween().to(0.2, { opacity: 255 }).to(0.7, { opacity: 0 }),
                    cc.tween().to(0.9, { scale: 1.6 }, { easing: 'quadOut' }),
                    cc.tween().by(0.9, { angle: 180 })
                )
                .call(() => { if (cc.isValid(glowMain)) glowMain.destroy(); })
                .start();
        }
        // 闪光（快速放大淡出）
        const glow = this.makeDiamondArtNode('glow', parent, localPos, true);
        if (glow) {
            glow.opacity = 255;
            glow.scale = 0.2;
            cc.tween(glow)
                .parallel(
                    cc.tween().to(0.45, { scale: 1.3 }, { easing: 'quadOut' }),
                    cc.tween().to(0.15, { opacity: 255 }).to(0.4, { opacity: 0 })
                )
                .call(() => { if (cc.isValid(glow)) glow.destroy(); })
                .start();
        }
        // 钻石弹出（回弹放大→稳定→淡出）
        const dm = this.makeDiamondArtNode('diamond', parent, localPos, false);
        if (dm) {
            dm.opacity = 255;
            dm.scale = 0.2;
            cc.tween(dm)
                .to(0.22, { scale: 1.35 }, { easing: 'backOut' })
                .to(0.12, { scale: 1.0 })
                .delay(0.35)
                .to(0.3, { opacity: 0, scale: 1.2 })
                .call(() => { if (cc.isValid(dm)) dm.destroy(); })
                .start();
        }
    }

    private spawnDiamondFlyNode(prefab: cc.Prefab, parentNode: cc.Node, worldPos: cc.Vec3, text: string): void {
        const node = cc.instantiate(prefab);
        if (!node) return;
        const numLabel = node.getChildByName('diamondNum');
        if (numLabel) {
            const label = numLabel.getComponent(cc.Label);
            if (label) label.string = text;
        }
        if (text.startsWith('+') && numLabel) {
            numLabel.color = cc.color(0, 255, 100, 255);
        }
        node.parent = parentNode;
        const localPos = parentNode.convertToNodeSpaceAR(worldPos);
        node.setPosition(localPos);
        cc.tween(node)
            .by(0.6, { y: 60 })
            .to(0.4, { opacity: 0 })
            .call(() => {
                if (cc.isValid(node)) node.destroy();
            })
            .start();
    }
}
