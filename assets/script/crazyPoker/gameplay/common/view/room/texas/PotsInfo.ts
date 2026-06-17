import { StringHelper } from '../../../../../../helper/StringHelper';
import { i18nMgr } from '../../../../../../i18n/i18nMgr';
import { SidePot } from '../../../../../../protobuf/holdem/define_pb';
import TexasGameRoomData from '../../../../texas/data/TexasGameRoomData';
import TexasGameRoomDataPotInfo from '../../../../texas/data/TexasGameRoomDataPotInfo';
import roomDataManager from '../../../core/RoomDataManager';
const { ccclass, property, menu } = cc._decorator;

const LN = '[PotsInfo]';

// 行间距(换行时上下两行之间的垂直间距)
const ROW_SPACING_Y = 6;
// 同一行池子之间的水平间距
const COL_SPACING_X = 8;

@ccclass
@menu('CrazyPoker/Room/Texas/PotsInfo')
export default class PotsInfo extends cc.Component {
    @property(cc.Label)
    private allPotsLabel: cc.Label = null;
    @property(cc.Node)
    private mainPot: cc.Node = null;
    @property(cc.Node)
    private sidePot: cc.Node = null;
    private _allPotsNodes: cc.Node[] = [];
    private _potInfo: TexasGameRoomDataPotInfo;
    /** 边池容器(sidePot 的父节点) */
    private _container: cc.Node = null;

    public initData(roomID: number, matchID: number) {
        const roomData = roomDataManager.getRoomData<TexasGameRoomData>(roomID, matchID);
        this._potInfo = roomData.potInfo;
        if (this.node.activeInHierarchy) {
            this._bindEventsAndRefresh();
        }
    }

    public onLoad() {
        this.allPotsLabel.node.active = false;
        this.mainPot.active = false;
        this._allPotsNodes.push(this.mainPot);
        // 预创建 8 个边池节点
        for (let i = 0; i < 8; i++) {
            const pot = cc.instantiate(this.sidePot);
            pot.active = false;
            pot.parent = this.sidePot.parent;
            this._allPotsNodes.push(pot);
        }
        this._container = this.sidePot.parent;
        // 禁用容器自带的 Layout(由代码控制换行布局)
        const containerLayout = this._container.getComponent(cc.Layout);
        if (containerLayout) {
            containerLayout.enabled = false;
        }
    }

    public onEnable(): void {
        if (!this._potInfo) return;
        this._bindEventsAndRefresh();
    }

    public onDisable(): void {
        if (this._potInfo) {
            this._potInfo.targetOff(this);
            this._potInfo = null;
        }
    }

    private _bindEventsAndRefresh() {
        this._potInfo.on(TexasGameRoomDataPotInfo.POTLIST_CHANGE, this.onUpdatePotList, this);
        this._potInfo.on(TexasGameRoomDataPotInfo.ALLPOTS_CHANGE, this.onUpdateAllPots, this);
        this.onUpdatePotList(this._potInfo.potList);
        this.onUpdateAllPots(this._potInfo.allPot);
    }

    private onUpdateAllPots(allpots: number) {
        this.allPotsLabel.string = `${i18nMgr.Get('adaptation20005')} : ${StringHelper.GetLongString(allpots, 100, 1)}`;
        this.allPotsLabel.node.active = true;
    }

    private onUpdatePotList(pots: SidePot.AsObject[]) {
        if (!pots) return;
        const count = pots.length;

        // 1. 先把文本设置好,并强制刷新每个 Pot 的内部 Layout 得到真实宽度
        const visibleNodes: cc.Node[] = [];
        for (let i = 0; i < this._allPotsNodes.length; i++) {
            const potNode = this._allPotsNodes[i];
            if (i >= count) {
                potNode.active = false;
                continue;
            }
            const potData = pots[i];
            potNode.active = true;
            const lbl = potNode.getComponentInChildren(cc.Label);
            lbl.string = StringHelper.GetLongString(potData.amount, 100, 1);
            // 触发 Pot 自身 HORIZONTAL/CONTAINER Layout 立即更新宽度
            const innerLayout = potNode.getComponent(cc.Layout);
            if (innerLayout) {
                innerLayout.updateLayout();
            }
            visibleNodes.push(potNode);
        }

        // 2. 根据容器最大宽度做换行布局
        this._layoutWithWrap(visibleNodes);
    }

    /**
     * 自定义换行布局:
     * - 单行总宽度 <= 容器宽度时,所有 pot 居中排成一行
     * - 超出时换行,每行内居中,行间垂直堆叠
     */
    private _layoutWithWrap(nodes: cc.Node[]) {
        if (nodes.length === 0) return;

        const maxWidth = this._container.width;

        // 将节点分行
        const rows: cc.Node[][] = [];
        let currentRow: cc.Node[] = [];
        let currentRowWidth = 0;

        for (const node of nodes) {
            const w = node.width;
            // 当前行已经有节点,且加上新节点会超宽 -> 换行
            const widthIfAdded = currentRow.length === 0 ? w : currentRowWidth + COL_SPACING_X + w;
            if (currentRow.length > 0 && widthIfAdded > maxWidth) {
                rows.push(currentRow);
                currentRow = [node];
                currentRowWidth = w;
            } else {
                currentRow.push(node);
                currentRowWidth = widthIfAdded;
            }
        }
        if (currentRow.length > 0) rows.push(currentRow);

        // 计算每行高度(取该行最高的节点高度)
        const rowHeights: number[] = rows.map(row => {
            let h = 0;
            for (const n of row) if (n.height > h) h = n.height;
            return h;
        });

        // 容器总高度 = 所有行高 + 行间距
        let totalHeight = 0;
        for (let i = 0; i < rowHeights.length; i++) {
            totalHeight += rowHeights[i];
            if (i > 0) totalHeight += ROW_SPACING_Y;
        }

        // 从上往下放:首行 y = totalHeight/2 - rowHeights[0]/2
        // 容器锚点默认 0.5,坐标系 y 向上为正
        let cursorY = totalHeight / 2;
        for (let r = 0; r < rows.length; r++) {
            const row = rows[r];
            const rowH = rowHeights[r];
            // 当前行 y 中心
            const rowCenterY = cursorY - rowH / 2;

            // 计算该行实际总宽
            let rowWidth = 0;
            for (let i = 0; i < row.length; i++) {
                rowWidth += row[i].width;
                if (i > 0) rowWidth += COL_SPACING_X;
            }

            // 水平居中: 起始 x = -rowWidth/2 + 第一个节点宽度/2
            let cursorX = -rowWidth / 2;
            for (const n of row) {
                const halfW = n.width / 2;
                n.setPosition(cursorX + halfW, rowCenterY);
                cursorX += n.width + COL_SPACING_X;
            }

            cursorY -= rowH + ROW_SPACING_Y;
        }
    }
}
