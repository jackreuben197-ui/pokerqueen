import { StringHelper } from '../../../../../../helper/StringHelper';
import { i18nMgr } from '../../../../../../i18n/i18nMgr';
import { AnimateDisplayTypeAction, AnimateDisplayTypePublicCards } from '../../../../texas/constants/AnimateDisplayType';
import TexasGameRoomData from '../../../../texas/data/TexasGameRoomData';
import TexasGameRoomDataBasic from '../../../../texas/data/TexasGameRoomDataBasic';
import TexasGameRoomDataPublicCards from '../../../../texas/data/TexasGameRoomDataPublicCards';
import roomDataManager from '../../../core/RoomDataManager';
import CardView from '../../common/CardView';
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('CrazyPoker/Room/Texas/PublicCardsInfo')
export default class PublicCardsInfo extends cc.Component {
    private _publicCards: CardView[] = [];
    private _secPublicCards: CardView[] = [];
    private _publicCardsData: TexasGameRoomDataPublicCards;

    public initData(roomID: number, matchID: number) {
        const roomData = roomDataManager.getRoomData<TexasGameRoomData>(roomID, matchID);
        this._publicCardsData = roomData.publicCards;
        if (this.node.activeInHierarchy) {
            this._bindEventsAndRefresh();
        }
    }

    public onLoad() {
        // 如果绑定点击写这里
        for (let i=0; i<5; i++) {
            this._publicCards.push(this.node.children[i].getComponent(CardView));
        }
        for (let i=5; i<10; i++) {
            this._secPublicCards.push(this.node.children[i].getComponent(CardView));
            console.log(this._secPublicCards[i-5]);
        }
    }

    public onEnable(): void {
        if (!this._publicCardsData) return;
        this._bindEventsAndRefresh();
    }

    public onDisable(): void {
        if (this._publicCardsData) {
            this._publicCardsData.targetOff(this);
            this._publicCardsData = null;
        }
    }

    private _bindEventsAndRefresh() {
        this._publicCardsData.on(TexasGameRoomDataPublicCards.PUBLICCARDS_CHANGE, this.onUpdatePublicCards, this);
        this._publicCardsData.on(TexasGameRoomDataPublicCards.SECOND_PUBLICCARDS_CHANGE, this.onUpdateSecPublicCards, this);
        this._publicCardsData.on(TexasGameRoomDataPublicCards.ALL_PUBLICCARDS_RESET, this.onUpdateResetPublicCards, this);
        // 初始化
        this.onUpdatePublicCards([], this._publicCardsData.publicCards, AnimateDisplayTypePublicCards.Static);
        this.onUpdateSecPublicCards([], this._publicCardsData.secondPublicCards, AnimateDisplayTypePublicCards.Static);
    }

    public onUpdateResetPublicCards() {
        this._publicCards.forEach(v => v.node.active = false);
        this._secPublicCards.forEach(v => v.node.active = false);
    }

    private onUpdatePublicCards(prev: number[], plus: number[], pat: AnimateDisplayTypePublicCards) {
        const prevCardsLen = prev.length;
        this._publicCards.slice(prevCardsLen+plus.length).forEach(v => v.node.active = false);
        if (pat == AnimateDisplayTypePublicCards.Static) {
            // 直接显示
            plus.forEach((v, index) => {
                this._publicCards[prevCardsLen+index].node.active = true;
                this._publicCards[prevCardsLen+index].cardNum = v;
            })
            return;
        }
        //要做复杂动画
        let startPos = this._publicCards[0].node.position;
        let moveDuration = .6;
        if (prevCardsLen > 0) {
            moveDuration = 0;
        }
        plus.forEach((v, index) => {
            const node = this._publicCards[index + prevCardsLen];
            node.node.active = true;
            if (prevCardsLen == 0) {
                const endPos = node.node.position;
                node.node.setPosition(startPos);
                node.cardNum = 0;
                cc.tween(node.node)
                    .to( moveDuration, 
                        { position: endPos }, 
                        { easing: 'cubicOut'}
                    )
                    .call(() => {
                        node.animateFlipToFront(v, 0.6);
                    })
                    .start();
                return;
            }
            node.animateFlipToFront(v, 0.6);
        })
    }

    private onUpdateSecPublicCards(prev: number[], plus: number[], pat: AnimateDisplayTypePublicCards) {
        const prevCardsLen = prev.length;
        this._secPublicCards.slice(prevCardsLen+plus.length).forEach(v => v.node.active = false);
        if (pat == AnimateDisplayTypePublicCards.Static) {
            // 直接显示
            plus.forEach((v, index) => {
                this._secPublicCards[prevCardsLen+index].node.active = true;
                this._secPublicCards[prevCardsLen+index].cardNum = v;
            })
            return;
        }
        //要做复杂动画
        let startPos = this._secPublicCards[0].node.position;
        let moveDuration = .6;
        if (prevCardsLen > 0) {
            moveDuration = 0;
        }
        plus.forEach((v, index) => {
            const node = this._secPublicCards[index + prevCardsLen];
            node.node.active = true;
            if (prevCardsLen == 0) {
                const endPos = node.node.position;
                node.node.setPosition(startPos);
                node.cardNum = 0;
                cc.tween(node.node)
                    .to( moveDuration, 
                        { position: endPos }, 
                        { easing: 'cubicOut'}
                    )
                    .call(() => {
                        node.animateFlipToFront(v, 0.6);
                    })
                    .start();
                return;
            }
            node.animateFlipToFront(v, 0.6);
        })
    }

}
