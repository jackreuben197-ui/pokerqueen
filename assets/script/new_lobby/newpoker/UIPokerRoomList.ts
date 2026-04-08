import { API_User_Rooms_ids, API_User_Rooms_List, WebRoomCenterAutoChageRoom, WebRoomCenterUserContrAstRooms, WWW } from "../../net/https/WebRequest";
import ProtocolAgency from "../../net/websocket/ProtocolAgency";
import BaseFormPlus from "../../ui/form/BaseFormPlus";
import UIPokerListItem from "./UIPokerListItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIPokerRoomList extends BaseFormPlus {

    @property(cc.Prefab)
    pokerItemPrefab: cc.Prefab = null;

    protected isReqing: boolean = false;

    protected $allTabNode: cc.Node = null;
    protected $holdemTabNode: cc.Node = null;
    protected $omahaTabNode: cc.Node = null;
    protected $sixplusTabNode: cc.Node = null;

    protected cc_Sprite$allTab: cc.Sprite = null;
    protected cc_Sprite$holdemTab: cc.Sprite = null;
    protected cc_Sprite$omahaTab: cc.Sprite = null;
    protected cc_Sprite$sixplusTab: cc.Sprite = null;

    protected $contentPoker: cc.Node = null;

    // 记录 bkTest 的原始尺寸，用于动画恢复
    private _bkTestOriginalSize: cc.Size = null;
    // 记录当前是否正在动画中
    private _isAnimating: boolean = false;
    // 记录当前是否正在动画中（tableLayout）
    private _isAnimating1: boolean = false;

    //! 记录上次获取房间信息时间戳:
    private lastReqTimeStamp : number = 0;

    //！当前正在显示的RecordList:
    private curDisplayRecordList: Array<any> = [];


    protected lateLoad() {
        this.name = "UIPokerRoomList";
        super.lateLoad();

        // 处理点击事件：
        if (this.$allTabNode) {
            this.$allTabNode.on(cc.Node.EventType.TOUCH_END, this.onAllTabClick, this);
            this.$holdemTabNode.on(cc.Node.EventType.TOUCH_END, this.onHoldemTabClick, this);
            this.$omahaTabNode.on(cc.Node.EventType.TOUCH_END, this.onOmahaTabClick, this);
            this.$sixplusTabNode.on(cc.Node.EventType.TOUCH_END, this.onSixPlusTabClick, this);

            // 默认选中全部：
            this.setTabSel(0);
        }

        // 
        // 不同的获取信息类型:
        if( this.lastReqTimeStamp ){
            this.reqContrastInfo();
        }else
            this.reqRoomIdxList();
    }

    public onEnable(): void {
        super.onEnable();
        if( this.lastReqTimeStamp && (ProtocolAgency.gTimeStamp!=this.lastReqTimeStamp) ){
            this.reqContrastInfo();
        }        
    }


    protected setTabSel(idx: number = 0): void {
        let tabArr: Array<cc.Sprite> = [this.cc_Sprite$allTab, this.cc_Sprite$holdemTab, this.cc_Sprite$omahaTab, this.cc_Sprite$sixplusTab];
        for (let ti: number = 0; ti < 4; ti++) {
            if (ti == idx)
                tabArr[ti].enabled = true;
            else
                tabArr[ti].enabled = false;
        }
    }

    regiterTouchEvents() {
        super.regiterTouchEvents();
    }

    protected onAllTabClick(event: cc.Event.EventTouch): void {
        //console.log('All Tab clicked');
        this.setTabSel(0);

        this.showTabByGameType( [],-1 );
    }

    protected onHoldemTabClick(event: cc.Event.EventTouch): void {
        //console.log('Holdem Tab clicked');
        this.setTabSel(1);

        // 只显示Holdem游戏类型
        this.showTabByGameType( [0],0 );

    }

    protected onOmahaTabClick(event: cc.Event.EventTouch): void {
        //console.log('Omaha Tab clicked');
        this.setTabSel(2);
        
        this.showTabByGameType( [1,2,3],0 );
    }

    protected onSixPlusTabClick(event: cc.Event.EventTouch): void {
        //console.log('SixPlus Tab clicked');
        this.setTabSel(3);

        this.showTabByGameType( [0],2 );
    }

    protected getRidList(res: any): Array<number> {

        if (res.code != 0) return [];
        let arrRid: Array<number> = [];
        let arr: Array<any> = res.data.records;
        for (let ti: number = 0; ti < arr.length; ti++) {
            arrRid.push(arr[ti].rid);
        }

        return arrRid;
    }

    /**
     * 根据 game_type 和 poker_type 分组（第一层）
     * 在集合内部，根据 sb 字段由小到大排列（第二层）
     */
    protected filterRecords(records: Array<any>): any[] {
        if (!records || records.length === 0) {
            return [];
        }

        // 第一步：使用嵌套 Map 进行 $O(n)$ 时间复杂度的快速分组
        const groupMap = new Map<string, Map<number, any[]>>();

        for (const record of records) {
            if (record.game_type > 3 ) {
                continue;
            }

            const { game_type, poker_type, sb } = record;
            const primaryKey = `${game_type}_${poker_type}`;

            if (!groupMap.has(primaryKey)) {
                groupMap.set(primaryKey, new Map<number, any[]>());
            }

            const secondaryMap = groupMap.get(primaryKey)!;
            if (!secondaryMap.has(sb)) {
                secondaryMap.set(sb, []);
            }
            secondaryMap.get(sb)!.push(record);
        }

        // 第二步：将 Map 转换为数组，并对第二层（sb）进行排序
        // 外层：处理不同的 game_type + poker_type 集合
        return Array.from(groupMap.values(), (secondaryMap) => {

            // 内层：处理相同集合下不同的 sb 列表
            // 将 Map 转换为 [sb, list][] 格式以便排序
            return Array.from(secondaryMap.entries())
                .sort((a, b) => a[0] - b[0]) // 根据键名（即 sb 的值）进行升序排列
                .map(entry => entry[1]);     // 只提取排序后的 list 列表部分
        });
    }

    /**
     * 根据游戏类型来显示桌面：
     * @param game_type 
     */
    protected showTabByGameType(game_type: Array<number>,poker_type:number) {
        this.$contentPoker.children.forEach(node => {
            node.getComponent(UIPokerListItem).showByGameType(game_type,poker_type);
        });
    }

    /**
     * 处理对应的PokerListItem数据:
     * @param resarr 
     */
    protected addPokerListItem(resarr: any): void {
        if (this.$contentPoker) {
            // 清除旧的子节点，防止内存泄漏
            this.$contentPoker.removeAllChildren(true);

            for (let ti: number = 0; ti < resarr.length; ti++) {
                for (let tj: number = 0; tj < resarr[ti].length; tj++) {
                    let tnode: cc.Node = cc.instantiate(this.pokerItemPrefab);
                    this.$contentPoker.addChild(tnode);

                    let scrpit: UIPokerListItem = tnode.getComponent(UIPokerListItem)
                    scrpit.setListData(resarr[ti][tj]);

                }
            }

        }
    }


    /**
     * 获取roomID数据的详细信息。
     * @param arrRid 
     */
    protected reqRoomInfo(arrRid: Array<number>) {
        this.isReqing = true;
        WWW.Instance.CommonAPI(
            {
                web_class: API_User_Rooms_List,
                body: {
                    "room_ids": arrRid
                },
            }
        ).then(
            (res: any) => {
                debugger;

                this.curDisplayRecordList = this.filterRecords(res.data.records);
                this.addPokerListItem(this.curDisplayRecordList);

                this.isReqing = false;
            },
            (res: any) => {
                //this.listEx.error();
                debugger;
                this.isReqing = false;
            }
        )
    }

    /**
     * 将 curDisplayRecordList 的 [outerIdx][innerIdx] 映射为 $contentPoker.children 的平铺索引
     */
    protected getFlatIndex(outerIdx: number, innerIdx: number): number {
        let flatIdx = 0;
        for (let i = 0; i < outerIdx; i++) {
            flatIdx += this.curDisplayRecordList[i].length;
        }
        return flatIdx + innerIdx;
    }

    /**
     * constrast请求返回新的Record增量更新到显示数据中
     * @param data
     */
    protected updatePokerRoomList( data : any ) : void{
        if (!data.records || data.records.length <= 0) return;

        // 用 filterRecords 对新数据做同样的分组排序
        let newGroups = this.filterRecords( data.records );
        if (newGroups.length <= 0) return;

        for (let ni = 0; ni < newGroups.length; ni++) {
            for (let nj = 0; nj < newGroups[ni].length; nj++) {
                let newRecords = newGroups[ni][nj];
                if (!newRecords || newRecords.length <= 0) continue;

                let ref = newRecords[0];
                let targetGT = ref.game_type;
                let targetPT = ref.poker_type;
                let targetSB = ref.sb;

                // 在 curDisplayRecordList 中查找匹配的子组 (game_type + poker_type + sb)
                let matchOi = -1, matchOj = -1;
                for (let oi = 0; oi < this.curDisplayRecordList.length; oi++) {
                    for (let oj = 0; oj < this.curDisplayRecordList[oi].length; oj++) {
                        let group = this.curDisplayRecordList[oi][oj];
                        if (group.length > 0
                            && group[0].game_type === targetGT
                            && group[0].poker_type === targetPT
                            && group[0].sb === targetSB) {
                            matchOi = oi;
                            matchOj = oj;
                            break;
                        }
                    }
                    if (matchOi >= 0) break;
                }

                if (matchOi >= 0) {
                    // 情况A：匹配到已有子组，追加数据到已有 ListItem
                    this.curDisplayRecordList[matchOi][matchOj] =
                        this.curDisplayRecordList[matchOi][matchOj].concat(newRecords);
                    let flatIdx = this.getFlatIndex(matchOi, matchOj);
                    let node = this.$contentPoker.children[flatIdx];
                    if (node) {
                        node.getComponent(UIPokerListItem).appendTableData(newRecords);
                    }
                } else {
                    // 查找是否存在同 game_type + poker_type 的外层组
                    let targetOi = -1;
                    for (let oi = 0; oi < this.curDisplayRecordList.length; oi++) {
                        let firstSub = this.curDisplayRecordList[oi][0];
                        if (firstSub && firstSub.length > 0
                            && firstSub[0].game_type === targetGT
                            && firstSub[0].poker_type === targetPT) {
                            targetOi = oi;
                            break;
                        }
                    }

                    // 先 instantiate，再 addChild（触发 onLoad 设置锚点），最后 setListData
                    let newNode: cc.Node = cc.instantiate(this.pokerItemPrefab);

                    if (targetOi >= 0) {
                        // 情况B：外层组存在，按 sb 升序插入新子组
                        let outerGroup = this.curDisplayRecordList[targetOi];
                        let insertIdx = 0;
                        for (let j = 0; j < outerGroup.length; j++, insertIdx++) {
                            if (outerGroup[j].length > 0 && outerGroup[j][0].sb > targetSB) break;
                        }
                        outerGroup.splice(insertIdx, 0, newRecords);
                        let flatIdx = this.getFlatIndex(targetOi, insertIdx);
                        this.$contentPoker.addChild(newNode);
                        newNode.setSiblingIndex(flatIdx);
                    } else {
                        // 情况C：全新的 game_type + poker_type 组
                        this.curDisplayRecordList.push([newRecords]);
                        this.$contentPoker.addChild(newNode);
                    }

                    newNode.getComponent(UIPokerListItem).setListData(newRecords);
                }
            }
        }

        // 刷新父容器布局
        let parentLayout = this.$contentPoker.getComponent(cc.Layout);
        if (parentLayout) parentLayout.updateLayout();
    }

    /**
     * 请求对比信息
     */
    protected reqContrastInfo() : void{
        let reqTimeStame : number = this.lastReqTimeStamp;
        this.isReqing = true;
        this.lastReqTimeStamp = ProtocolAgency.gTimeStamp;
        //console.log( "请求ContrastAPI，设置timestamp数据为:" + reqTimeStame + "," + this.lastReqTimeStamp );
        WWW.Instance.CommonAPI(

            {

                web_class: WebRoomCenterUserContrAstRooms,
                body: {
                    "last_time" : reqTimeStame,
                }
            }

        ).then(

            (res: any) => {
                debugger;
                this.isReqing = false;
                if( res.data.records && (res.data.records.length>0) ){
                    this.updatePokerRoomList( res.data );
                }
                
            }
            ,
            (res: any) => {
                this.isReqing = false;
            }
        );
    }

    /**
     * 获取全部信息:
     * @param offset 
     */
    protected reqRoomIdxList(offset: number = 0): void {

        this.isReqing = true;
        this.lastReqTimeStamp = ProtocolAgency.gTimeStamp;
        //console.log( "请求RoomIdxList,设置Last ReqTimeStame:" + this.lastReqTimeStamp );

        WWW.Instance.CommonAPI(
            {
                web_class: API_User_Rooms_ids,// API_User_Rooms_List,
                body: {
                },
            }
        ).then(
            (res: any) => {
                
                let arrRis: Array<number> = this.getRidList(res);
                if (arrRis.length > 0) {
                    this.reqRoomInfo(arrRis);
                } else {
                    this.isReqing = false;
                }
            },
            (res: any) => {
                //this.listEx.error();
                console.log( "返回出错，reqRoomIdxList Error:" + JSON.stringify( res ) );
                this.lastReqTimeStamp = 0;
                this.isReqing = false;
            }
        )
    }


}