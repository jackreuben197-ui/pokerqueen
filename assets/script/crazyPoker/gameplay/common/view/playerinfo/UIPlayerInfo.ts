import UIBasePlus from '../../../../../ui/UIBasePlus';
import UIComponent from '../../../../../ui/UIComponent';
import { UIDefine } from '../../../../../define/UIDefine';
import { CPlayer } from '../../../../../game/CPlayer';
import {
    WebOtherUserInfo,
    WebMiscCombine,
    WebRoomCenterRoomUserLeave,
    WebRoomCenterRoomUserStandUp,
    WebUserMute,
    WebUserMuteList,
    WebUserDiamondSend,
    WebUserDiamondsWallet,
    WebPropChatPropList,
    WWW
} from '../../../../../net/https/WebRequest';
import { WebOrgClubUserRemaRks } from '../../../../../net/https/web_request/WebRequestOrg';
import WebImageHelper from '../../../../../helper/WebImageHelper';
import AgoraManager from '../../../../../net/agora/AgoraManager';
import { GameCache } from '../../../../../game/GameCache';
import { GameplayPlayerInfoCache } from '../../../../../game/GameplayPlayerInfoCache';
import GC from '../../../../../frame/GameControl';
import { i18nMgr } from '../../../../../i18n/i18nMgr';
import { CPErrorCode } from '../../../../../i18n/CPErrorCode';
import { AntiCheatType } from '../../constant/AntiCheatType';
import { RoomOriginType } from '../../constant/RoomOriginType';
import UIDialogComponent, { UIDialogParam } from '../../../../../ui/dialog/UIDialogComponent';
import ProtocolAgency from '../../../../../net/websocket/ProtocolAgency';
import { ProtocolCode } from '../../../../../net/websocket/ProtocolCode';
import { ClientMessageBroadcastMsg } from '../../../../../protobuf/holdem/req_th_broadcast_msg_pb';
import { Room, Def } from '../../../../../protobuf/holdem/define_pb';
import { Broadcast } from '../../../../../net/websocket/ProtocolHoldemMessages';
import TimeHelper from '../../../../../helper/TimeHelper';
const { ccclass, property } = cc._decorator;

@ccclass
export default class UIPlayerInfo extends UIBasePlus {
    @property(cc.SpriteFrame)
    toggleOnBg: cc.SpriteFrame = null;
    // 扔道具 PropsID: CtEmoji2(6) * 100 = 600
    // 600=番茄, 601=花环, 602=亲吻, 603=大拇指, 604=干杯, 605=摸头,
    // 606=鲨鱼, 607=抓鸡, 608=拳击, 609=撒钱, 610=鱼头, 611=棒球
    // prefab 视觉布局: 亲吻,撒钱,拳击,摸头,番茄,鱼头 / 棒球,大拇指,干杯,抓鸡,花环,鲨鱼
    private static readonly PROP_TYPE_BASE: number = Def.ConsumeType.CT_EMOJI_2 * 100; // 600
    /** propIndex(1~12) → propType，对应 prefab 中 $propOp_1 ~ $propOp_12 的视觉位置 */
    private static readonly PROP_TYPE_MAP: number[] = [
        602,
        609,
        608,
        605,
        600,
        610, // 第一行: 亲吻,撒钱,拳击,摸头,番茄,鱼头
        611,
        603,
        604,
        607,
        601,
        606 // 第二行: 棒球,大拇指,干杯,抓鸡,花环,鲨鱼
    ];
    // 自动绑定 ($ 前缀节点)
    $panel_click: cc.Node = null;
    $HeadImgNode: cc.Node = null;
    $HeadImgIcon: cc.Node = null;
    cc_Label$NickName: cc.Label = null;
    $dataTabNode: cc.Node = null;
    // 手动绑定 (prefab 节点无 $ 前缀，不能自动绑定)
    private _male: cc.Node = null;
    private _female: cc.Node = null;
    private _playerid: cc.Label = null;
    private _headSprite: cc.Sprite = null;
    private _player: CPlayer = null;
    private _dlgNode: cc.Node = null;
    // 备注相关
    private _playerNoteNode: cc.Node = null;
    private _playerNoteLabel: cc.Label = null;
    private _currentRemark: string = '';
    private _noteEditBox: cc.EditBox = null;
    private _noteBtn: cc.Node = null;
    private _dbUserId: number = 0; // 服务端数据库 user_id（区别于 CPlayer.userID 的 random_num）
    // Tab 相关
    private _tabNodes: cc.Node[] = [];
    private _tabLabels: cc.Label[] = [];
    private _underlineNodes: cc.Node[] = [];
    private _contentNodes: cc.Node[] = [];
    private _tabIndex: number = 0;
    // Data 面板相关
    private _dataLabels: { des: cc.Label; num: cc.Label; node: cc.Node }[] = [];
    // AllIn 面板相关
    private _allInLabels: { des: cc.Label; num: cc.Label; node: cc.Node }[] = [];
    private _radarGfx: cc.Graphics = null;
    private _radarNode: cc.Node = null;
    private _radarSize: number = 80; // 雷达图半径
    private _radarGrids: number = 4; // 网格层数
    // Diamond 面板相关
    private _diamondNodes: { node: cc.Node; amount: number }[] = [];
    private _noticeLabel: cc.Label = null;
    private _diamondConfig: { fee_rate: number; limit_time_pre_day: number } = null;
    private _diamondSentCount: number = 0;
    // 操作按钮
    $OpButtonNode: cc.Node = null;
    // 道具操作区
    $PropOpNode: cc.Node = null;
    private _propListData: { payPrice: number; priceId: number }[] = [];
    // 钻石余额显示
    $DiamondShow: cc.Node = null;
    $diamondNum: cc.Node = null;
    // 自身判定
    private _isSelf: boolean = false;
    // Toggle 状态
    private _isChatMuted: boolean = false;
    private _isShielded: boolean = false;
    private static _shieldNameList: Set<number> = new Set();
    // 备注本地缓存（保存用 club 接口，加载用 user 接口，数据源不同，本地兜底）
    private static _savedRemarks: Map<number, string> = new Map();
    // 音视频 Toggle 状态
    private _hasAudioTrack: boolean = false;
    private _hasVideoTrack: boolean = false;
    private _isAudioClosed: boolean = false;
    private _isVideoClosed: boolean = false;
    private static _audioClosedUsers: Set<number> = new Set();
    private static _videoClosedUsers: Set<number> = new Set();

    protected lateLoad(): void {
        super.lateLoad();
        this._headSprite = this.$HeadImgIcon.getComponent(cc.Sprite);
        this.setButtonClick(this.$panel_click, this.click_panel);
        // 手动查找无 $ 前缀的节点
        let dlg = this.node.getChildByName('PlayerInfoDlg');
        if (dlg) {
            this._dlgNode = dlg;
            let playeridNode = dlg.getChildByName('playerid');
            this._playerid = playeridNode ? playeridNode.getComponent(cc.Label) : null;
            // 阻止 PlayerInfoDlg 区域触摸事件冒泡，防止误触关闭
            dlg.on(cc.Node.EventType.TOUCH_START, (e: cc.Event.EventTouch) => {
                e.stopPropagation();
            });
            dlg.on(cc.Node.EventType.TOUCH_END, (e: cc.Event.EventTouch) => {
                e.stopPropagation();
            });
        }
        // male/female 与 NickName 同级，都在 $nickNameNode 下面
        if (this.$nickNameNode) {
            this._male = this.$nickNameNode.getChildByName('male');
            this._female = this.$nickNameNode.getChildByName('female');
        }
        this.initNoteNodes();
        this.initTabs();
        this.initDataNodes();
        this.initAllInNodes();
        this.initDiamondNodes();
        this.refreshDataDescriptions();
        this.initOpButtonEvents();
        this.initPropNodes();
    }

    private initTabs(): void {
        if (!this.$dataTabNode) return;
        let tabNode = this.$dataTabNode.getChildByName('tabNode');
        if (!tabNode) return;
        // 三个 tab Label: Data, allIn, Gift
        let tabNames = ['Data', 'allIn', 'Gift'];
        this._tabLabels = [];
        this._tabNodes = [];
        this._underlineNodes = [];
        for (let i = 0; i < tabNames.length; i++) {
            let node = tabNode.getChildByName(tabNames[i]);
            let label = node ? node.getComponent(cc.Label) : null;
            this._tabNodes.push(node);
            this._tabLabels.push(label);
            if (node) {
                // 清除 prefab 里可能导致渲染异常的 _styleFlags（下划线标记）
                if (label) {
                    (label as any)._styleFlags = 0;
                    (label as any)._isUnderline = false;
                }
                // 节点没有 cc.Button，用 bindClick 注册触摸事件
                this.bindClick(node, () => this.click_tab(i));
            }
            // 为每个 tab 创建下划线 Graphics 节点
            let ulNode = new cc.Node('underline');
            let gfx = ulNode.addComponent(cc.Graphics);
            let w = node ? node.width : 100;
            gfx.strokeColor = cc.Color.WHITE;
            gfx.lineWidth = 8;
            gfx.moveTo(-w / 2, 0);
            gfx.lineTo(w / 2, 0);
            gfx.stroke();
            ulNode.y = -40;
            ulNode.active = false;
            if (node) node.addChild(ulNode);
            this._underlineNodes.push(ulNode);
        }
        // 三个内容节点: dataNode, allInNode, diamondNode（只切换这三个的显示，不碰 tabNode 下的 Label）
        this._contentNodes = [
            this.$dataTabNode.getChildByName('dataNode'),
            this.$dataTabNode.getChildByName('allInNode'),
            this.$dataTabNode.getChildByName('diamondNode')
        ];
    }

    onShow(param?: any): void {
        super.onShow(param);
        // 每次打开都确保 noteEditBox 隐藏（防止 prefab 默认 active 或缓存复用时残留状态）
        if (this._noteEditBox) this._noteEditBox.node.active = false;
        if (this._playerNoteNode) this._playerNoteNode.active = true;
        if (this._noteBtn) this._noteBtn.active = true;
        if (!param) return;
        this._player = param as CPlayer;
        // 判断是否是自己
        let gc = GameCache.Instance;
        this._isSelf = gc.nUserId === this._player.userID || gc.userId === this._player.userID;
        // 清除上一次面板残留的战绩数据，避免切换玩家时看到旧值
        this.refreshDataDescriptions();
        // 先用桌位数据即时显示基础信息
        this.refreshBasicInfo({
            nick_name: this._player.nick,
            avatar: this._player.headPic,
            sex: this._player.sex,
            random_num: this._player.userID
        });
        // 缓存命中则立刻覆盖：公共信息 + 战绩（对齐 Unity 的 GetUserPublicData / CheckUserStatsItemData）
        const cache = GameplayPlayerInfoCache.Instance;
        const cachedInfo = cache.getPublicInfoSync(this._player.userID);
        if (cachedInfo) {
            this.refreshBasicInfo(cachedInfo as any);
        }
        const cachedStats = cache.getStatsSync(this._player.userID);
        if (cachedStats) {
            this.refreshDataPanel(cachedStats);
        } else {
            // 内存未命中时异步从 IndexedDB 拉一次，命中后再刷新
            cache.warmFromDB(this._player.userID).then(() => {
                if (!cc.isValid(this.node) || !this._player) return;
                const info2 = cache.getPublicInfoSync(this._player.userID);
                if (info2) this.refreshBasicInfo(info2 as any);
                const stats2 = cache.getStatsSync(this._player.userID);
                if (stats2) this.refreshDataPanel(stats2);
            });
        }
        // 根据是否自身调整 UI
        this.refreshSelfState();
        // 默认选中 Data tab
        this.switchTab(0);
        // 根据权限刷新操作按钮显隐
        this.refreshOpButtons(this._player.userID);
        // 加载禁言/屏蔽初始状态（仅非自身）
        if (!this._isSelf) {
            this.loadMuteState();
            this.loadShieldState();
        }
        // 加载音视频初始状态（仅非自身）
        if (!this._isSelf) {
            this.loadAudioVideoState();
        }
        // 加载钻石余额（仅非自身且双方都在桌上时）
        if (!this._isSelf) {
            this.loadDiamondBalance();
        }
        // 再请求服务端完整数据
        this.reqUserInfo(this._player.userID);
    }

    private click_tab(index: number): void {
        this.switchTab(index);
    }

    /** 根据是否自身隐藏/显示相关区域 */
    private refreshSelfState(): void {
        // 判断双方是否都在桌上：自己和目标玩家都在座位上
        let bothInTable = false;
        if (!this._isSelf) {
            let gc = GameCache.Instance;
            let curGame = gc.CurGame;
            if (curGame && curGame.listSeat) {
                let myInTable = false;
                let targetInTable = false;
                for (let i = 0; i < curGame.listSeat.length; i++) {
                    let seat = curGame.listSeat[i];
                    if (seat && seat.Player) {
                        if (seat.Player.userID === gc.nUserId || seat.Player.userID === gc.userId) {
                            myInTable = true;
                        }
                        if (seat.Player.userID === this._player.userID) {
                            targetInTable = true;
                        }
                    }
                }
                bothInTable = myInTable && targetInTable;
            }
        }
        // 道具操作区：仅对其他玩家且双方都在桌上时显示
        if (this.$PropOpNode) {
            this.$PropOpNode.active = !this._isSelf && bothInTable;
        }
        // 钻石余额显示：仅对其他玩家显示
        if (this.$DiamondShow) {
            this.$DiamondShow.active = !this._isSelf;
        }
        // Gift tab（第 3 个 tab，index=2）：仅对其他玩家且双方都在桌上时显示
        let giftTabIndex = 2;
        if (this._tabNodes.length > giftTabIndex && this._tabNodes[giftTabIndex]) {
            this._tabNodes[giftTabIndex].active = !this._isSelf && bothInTable;
        }
    }

    private switchTab(index: number): void {
        // 自身不能切换到 Gift tab
        if (this._isSelf && index >= 2) {
            index = 0;
        }
        this._tabIndex = index;
        // 更新 tab 选中状态：下划线显示/隐藏，颜色保持白色
        for (let i = 0; i < this._underlineNodes.length; i++) {
            if (this._underlineNodes[i]) {
                this._underlineNodes[i].active = i === index;
            }
        }
        // 切换内容节点显示
        for (let i = 0; i < this._contentNodes.length; i++) {
            if (this._contentNodes[i]) {
                this._contentNodes[i].active = i === index;
            }
        }
    }

    // ─── 备注 ───
    /** 初始化备注节点 */
    private initNoteNodes(): void {
        let noteNode = this.$HeadImgNode ? this.$HeadImgNode.getChildByName('noteNode') : null;
        if (!noteNode) return;
        this._playerNoteNode = noteNode.getChildByName('playerNote');
        if (this._playerNoteNode) {
            this._playerNoteLabel = this._playerNoteNode.getComponent(cc.Label);
        }
        this._noteBtn = noteNode.getChildByName('noteBtn');
        if (this._noteBtn) {
            this.bindClick(this._noteBtn, this.click_editNote);
        }
        // playerNote 文字区域也可点击编辑
        if (this._playerNoteNode) {
            this.bindClick(this._playerNoteNode, this.click_editNote);
        }
        // noteEditBox: 初始隐藏，编辑完成时回调
        let noteEditBoxNode = noteNode.getChildByName('noteEditBox');
        if (noteEditBoxNode) {
            noteEditBoxNode.active = false;
            this._noteEditBox = noteEditBoxNode.getComponent(cc.EditBox);
            if (this._noteEditBox) {
                noteEditBoxNode.on('editing-did-ended', this.onNoteEditEnded, this);
            }
        }
    }

    /** 点击备注按钮 / 文字区域：显示 EditBox 开始编辑 */
    private click_editNote(): void {
        if (!this._player || !this._noteEditBox) return;
        let editBoxNode = this._noteEditBox.node;
        // 隐藏 playerNote 和 noteBtn，显示 EditBox
        if (this._playerNoteNode) this._playerNoteNode.active = false;
        if (this._noteBtn) this._noteBtn.active = false;
        editBoxNode.active = true;
        // 填入当前备注文字作为默认值
        this._noteEditBox.string = this._currentRemark;
        this._noteEditBox.focus();
    }

    /** EditBox 编辑结束回调：保存备注并恢复显示 */
    private onNoteEditEnded(editBox: cc.EditBox): void {
        let newText = editBox.string.trim();
        // 隐藏 EditBox，恢复 playerNote 和 noteBtn 显示
        editBox.node.active = false;
        if (this._playerNoteNode) this._playerNoteNode.active = true;
        if (this._noteBtn) this._noteBtn.active = true;
        // 内容有变化才请求保存
        if (newText !== this._currentRemark) {
            this.saveUserRemark(newText);
        } else {
            // 没变化也要刷新显示（保持一致性）
            if (this._playerNoteLabel) {
                this._playerNoteLabel.string = this._currentRemark || '点击添加备注';
            }
        }
    }

    /** 保存备注到服务端 */
    private saveUserRemark(newText: string): void {
        let gc = GameCache.Instance;
        let targetUserId = this._dbUserId || this._player.userID;
        console.log('[UIPlayerInfo] saveUserRemark _dbUserId=', this._dbUserId, 'player.userID=', this._player.userID, 'using=', targetUserId);
        WWW.Instance.CommonAPI({
            web_class: WebOrgClubUserRemaRks,
            body: {
                club_id: gc.ClubID || 0,
                user_id: targetUserId,
                remark_name: newText,
                remark_desc: ''
            }
        }).then((res: any) => {
            if (!cc.isValid(this.node)) return;
            if (res && res.code === 0) {
                this._currentRemark = newText;
                // 写入本地缓存，防止下次打开时加载 API 读不到
                UIPlayerInfo._savedRemarks.set(this._player.userID, newText);
                if (this._playerNoteLabel) {
                    this._playerNoteLabel.string = newText || '点击添加备注';
                }
                UIComponent.Instance.Toast('备注修改成功');
            } else {
                if (this._playerNoteLabel) {
                    this._playerNoteLabel.string = this._currentRemark || '点击添加备注';
                }
                UIComponent.Instance.Toast((res && res.message) || '备注修改失败');
            }
        });
    }

    /** 请求用户详细信息 */
    private reqUserInfo(userid: number) {
        WWW.Instance.CommonAPI({
            web_class: WebOtherUserInfo,
            api_id: userid
        }).then((res: any) => {
            if (!cc.isValid(this.node)) return;
            console.log('[UIPlayerInfo] reqUserInfo response data:', JSON.stringify(res?.data));
            if (res?.data) {
                this.refreshBasicInfo(res.data);
                GameplayPlayerInfoCache.Instance.updatePublicInfo(res.data);
                this.reqUserStats(res.data.random_num);
            }
        });
    }

    /** 刷新基础信息：头像、昵称、性别、ID、备注 */
    private refreshBasicInfo(data: {
        nick_name: string;
        avatar: string;
        sex: number;
        random_num: number;
        user_id?: number;
        remark_name?: string;
        remark_desc?: string;
    }) {
        // 头像
        if (data.avatar) {
            WebImageHelper.SetUrlImage(this._headSprite, data.avatar);
        }
        // 昵称
        if (this.cc_Label$NickName) {
            this.cc_Label$NickName.string = data.nick_name || '';
        }
        // 性别: sex==1 女, sex==2 男, 其他默认男
        if (this._male) this._male.active = data.sex != 1;
        if (this._female) this._female.active = data.sex == 1;
        // ID
        if (this._playerid) {
            this._playerid.string = `${data.random_num}`;
        }
        // 保存数据库 user_id（用于备注保存 API）
        if (data.user_id) {
            this._dbUserId = data.user_id;
        }
        // 备注：优先用本地缓存 > 服务端返回的 remark_name
        let remark = UIPlayerInfo._savedRemarks.get(data.random_num);
        if (remark === undefined && data.remark_name) {
            remark = data.remark_name;
        }
        if (remark === undefined) {
            remark = '';
        }
        this._currentRemark = remark;
        if (this._playerNoteLabel) {
            this._playerNoteLabel.string = remark || '点击添加备注';
        }
    }

    /** 初始化 Data 面板 LabelNode 引用 */
    private initDataNodes(): void {
        if (!this.$dataTabNode) return;
        let dataNode = this.$dataTabNode.getChildByName('dataNode');
        if (!dataNode) return;
        this._dataLabels = [];
        for (let i = 1; i <= 6; i++) {
            let labelNode = dataNode.getChildByName('LabelNode' + i);
            if (!labelNode) continue;
            let desNode = labelNode.getChildByName('dataDes');
            let numNode = labelNode.getChildByName('dataNum');
            this._dataLabels.push({
                des: desNode ? desNode.getComponent(cc.Label) : null,
                num: numNode ? numNode.getComponent(cc.Label) : null,
                node: labelNode
            });
        }
    }

    /** 初始化 AllIn 面板 LabelNode 和雷达图引用 */
    private initAllInNodes(): void {
        if (!this.$dataTabNode) return;
        let allInNode = this.$dataTabNode.getChildByName('allInNode');
        if (!allInNode) return;
        // 按雷达图方位顺序：上(Positive) 左(Passive) 右(Behind) 下(Leading)
        let labelNames = ['LabelPositive', 'LabelPassive', 'LabelBehind', 'LabelLeading'];
        this._allInLabels = [];
        for (let i = 0; i < labelNames.length; i++) {
            let labelNode = allInNode.getChildByName(labelNames[i]);
            if (!labelNode) continue;
            let desNode = labelNode.getChildByName('des');
            let numNode = labelNode.getChildByName('num');
            this._allInLabels.push({
                des: desNode ? desNode.getComponent(cc.Label) : null,
                num: numNode ? numNode.getComponent(cc.Label) : null,
                node: labelNode
            });
        }
        // 雷达图节点
        this._radarNode = allInNode.getChildByName('radarChartNode');
        if (this._radarNode) {
            this._radarGfx = this._radarNode.getComponent(cc.Graphics);
            if (!this._radarGfx) {
                this._radarGfx = this._radarNode.addComponent(cc.Graphics);
            }
            // 读取节点大小作为雷达图尺寸
            this._radarSize = (Math.min(this._radarNode.width, this._radarNode.height) / 2) * 0.85;
        }
    }

    /** 刷新 AllIn 面板数据（对齐 Unity：整数百分比，截断不四舍五入） */
    private refreshAllInPanel(data: any): void {
        let allIn = data.allin_data;
        // 顺序：Positive(主动) Passive(被动) Behind(落后) Leading(领先)
        let items = [
            { count: allIn ? allIn.active_count || 0 : 0, profit: allIn ? allIn.active_profit_count || 0 : 0 },
            { count: allIn ? allIn.passive_count || 0 : 0, profit: allIn ? allIn.passive_profit_count || 0 : 0 },
            { count: allIn ? allIn.behind_count || 0 : 0, profit: allIn ? allIn.behind_profit_count || 0 : 0 },
            { count: allIn ? allIn.ahead_count || 0 : 0, profit: allIn ? allIn.ahead_profit_count || 0 : 0 }
        ];
        // 计算百分比（0~1 范围）
        let percents: number[] = [];
        for (let i = 0; i < this._allInLabels.length; i++) {
            let item = items[i] || { count: 0, profit: 0 };
            let pct = 0;
            if (item.count > 0) {
                pct = Math.trunc((item.profit / item.count) * 100);
                if (this._allInLabels[i] && this._allInLabels[i].num) {
                    this._allInLabels[i].num.string = pct + '%';
                }
            } else {
                if (this._allInLabels[i] && this._allInLabels[i].num) {
                    this._allInLabels[i].num.string = '0%';
                }
            }
            percents.push(pct / 100);
        }
        // 绘制雷达图
        this.drawRadarChart(percents);
    }

    /**
     * 绘制菱形雷达图
     * 数据顺序 percents[0~3]：Positive(主动) Passive(被动) Behind(落后) Leading(领先)
     * 绘制顺时针：上(Positive) → 右(Behind) → 下(Leading) → 左(Passive)
     */
    private drawRadarChart(percents: number[]): void {
        if (!this._radarGfx) return;
        let gfx = this._radarGfx;
        gfx.clear();
        let r = this._radarSize;
        // 顺时针绘制顺序：上(90°) → 右(0°) → 下(270°) → 左(180°)
        // 对应数据索引：[0:Positive, 2:Behind, 3:Leading, 1:Passive]
        let drawOrder = [0, 2, 3, 1];
        let angles = [90, 0, 270, 180];
        // 计算轴上顶点（顺时针排列）
        let axisPoints: cc.Vec2[] = [];
        for (let i = 0; i < 4; i++) {
            let rad = (angles[i] * Math.PI) / 180;
            axisPoints.push(cc.v2(Math.cos(rad) * r, Math.sin(rad) * r));
        }
        // 1) 画网格层（由内到外，外侧粗、内侧细）
        gfx.strokeColor = cc.Color.WHITE;
        for (let g = 1; g <= this._radarGrids; g++) {
            let scale = g / this._radarGrids;
            let isOuter = g === this._radarGrids;
            gfx.lineWidth = isOuter ? 6 : 3;
            gfx.moveTo(axisPoints[0].x * scale, axisPoints[0].y * scale);
            for (let i = 1; i < 4; i++) {
                gfx.lineTo(axisPoints[i].x * scale, axisPoints[i].y * scale);
            }
            gfx.close();
            gfx.stroke();
        }
        // 2) 画轴线（从中心到四个顶点）
        gfx.strokeColor = cc.Color.WHITE;
        gfx.lineWidth = 3;
        for (let i = 0; i < 4; i++) {
            gfx.moveTo(0, 0);
            gfx.lineTo(axisPoints[i].x, axisPoints[i].y);
            gfx.stroke();
        }
        // 3) 画数据区域：按 drawOrder 取对应数据值映射到顺时针顶点
        let dataPoints: cc.Vec2[] = [];
        for (let i = 0; i < 4; i++) {
            let p = percents[drawOrder[i]] || 0;
            dataPoints.push(cc.v2(axisPoints[i].x * p, axisPoints[i].y * p));
        }
        // 填充
        gfx.fillColor = new cc.Color(200, 200, 200, 160);
        gfx.moveTo(dataPoints[0].x, dataPoints[0].y);
        for (let i = 1; i < 4; i++) {
            gfx.lineTo(dataPoints[i].x, dataPoints[i].y);
        }
        gfx.close();
        gfx.fill();
        // 描边
        gfx.strokeColor = cc.Color.WHITE;
        gfx.lineWidth = 6;
        gfx.moveTo(dataPoints[0].x, dataPoints[0].y);
        for (let i = 1; i < 4; i++) {
            gfx.lineTo(dataPoints[i].x, dataPoints[i].y);
        }
        gfx.close();
        gfx.stroke();
        // 4) 画数据顶点圆点
        gfx.fillColor = new cc.Color(114, 135, 255, 255);
        for (let i = 0; i < 4; i++) {
            gfx.circle(dataPoints[i].x, dataPoints[i].y, 3);
            gfx.fill();
        }
    }

    /** 初始化 Diamond 面板：读取档位金额、更新 Label、绑定点击 */
    private initDiamondNodes(): void {
        if (!this.$dataTabNode) return;
        let diamondNode = this.$dataTabNode.getChildByName('diamondNode');
        if (!diamondNode) return;
        // 读取 notice Label
        let noticeNode = diamondNode.getChildByName('notice');
        if (noticeNode) {
            this._noticeLabel = noticeNode.getComponent(cc.Label);
        }
        // 解析赠送钻石配置
        this.loadDiamondConfig();
        // 初始化档位按钮
        this._diamondNodes = [];
        let children = diamondNode.children;
        for (let i = 0; i < children.length; i++) {
            let node = children[i];
            let name = node.name;
            // 从节点名提取金额 (e.g. "diamond10" → 10)
            let match = name.match(/^diamond(\d+)$/);
            if (!match) continue;
            let amount = parseInt(match[1], 10);
            if (isNaN(amount)) continue;
            // 更新 diamondNum Label 显示金额
            let numNode = node.getChildByName('diamondNum');
            if (numNode) {
                let label = numNode.getComponent(cc.Label);
                if (label) label.string = '' + amount;
            }
            // 绑定点击事件
            this.bindClick(node, () => this.click_sendDiamond(amount, node));
            this._diamondNodes.push({ node: node, amount: amount });
        }
    }

    /** 从全局配置加载赠送钻石参数 */
    private loadDiamondConfig(): void {
        let config = GameCache.Instance._globalConfig;
        if (!config) return;
        let raw = config.room_user_send_diamond_config;
        if (!raw) return;
        let cfg = typeof raw === 'string' ? JSON.parse(raw) : raw;
        this._diamondConfig = {
            fee_rate: cfg.fee_rate || 0,
            limit_time_pre_day: cfg.limit_time_pre_day || 0
        };
        // 从当前用户信息中读取今日已赠送次数
        let userInfo = GC.data?.user?.info;
        let todaySent = (userInfo as any)?._msg?.user_today_diamond_send_time || 0;
        this._diamondSentCount = todaySent;
        this.refreshDiamondNotice();
    }

    /** 更新 notice 提示文案 */
    private refreshDiamondNotice(): void {
        if (!this._noticeLabel || !this._diamondConfig) return;
        let remaining = this._diamondConfig.limit_time_pre_day - this._diamondSentCount;
        if (remaining < 0) remaining = 0;
        this._noticeLabel.string = i18nMgr
            .Get('GiftDiamondsTips')
            .replace('{0}', '' + remaining)
            .replace('{1}', this._diamondConfig.fee_rate + '%');
    }

    /** 加载当前用户钻石余额并显示 */
    private loadDiamondBalance(): void {
        if (!this.$diamondNum) return;
        let label = this.$diamondNum.getComponent(cc.Label);
        if (!label) return;
        WWW.Instance.CommonAPI({
            web_class: WebUserDiamondsWallet
        }).then((res: any) => {
            if (!cc.isValid(this.node)) return;
            if (res && res.data && res.data.diamonds_wallet) {
                label.string = res.data.diamonds_wallet.diamonds.toLocaleString('en-US');
            }
        });
    }

    /** 立即设置描述文案和默认值（不等网络请求） */
    private refreshDataDescriptions(): void {
        if (!this._dataLabels.length) return;
        let isMTT = GameCache.Instance.CurGame ? GameCache.Instance.CurGame.isMTT : false;
        if (isMTT) {
            let descs = [
                i18nMgr.Get('UIData_YGvXd5iXr_006'),
                i18nMgr.Get('UIData_YGvXd5iXr_007'),
                i18nMgr.Get('UIData_YGvXd5iXr_008'),
                i18nMgr.Get('UIData_YGvXd5iXr_005'),
                i18nMgr.Get('UITexasInfo_wincount')
            ];
            for (let i = 0; i < this._dataLabels.length; i++) {
                let label = this._dataLabels[i];
                if (!label) continue;
                if (i < descs.length) {
                    if (label.des) label.des.string = descs[i];
                    if (label.num) label.num.string = '0';
                    label.node.active = true;
                } else {
                    label.node.active = false;
                }
            }
        } else {
            let descs = [
                i18nMgr.Get('UITexasInfo_games'),
                i18nMgr.Get('UITexasInfo_poolrate'),
                i18nMgr.Get('UITexasInfo_flop'),
                i18nMgr.Get('UITexasInfo_allhands'),
                i18nMgr.Get('UITexasInfo_poolwin'),
                i18nMgr.Get('UITexasInfo_loss')
            ];
            for (let i = 0; i < this._dataLabels.length; i++) {
                let label = this._dataLabels[i];
                if (!label || i >= descs.length) continue;
                if (label.des) label.des.string = descs[i];
                if (label.num) label.num.string = '-';
                label.node.active = true;
            }
        }
    }

    /** 请求用户统计数据（对齐 Unity UIGameplayPlayerInfoDialogComponent:199-211）
     *  走 WebMiscCombine + 完整 scope 单查，避免与 prefetch 缓存通路数据口径不一致
     */
    private reqUserStats(random_num: number): void {
        const scope = GameplayPlayerInfoCache.Instance.getCurrentScope();
        WWW.Instance.CommonAPI({
            web_class: WebMiscCombine,
            body: {
                api_list: [WebMiscCombine.ApiType.OTHER_USER_STATS],
                user_stats_by_user_rid_req: {
                    game_type: scope.gameType,
                    poker_type: scope.pokerType,
                    gold_type: scope.goldType,
                    origin_type: scope.originType,
                    room_id: GameCache.Instance.room_id,
                    user_random_id: [random_num]
                }
            },
            juhua: false
        }).then((res: any) => {
            if (!cc.isValid(this.node)) return;
            const list = res?.data?.user_stats_by_user_rid_resp;
            const statsData = Array.isArray(list) && list.length > 0 ? list[0] : null;
            if (statsData) {
                this.refreshDataPanel(statsData);
                GameplayPlayerInfoCache.Instance.updateStats(random_num, statsData);
            }
        });
    }

    /** 刷新 Data 面板 */
    private refreshDataPanel(data: any): void {
        if (!this._dataLabels.length) return;
        let isMTT = GameCache.Instance.CurGame ? GameCache.Instance.CurGame.isMTT : false;
        if (isMTT) {
            this.refreshMTTData(data);
        } else {
            this.refreshRegularData(data);
        }
        // AllIn 数据刷新
        this.refreshAllInPanel(data);
    }

    /** 刷新 MTT 统计数据 (5项, 第6项隐藏) */
    private refreshMTTData(data: any): void {
        let mtt = data.mtt_room_data;
        if (Array.isArray(mtt)) mtt = mtt[0];
        if (!mtt) return;
        let items = [
            { value: '' + (mtt.frist_times || 0), des: i18nMgr.Get('UIData_YGvXd5iXr_006') },
            { value: '' + (mtt.second_times || 0), des: i18nMgr.Get('UIData_YGvXd5iXr_007') },
            { value: '' + (mtt.third_times || 0), des: i18nMgr.Get('UIData_YGvXd5iXr_008') },
            { value: '' + (mtt.play_times || 0), des: i18nMgr.Get('UIData_YGvXd5iXr_005') },
            { value: '' + (mtt.win_times || 0), des: i18nMgr.Get('UITexasInfo_wincount') }
        ];
        for (let i = 0; i < this._dataLabels.length; i++) {
            let label = this._dataLabels[i];
            if (!label) continue;
            if (i < items.length) {
                if (label.des) label.des.string = items[i].des;
                if (label.num) label.num.string = items[i].value;
                label.node.active = true;
            } else {
                label.node.active = false;
            }
        }
    }

    /** 刷新常规牌局统计数据 (6项) */
    private refreshRegularData(data: any): void {
        let roomData = data.room_data;
        if (Array.isArray(roomData)) {
            let gameType = this.getCurrentGameType();
            roomData =
                roomData.find(function (d: any) {
                    return d.game_type === gameType && d.data_type === 4;
                }) ||
                roomData.find(function (d: any) {
                    return d.game_type === gameType;
                }) ||
                roomData[0];
        }
        if (!roomData) return;
        let items = [
            { value: '' + (roomData.total_game_cnt || 0), des: i18nMgr.Get('UITexasInfo_games') },
            { value: (roomData.vpip || 0) + '%', des: i18nMgr.Get('UITexasInfo_poolrate') },
            { value: (roomData.prf || 0) + '%', des: i18nMgr.Get('UITexasInfo_flop') },
            { value: '' + (roomData.total_hand || 0), des: i18nMgr.Get('UITexasInfo_allhands') },
            { value: (roomData.wins || 0) + '%', des: i18nMgr.Get('UITexasInfo_poolwin') },
            { value: '' + (roomData.aveage_earn_hundred || 0) / 100, des: i18nMgr.Get('UITexasInfo_loss') }
        ];
        for (let i = 0; i < this._dataLabels.length; i++) {
            let label = this._dataLabels[i];
            if (!label || i >= items.length) continue;
            if (label.des) label.des.string = items[i].des;
            if (label.num) label.num.string = items[i].value;
            label.node.active = true;
        }
    }

    /** RoomType → game_type: 0=Texas, 1=Omaha4, 2=Omaha5, 3=Omaha6 */
    private getCurrentGameType(): number {
        let roomType: number = GameCache.Instance.room_type;
        if (roomType == null) return 0;
        if (roomType >= 512) return 0; // MTT 走 mtt_room_data，这里兜底
        if (roomType >= 192) return 3;
        if (roomType >= 128) return 2;
        if (roomType >= 64) return 1;
        return 0;
    }

    /** 根据权限和房间类型刷新操作按钮显隐 */
    private refreshOpButtons(targetUserId: number): void {
        if (!this.$OpButtonNode) return;
        let gc = GameCache.Instance;
        let isSelf = gc.nUserId === targetUserId || gc.userId === targetUserId;
        let isManager = gc._isRoomManager;
        let isAudioRtc = gc._antiCheatType === AntiCheatType.AUDIO;
        let isVideoRtc = gc._antiCheatType === AntiCheatType.VIDEO;
        this.setButtonActive('StandUpBtn', !isSelf && isManager && gc._isHasUserStandUpPrivileges);
        this.setButtonActive('DissolveBtn', !isSelf && isManager && gc._isHasUseLeavePrivileges);
        this.setButtonActive('CreditBtn', !isSelf && isManager && gc._originType === RoomOriginType.CLUB && gc.gold_type === 3);
        this.setButtonActive('chatCloseToggle', !isSelf && isManager);
        this.setButtonActive('audioCloseToggle', !isSelf && (isAudioRtc || isVideoRtc));
        this.setButtonActive('videoCloseToggle', !isSelf && isVideoRtc);
        this.setButtonActive('shieldToggle', !isSelf && gc._antiCheatType < AntiCheatType.FACE_VERIFY && gc._chatType !== 0);
        this.setButtonActive('ReportBtn', !isSelf);
    }

    private setButtonActive(name: string, active: boolean): void {
        let node = this.$OpButtonNode.getChildByName(name);
        if (node) node.active = active;
    }

    /** 绑定操作按钮点击事件 */
    private initOpButtonEvents(): void {
        if (!this.$OpButtonNode) return;
        this.bindOpButton('StandUpBtn', this.click_standUp);
        this.bindOpButton('DissolveBtn', this.click_dissolve);
        this.bindOpButton('CreditBtn', this.click_credit);
        this.bindOpButton('chatCloseToggle', this.click_chatClose);
        this.bindOpButton('audioCloseToggle', this.click_audioClose);
        this.bindOpButton('videoCloseToggle', this.click_videoClose);
        this.bindOpButton('shieldToggle', this.click_shield);
        this.bindOpButton('ReportBtn', this.click_report);
    }

    private bindOpButton(name: string, handler: () => void): void {
        let node = this.$OpButtonNode.getChildByName(name);
        if (node) this.bindClick(node, handler);
    }

    /** 站起玩家 */
    private click_standUp(): void {
        let nick = this._player ? this._player.nick : '';
        UIComponent.open<UIDialogParam>(UIDefine.UIDialogComponent, {
            type: UIDialogComponent.DialogType.CommitCancel,
            title: CPErrorCode.LanguageDescription(10007),
            content: i18nMgr.Get('UITexasRoomManagerOpTips7').replace('{0}', nick),
            contentCommit: i18nMgr.Get('UI_Recharge_confirm'),
            contentCancel: CPErrorCode.LanguageDescription(10013),
            actionCommit: () => {
                WWW.Instance.CommonAPI({
                    web_class: WebRoomCenterRoomUserStandUp,
                    body: WebRoomCenterRoomUserStandUp.Request({
                        room_id: GameCache.Instance.room_id,
                        user_random_id: this._player.userID
                    })
                }).then((res: any) => {
                    if (!cc.isValid(this.node)) return;
                    if (res?.code === 0) {
                        UIComponent.close(UIDefine.UIPlayerInfo);
                    } else {
                        UIComponent.Instance.Toast(res?.message || CPErrorCode.ServerErrorDescription(res?.code));
                    }
                });
            }
        });
    }

    /** 踢出玩家 */
    private click_dissolve(): void {
        let nick = this._player ? this._player.nick : '';
        UIComponent.open<UIDialogParam>(UIDefine.UIDialogComponent, {
            type: UIDialogComponent.DialogType.CommitCancel,
            title: CPErrorCode.LanguageDescription(10007),
            content: i18nMgr.Get('UITexasRoomManagerOpTips8').replace('{0}', nick),
            contentCommit: i18nMgr.Get('UI_Recharge_confirm'),
            contentCancel: CPErrorCode.LanguageDescription(10013),
            actionCommit: () => {
                WWW.Instance.CommonAPI({
                    web_class: WebRoomCenterRoomUserLeave,
                    body: WebRoomCenterRoomUserLeave.Request({
                        room_id: GameCache.Instance.room_id,
                        user_random_id: this._player.userID
                    })
                }).then((res: any) => {
                    if (!cc.isValid(this.node)) return;
                    if (res?.code === 0) {
                        UIComponent.close(UIDefine.UIPlayerInfo);
                    } else {
                        UIComponent.Instance.Toast(res?.message || CPErrorCode.ServerErrorDescription(res?.code));
                    }
                });
            }
        });
    }

    private click_panel() {
        UIComponent.close(UIDefine.UIPlayerInfo);
    }

    // ─── 发放额度 ───
    /** 发放额度：打开俱乐部成员操作面板 */
    private click_credit(): void {
        if (!this._player) return;
        let gc = GameCache.Instance;
        UIComponent.open(UIDefine.UIClubMember, {
            _clubId: gc.ClubID,
            _slaveClubid: gc.ClubID,
            _userName: this._player.nick,
            _randomNum: this._player.userID,
            _userId: this._player.userID,
            _isFundManage: true,
            _isAgency: false,
            _isFromGamePlayPlayerInfo: true
        });
        UIComponent.close(UIDefine.UIPlayerInfo);
    }

    // ─── 禁言 ───
    /** 加载禁言初始状态 */
    private loadMuteState(): void {
        if (!this._player) return;
        let gc = GameCache.Instance;
        if (!gc.ClubID && !gc.TribeId) return;
        WWW.Instance.CommonAPI({
            web_class: WebUserMuteList,
            body: WebUserMuteList.Request({
                club_id: gc.ClubID || undefined,
                tribe_id: gc.TribeId || undefined,
                user_ids: [this._player.userID]
            })
        }).then((res: any) => {
            if (!cc.isValid(this.node)) return;
            let mutedIds: number[] = res && res.data && res.data.ids ? res.data.ids : [];
            this._isChatMuted = mutedIds.indexOf(this._player.userID) >= 0;
            this.refreshToggleVisual('chatCloseToggle', this._isChatMuted);
        });
    }

    /** 禁言切换 */
    private click_chatClose(): void {
        if (!GameCache.Instance._isRoomManager || !this._player) return;
        let gc = GameCache.Instance;
        if (!gc.ClubID && !gc.TribeId) {
            UIComponent.Instance.Toast('当前房间不支持禁言操作');
            return;
        }
        this._isChatMuted = !this._isChatMuted;
        this.refreshToggleVisual('chatCloseToggle', this._isChatMuted);
        WWW.Instance.CommonAPI({
            web_class: WebUserMute,
            body: WebUserMute.Request({
                club_id: gc.ClubID || undefined,
                tribe_id: gc.TribeId || undefined,
                user_id: this._player.userID,
                mute: this._isChatMuted
            })
        }).then((res: any) => {
            if (!cc.isValid(this.node)) return;
            // API 返回失败则回滚状态
            if (!res || res.code !== 0) {
                this._isChatMuted = !this._isChatMuted;
                this.refreshToggleVisual('chatCloseToggle', this._isChatMuted);
                if (res && res.message) {
                    UIComponent.Instance.Toast(res.message);
                }
            }
        });
    }

    // ─── 屏蔽名字 ───
    /** 加载屏蔽初始状态 */
    private loadShieldState(): void {
        if (!this._player) return;
        this._isShielded = UIPlayerInfo._shieldNameList.has(this._player.userID);
        this.refreshToggleVisual('shieldToggle', this._isShielded);
    }

    /** 屏蔽名字切换 */
    private click_shield(): void {
        if (!this._player) return;
        this._isShielded = !this._isShielded;
        if (this._isShielded) {
            UIPlayerInfo._shieldNameList.add(this._player.userID);
        } else {
            UIPlayerInfo._shieldNameList.delete(this._player.userID);
        }
        this.refreshToggleVisual('shieldToggle', this._isShielded);
    }

    /** 检查某用户是否被屏蔽（供外部调用） */
    static isShielded(userId: number): boolean {
        return UIPlayerInfo._shieldNameList.has(userId);
    }

    // ─── 送钻石 ───
    /** 赠送钻石 */
    private click_sendDiamond(amount: number, clickNode: cc.Node): void {
        if (!this._player) return;
        // 检查剩余次数
        if (this._diamondConfig && this._diamondSentCount >= this._diamondConfig.limit_time_pre_day) {
            UIComponent.Instance.Toast(i18nMgr.Get('GiftDiamondError'));
            return;
        }
        this.playClickScale(clickNode);
        WWW.Instance.CommonAPI({
            web_class: WebUserDiamondSend,
            body: WebUserDiamondSend.Request({
                target_user_id: this._player.userID,
                send_type: 2,
                amount: amount
            })
        }).then((res: any) => {
            if (res && res.code === 0) {
                this._diamondSentCount++;
                if (this.node.activeInHierarchy) {
                    this.refreshDiamondNotice();
                    this.loadDiamondBalance();
                }
                // 发送者在本地播放动画（服务端广播负责其他玩家）
                let game = GameCache.Instance?.CurGame;
                if (game?.throwPropMgr && this._player) {
                    game.throwPropMgr.playDiamondAnimation(GameCache.Instance.nUserId, this._player.userID, amount);
                }
            } else if (res && res.code === 20124) {
                if (this.node.activeInHierarchy) {
                    this._diamondSentCount = this._diamondConfig ? this._diamondConfig.limit_time_pre_day : 999;
                    this.refreshDiamondNotice();
                }
                UIComponent.Instance.Toast(i18nMgr.Get('GiftDiamondError'));
            } else {
                UIComponent.Instance.Toast((res && res.message) || i18nMgr.Get('GiftDiamondError'));
            }
        });
    }

    // ─── 音视频 ───
    /** 加载远端用户音视频轨道状态 */
    private loadAudioVideoState(): void {
        let agora = AgoraManager.Instance;
        if (!this._player || !agora.isJoined) {
            this._hasAudioTrack = false;
            this._hasVideoTrack = false;
            this.updateAudioVideoVisuals();
            return;
        }
        let targetUid = this._player.userID;
        let remoteUsers = agora.getRemoteUsers();
        let target = null;
        for (let i = 0; i < remoteUsers.length; i++) {
            if (remoteUsers[i].uid === targetUid) {
                target = remoteUsers[i];
                break;
            }
        }
        this._hasAudioTrack = (target ? target.hasAudio : false) || UIPlayerInfo._audioClosedUsers.has(targetUid);
        this._hasVideoTrack = (target ? target.hasVideo : false) || UIPlayerInfo._videoClosedUsers.has(targetUid);
        this._isAudioClosed = UIPlayerInfo._audioClosedUsers.has(targetUid);
        this._isVideoClosed = UIPlayerInfo._videoClosedUsers.has(targetUid);
        this.updateAudioVideoVisuals();
    }

    /** 更新音视频按钮视觉状态 */
    private updateAudioVideoVisuals(): void {
        if (!this.$OpButtonNode) return;
        // 音频按钮
        let audioNode = this.$OpButtonNode.getChildByName('audioCloseToggle');
        if (audioNode) {
            if (this._hasAudioTrack) {
                audioNode.opacity = 255;
                this.setToggleBg(audioNode, this._isAudioClosed);
                this.setNodeLabelString(audioNode, this._isAudioClosed ? '打开音频' : '关闭音频');
            } else {
                audioNode.opacity = 128;
                this.setToggleBg(audioNode, false);
                this.setNodeLabelString(audioNode, '关闭音频');
            }
        }
        // 视频按钮
        let videoNode = this.$OpButtonNode.getChildByName('videoCloseToggle');
        if (videoNode) {
            if (this._hasVideoTrack) {
                videoNode.opacity = 255;
                this.setToggleBg(videoNode, this._isVideoClosed);
                this.setNodeLabelString(videoNode, this._isVideoClosed ? '打开视频' : '关闭视频');
            } else {
                videoNode.opacity = 128;
                this.setToggleBg(videoNode, false);
                this.setNodeLabelString(videoNode, '关闭视频');
            }
        }
    }

    /** 关闭/打开远端用户音频 */
    private click_audioClose(): void {
        if (!this._player || !this._hasAudioTrack) return;
        this._isAudioClosed = !this._isAudioClosed;
        AgoraManager.Instance.setRemoteAudioEnabled(!this._isAudioClosed, this._player.userID);
        if (this._isAudioClosed) {
            UIPlayerInfo._audioClosedUsers.add(this._player.userID);
        } else {
            UIPlayerInfo._audioClosedUsers.delete(this._player.userID);
        }
        this.updateAudioVideoVisuals();
    }

    /** 关闭/打开远端用户视频 */
    private click_videoClose(): void {
        if (!this._player || !this._hasVideoTrack) return;
        this._isVideoClosed = !this._isVideoClosed;
        AgoraManager.Instance.setRemoteVideoEnabled(!this._isVideoClosed, this._player.userID);
        if (this._isVideoClosed) {
            UIPlayerInfo._videoClosedUsers.add(this._player.userID);
        } else {
            UIPlayerInfo._videoClosedUsers.delete(this._player.userID);
        }
        this.updateAudioVideoVisuals();
    }

    /** 设置节点上 cc.Label 的文字 */
    private setNodeLabelString(node: cc.Node, text: string): void {
        let label = node.getComponent(cc.Label);
        if (!label) {
            label = node.getComponentInChildren(cc.Label);
        }
        if (label) label.string = text;
    }

    // ─── 扔道具 ───
    /** 初始化道具节点点击事件 */
    private initPropNodes(): void {
        if (!this.$PropOpNode) return;
        for (let i = 1; i <= 12; i++) {
            let node = this.$PropOpNode.getChildByName('$propOp_' + i);
            if (node) {
                let propIndex = i;
                let propNode = node; // 闭包捕获
                this.bindClick(node, () => this.click_prop(propIndex, propNode));
            }
        }
        this.loadPropList();
    }

    /** 从服务端加载扔道具列表，更新 costNum 和 priceId */
    private loadPropList(): void {
        WWW.Instance.CommonAPI({
            web_class: WebPropChatPropList,
            body: WebPropChatPropList.Request({
                prop_type: 4,
                prop_types: [4],
                offset: 0,
                limit: 20
            })
        }).then((res: any) => {
            if (!cc.isValid(this.node) || !res || res.code !== 0 || !res.data) return;
            let list = res.data.list;
            if (!list || !list.length) return;
            this._propListData = [];
            for (let i = 0; i < list.length; i++) {
                let item = list[i];
                let payPrice = item.pay_price || 0;
                let priceId = item.price_id || Def.ConsumeType.CT_EMOJI_2;
                this._propListData.push({ payPrice: payPrice, priceId: priceId });
                // 更新对应道具节点的 costNum Label
                let propIndex = i + 1; // $propOp_1 ~ $propOp_12
                let propNode = this.$PropOpNode.getChildByName('$propOp_' + propIndex);
                if (propNode) {
                    let diamondCost = propNode.getChildByName('diamondCost');
                    let costNum = diamondCost ? diamondCost.getChildByName('costNum') : null;
                    if (costNum) {
                        let label = costNum.getComponent(cc.Label);
                        if (label && payPrice > 0) {
                            label.string = '' + payPrice;
                        }
                    }
                }
            }
        });
    }

    /** 使用道具（对目标玩家发送扔道具广播） */
    private click_prop(propIndex: number, clickNode: cc.Node): void {
        if (!this._player) return;
        let gc = GameCache.Instance;
        this.playClickScale(clickNode);
        // 获取该道具的服务端 priceId 作为 consumeType，默认 CT_EMOJI_2
        let consumeType = Def.ConsumeType.CT_EMOJI_2;
        if (this._propListData[propIndex - 1]) {
            consumeType = this._propListData[propIndex - 1].priceId;
        }
        // 构造内层广播消息 JSON
        let propType = UIPlayerInfo.PROP_TYPE_MAP[propIndex - 1] || UIPlayerInfo.PROP_TYPE_BASE;
        let broadcastMsgData = JSON.stringify({
            name: gc.nick,
            target_user_id: this._player.userID,
            user_id: gc.nUserId,
            type: propType,
            msgType: 1,
            time: TimeHelper.Now,
            sex: gc.sex,
            headUrl: gc.headPic
        });
        // 外层包装
        let extraJson = Broadcast.Request({
            code: 10001,
            data: broadcastMsgData
        });
        // 构造 protobuf 消息
        let msg = new ClientMessageBroadcastMsg();
        let room = new Room();
        room.setRoomId(gc.room_id);
        room.setMatchId(gc.match_id);
        msg.setRoom(room);
        msg.setConsume(consumeType);
        msg.setMsgType(Def.BroadcastMsgType.BC_MSG_THROW);
        let extraBytes = new Uint8Array(Array.from(extraJson).map(c => c.charCodeAt(0)));
        msg.setExtra(extraBytes);
        msg.setMessage('');
        // 暂存道具数据，等服务端返回成功后在本地播放动画
        let game = GameCache.Instance?.CurGame;
        if (game?.TexasGameProtocol) {
            game.TexasGameProtocol.pendingPropData = {
                type: propType,
                user_id: gc.nUserId,
                target_user_id: this._player.userID
            };
        }
        // 发送
        ProtocolAgency.Send<ClientMessageBroadcastMsg.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_BroadcastMsg,
            RoomID: gc.room_id,
            MatchID: gc.match_id,
            Body: msg.toObject()
        });
    }

    // ─── 举报 ───
    /** 举报玩家 */
    private click_report(): void {
        if (!this._player) return;
        UIComponent.open(UIDefine.UIReport, {
            _roomId: GameCache.Instance.room_id,
            _userId: this._player.userID,
            _sendName: this._player.nick,
            _randomNum: this._player.userID,
            _type: 1
        });
    }

    // ─── Toggle 视觉辅助 ───
    /** 更新 Toggle 节点视觉状态 */
    private refreshToggleVisual(name: string, isOn: boolean): void {
        if (!this.$OpButtonNode) return;
        let node = this.$OpButtonNode.getChildByName(name);
        if (!node) return;
        if (name === 'chatCloseToggle' || name === 'shieldToggle') {
            let isMute = name === 'chatCloseToggle';
            this.setNodeLabelString(node, isOn ? (isMute ? '取消禁言' : '取消屏蔽') : isMute ? '禁言' : '屏蔽名字');
            this.setToggleBg(node, isOn);
        } else {
            let checkmark = node.getChildByName('checkmark');
            if (checkmark) {
                checkmark.active = isOn;
            } else {
                node.opacity = isOn ? 255 : 150;
            }
        }
    }

    /** 切换按钮背景纹理：isOn=true 用 toggleOnBg，false 恢复原始 */
    private setToggleBg(node: cc.Node, isOn: boolean): void {
        let bg = node.getChildByName('background') || node;
        let sprite = bg.getComponent(cc.Sprite);
        if (!sprite) return;
        if (isOn && this.toggleOnBg) {
            if (!sprite['_origFrame']) sprite['_origFrame'] = sprite.spriteFrame;
            sprite.spriteFrame = this.toggleOnBg;
            sprite.type = cc.Sprite.Type.SLICED;
        } else {
            if (sprite['_origFrame']) {
                sprite.spriteFrame = sprite['_origFrame'];
                sprite['_origFrame'] = null;
            }
        }
    }

    /** 点击节点缩放动画：放大后恢复，完成后关闭面板 */
    private playClickScale(node: cc.Node): void {
        if (!node || !node.isValid) return;
        let originScale = node.scale;
        cc.tween(node)
            .to(0.075, { scale: originScale * 1.2 })
            .to(0.075, { scale: originScale })
            .call(() => {
                UIComponent.close(UIDefine.UIPlayerInfo);
            })
            .start();
    }

    override onClose(param?: any): void {
        super.onClose(param);
    }
}
