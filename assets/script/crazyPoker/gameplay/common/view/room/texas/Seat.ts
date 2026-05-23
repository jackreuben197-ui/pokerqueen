import { StringHelper } from "../../../../../../helper/StringHelper";
import TexasGameRoomData from "../../../../texas/data/TexasGameRoomData";
import TexasGameRoomDataPlayer, { chipsWithStore } from "../../../../texas/data/TexasGameRoomDataPlayer";
import { SeatPosition } from "../../../../texas/data/TexasGameRoomDataSeatsStateManager";
import roomDataManager from "../../../core/RoomDataManager";
import RemoteSprite from "../../common/RemoteSprite";

const { ccclass, property, menu } = cc._decorator;

const seatArrange: Record<SeatPosition, cc.Vec3> = {
    [SeatPosition.BottomMiddle]: cc.v3(0, -2270),   // 0 下中
    [SeatPosition.BottomLeft]:   cc.v3(-480, -1580), // 1 左下
    [SeatPosition.MiddleLeft]:   cc.v3(-480, -1130), // 2 左中
    [SeatPosition.TopLeft]:      cc.v3(-480, -730),  // 3 左上
    [SeatPosition.TopLeft1]:      cc.v3(-165, -440),  // 4 上左
    [SeatPosition.TopMiddle]:    cc.v3(0, -440),     // 5 上中
    [SeatPosition.TopRight1]:     cc.v3(165, -440),   // 6 上右
    [SeatPosition.TopRight]:     cc.v3(480, -730),   // 7 右上
    [SeatPosition.MiddleRight]:  cc.v3(480, -1130),  // 8 右中
    [SeatPosition.BottomRight]:  cc.v3(480, -1580)   // 9 右下
};

@ccclass
@menu('CrazyPoker/Room/Texas/Seat')
export default class Seat extends cc.Component {
    @property(cc.Label)
    private nickName: cc.Label = null;
    @property(RemoteSprite)
    private avatar: RemoteSprite = null;
    @property(cc.Label)
    private chips: cc.Label = null;
    @property(cc.Button) 
    private emptySeat: cc.Button = null;
    @property(cc.Node) 
    private userSeat: cc.Node = null;
    @property(cc.Node)
    private buttonIcon: cc.Node = null;
    @property(cc.Node)
    private smallCardsContainer: cc.Node = null
    // round bet related
    @property(cc.Node) 
    private roundBetNode: cc.Node = null;
    @property(cc.Label)
    private roundBetLabel: cc.Label = null;
    @property(cc.Node)
    private roudBetIcon: cc.Node = null;
    @property(cc.Node)
    private bigCardsContainer: cc.Node = null;
    private _seatPlayer: TexasGameRoomDataPlayer;

    public initData(seatPlayer: TexasGameRoomDataPlayer) {
        this._seatPlayer = seatPlayer;
        if (this.node.activeInHierarchy) {
            this._bindEventsAndRefresh();
        }
    }

    public onLoad() {
        // 如果绑定点击写这里
    }

    public onEnable(): void {
        if (!this._seatPlayer) return;
        this._bindEventsAndRefresh();
    }

    public onDisable(): void {
        if (this._seatPlayer) {
            this._seatPlayer.targetOff(this);
            this._seatPlayer = null;
        }
    }

    private _bindEventsAndRefresh() {
        this._seatPlayer.on(TexasGameRoomDataPlayer.NICKNAME_CHANGE, this.onUpdateNickname, this);
        this._seatPlayer.on(TexasGameRoomDataPlayer.AVATAR_CHANGE, this.onUpdateAvatar, this);
        this._seatPlayer.on(TexasGameRoomDataPlayer.CHIP_CHANGE, this.onUpdateChip, this);
        this._seatPlayer.on(TexasGameRoomDataPlayer.EMPTY_SEAT, this.onUpdateEmpty, this);
        this._seatPlayer.on(TexasGameRoomDataPlayer.SEAT_POSITION_CHANGE, this.onUpdatePosition,this);
        this._seatPlayer.on(TexasGameRoomDataPlayer.ROUND_BET_CHANGE, this.onRoundBetChange,this);

        if (this._seatPlayer.userID > 0) {
            this.userSeat.active = true;
            this.emptySeat.node.active = false;
            this.emptySeat.interactable = false;
            this.onUpdateNickname( this._seatPlayer.name);
            this.onUpdateAvatar( this._seatPlayer.avatar);
            this.onUpdateChip( this._seatPlayer.chip);
            this.onRoundBetChange(this._seatPlayer.roundBet);
        }else{
            this.userSeat.active = false;
            this.emptySeat.node.active = true;
            this.emptySeat.interactable = true;
            this.onUpdateEmpty();
        }
        this.onUpdatePosition(this._seatPlayer.position, false);
    }

    private onUpdateNickname(na: string) {
        this.nickName.string = na;
    }

    private onUpdateAvatar(avatar: string) {
        this.avatar.url = avatar;
    }

    private onUpdateChip(chip: number) {
        this.chips.string = StringHelper.GetLongString(chip);
    }

    private onRoundBetChange(amount: number) {
        this.roundBetLabel.string =StringHelper.GetLongString(amount);
    }

    // onUpdatePosition 位置变动导致的动画/位置调整
    private onUpdatePosition(pos: SeatPosition, animated = false) {
        switch(pos){
        case SeatPosition.BottomMiddle:
            this.buttonIcon.setPosition(-160, -120);
            this.roudBetIcon.setPosition(-25, 0);
            this.roundBetNode.setPosition(135,345);
            this.smallCardsContainer.setPosition(-160,5);
            this.bigCardsContainer.setPosition(0,18);
            this.bigCardsContainer.setScale(0.8,0.8);
            break;
        case SeatPosition.BottomLeft:
            this.buttonIcon.setPosition(0, -215);
            this.roudBetIcon.setPosition(-25, 0);
            this.roundBetNode.setPosition(190,-70);
            this.smallCardsContainer.setPosition(160,5);
            this.bigCardsContainer.setPosition(0,18);
            this.bigCardsContainer.setScale(0.8,0.8);
            break;
        case SeatPosition.MiddleLeft:
            this.buttonIcon.setPosition(0, -215);
            this.roudBetIcon.setPosition(-25, 0);
            this.roundBetNode.setPosition(190,-70);
            this.smallCardsContainer.setPosition(160,5);
            this.bigCardsContainer.setPosition(0,18);
            this.bigCardsContainer.setScale(0.8,0.8);
            break;
        case SeatPosition.TopLeft:
            this.buttonIcon.setPosition(0, -215);
            this.roudBetIcon.setPosition(-25, 0);
            this.roundBetNode.setPosition(190,-70);
            this.smallCardsContainer.setPosition(160,5);
            this.bigCardsContainer.setPosition(0,18);
            this.bigCardsContainer.setScale(0.8,0.8);
            break;
        case SeatPosition.TopLeft1:
            this.buttonIcon.setPosition(65, -220);
            this.roudBetIcon.setPosition(-25, 0);
            this.roundBetNode.setPosition(-65,-215);
            this.smallCardsContainer.setPosition(-160,5);
            this.bigCardsContainer.setPosition(0,18);
            this.bigCardsContainer.setScale(0.8,0.8);
            break;
        case SeatPosition.TopMiddle:
            this.buttonIcon.setPosition(65, -220);
            this.roudBetIcon.setPosition(133, 0);
            this.roundBetNode.setPosition(-85,-215);
            this.smallCardsContainer.setPosition(-160,5);
            this.bigCardsContainer.setPosition(0,18);
            this.bigCardsContainer.setScale(0.8,0.8);
            break;
        case SeatPosition.TopRight1:
            this.buttonIcon.setPosition(65, -220);
            this.roudBetIcon.setPosition(133, 0);
            this.roundBetNode.setPosition(-85,-215);
            this.smallCardsContainer.setPosition(-160,5);
            this.bigCardsContainer.setPosition(0,18);
            this.bigCardsContainer.setScale(0.8,0.8);
            break;
        case SeatPosition.TopRight:
            this.buttonIcon.setPosition(0, -215);
            this.roudBetIcon.setPosition(133, 0);
            this.roundBetNode.setPosition(-180,-70);
            this.smallCardsContainer.setPosition(-160,5);
            this.bigCardsContainer.setPosition(0,18);
            this.bigCardsContainer.setScale(0.8,0.8);
            break;
        case SeatPosition.MiddleRight:
            this.buttonIcon.setPosition(0, -215);
            this.roudBetIcon.setPosition(133, 0);
            this.roundBetNode.setPosition(-180,-70);
            this.smallCardsContainer.setPosition(-160,5);
            this.bigCardsContainer.setPosition(0,18);
            this.bigCardsContainer.setScale(0.8,0.8);
            break;
        case SeatPosition.BottomRight:
            this.buttonIcon.setPosition(0, -215);
            this.roudBetIcon.setPosition(133, 0);
            this.roundBetNode.setPosition(-180,-70);
            this.smallCardsContainer.setPosition(-160,5);
            this.bigCardsContainer.setPosition(0,18);
            this.bigCardsContainer.setScale(0.8,0.8);
            break;
        }
        let realPos = seatArrange[pos];
        if (animated) {
            this.node.opacity = 0;
            cc.tween(this.node)
                .parallel(
                    cc.tween().to(1, {opacity: 255}),
                    cc.tween().to(1, {position: realPos}, { easing: 'backOut'})
                ).start();
            return;
        }
        this.node.setPosition(realPos);
    }

    private onUpdateEmpty() {
        console.log('empty');
        this.emptySeat.node.active = true;
        this.emptySeat.interactable = true;
    } 

}