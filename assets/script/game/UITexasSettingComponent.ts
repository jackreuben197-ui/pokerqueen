/*
 * @Author: xfj
 * @Date: 2022-08-25 16:13:45
 * @description:  个性设置界面
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-03-23 11:25:30
 * @FilePath: /pokerqueen/assets/script/game/UITexasSettingComponent.ts
 */
import GC from '../frame/GameControl';
import { i18nMgr } from '../i18n/i18nMgr';
import StorageKey from '../session/StorageKey';
import SoundComponent from '../sound/SoundComponent';
import UIBase from '../ui/UIBase';
import UIComponent from '../ui/UIComponent';
import { GameCache } from './GameCache';
const { ccclass, property } = cc._decorator;

@ccclass
export default class UITexasSettingComponent extends UIBase {
    DeskGroup: cc.Node = null;
    CardGroup: cc.Node = null;
    QuickActionGroup: cc.Node = null;
    QuickActionNumGroup: cc.Node = null;
    Button_Close: cc.Node = null;
    Toggle_Voice: cc.Node = null;
    _selectDesk: cc.Node = null;
    _selectCardType: cc.Node = null;
    _selectQuickAction: cc.Node = null;
    _deskExpanded: boolean = false;
    @property(cc.SpriteFrame)
    arrowDown: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    arrowUp: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    btnSetSelect: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    btnSetNormal: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    poolSelect: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    poolNormal: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    checkOn: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    checkOff: cc.SpriteFrame = null;
    private static readonly COLOR_SELECTED = cc.Color.BLACK;
    private static readonly COLOR_NORMAL = cc.Color.WHITE;
    private _selectedButtonSet: cc.Node = null;
    private _selectedPoolSet: cc.Node = null;
    private _selectedTab: cc.Node = null;
    private _sliderDragging: boolean = false;
    private static readonly SLIDER_BASE_WIDTH = 800;
    private static readonly SLIDER_MIN_X = 80;
    private static readonly SLIDER_STEP = 8;
    curQuickActionIndex = 2;

    //soundIsOpen = true;
    protected lateLoad(): void {
        super.lateLoad();
        this.DeskGroup = this.getChildNodeOrComponent('DeskGroup');
        this.CardGroup = this.getChildNodeOrComponent('CardGroup');
        this.QuickActionGroup = this.getChildNodeOrComponent('QuickActionGroup');
        this.QuickActionNumGroup = this.getChildNodeOrComponent('QuickActionNumGroup');
        this.Button_Close = this.getChildNodeOrComponent('Button_Close');
        this.Toggle_Voice = this.getChildNodeOrComponent('Toggle_Voice');
        cc.log('lateLoad ', this.UIDefine);
        this.Toggle_Voice.on('click', this.onValueChangedVoice, this);
        this.Button_Close.on(
            'click',
            () => {
                UIComponent.close(this.UIDefine);
            },
            this
        );
        // 点击面板外部区域关闭（根节点 = 全屏遮罩，Image_Dialog = 面板内容）
        let imageDialog = this.getChildNodeOrComponent('Image_Dialog') as cc.Node;
        if (imageDialog) {
            imageDialog.on(
                cc.Node.EventType.TOUCH_END,
                (e: cc.Event.EventTouch) => {
                    e.stopPropagation(); // 阻止冒泡，点击面板内容不关闭
                },
                this
            );
        }
        this.node.on(
            cc.Node.EventType.TOUCH_END,
            () => {
                UIComponent.close(this.UIDefine);
            },
            this
        );
        let closeVoice = cc.find('Background/closeVoice', this.Toggle_Voice);
        let openVoice = cc.find('Background/openVoice', this.Toggle_Voice);
        openVoice.active = SoundComponent.Instance.soundOn == true;
        closeVoice.active = SoundComponent.Instance.soundOn == false;
        // if (!GC.localStore.getItem(StorageKey.soundIsOpen)) {
        //     this.soundIsOpen = true;
        //     closeVoice.active = false
        //     openVoice.active = true;
        // }
        // else if (GC.localStore.getItem(StorageKey.soundIsOpen) == 1 + '') {
        //     closeVoice.active = false
        //     openVoice.active = true;
        //     this.soundIsOpen = true;
        // } else {
        //     closeVoice.active = true
        //     openVoice.active = false;
        //     this.soundIsOpen = false;
        // }
        this.initDeskClickListen();
        this.initTableSwitch();
        this.initCardClickListen();
        this.initButtonSet();
        this.initPoolSet();
        this.initSlider();
        this.initTabTitle();
        this.initCheckToggle();
        this.initQuickActionListen();
        this.setUpQuickActionNum();
    }

    /**
     * @method  牌桌背景
     */
    private static readonly DESK_VISIBLE_COUNT = 4;

    initDeskClickListen() {
        let selectedIndex = GameCache.Instance.CurGame.deskType;
        for (let index = 0; index < this.DeskGroup.childrenCount; index++) {
            const element = this.DeskGroup.children[index];
            element.active = index < UITexasSettingComponent.DESK_VISIBLE_COUNT;
            if (!element.active) continue;
            element['index'] = index;
            element.on('click', this.setCheckmarkState, this);
            cc.find('Background/Checkmark', element).active = index === selectedIndex;
        }
        this._selectDesk = this.DeskGroup.children[selectedIndex];
    }

    initTableSwitch() {
        let tableSwitch = this.getChildNodeOrComponent('tableSwitch') as cc.Node;
        console.log('[UITexasSetting] tableSwitch found:', !!tableSwitch);
        if (tableSwitch) {
            tableSwitch.on(cc.Node.EventType.TOUCH_END, this.toggleDeskExpand, this);
        }
    }

    toggleDeskExpand() {
        console.log('[UITexasSetting] toggleDeskExpand clicked, expanded:', !this._deskExpanded);
        this._deskExpanded = !this._deskExpanded;
        // 切换箭头方向
        let tableSwitch = this.getChildNodeOrComponent('tableSwitch') as cc.Node;
        if (tableSwitch) {
            let arrow = tableSwitch.getChildByName('Arrow');
            if (arrow) {
                let sprite = arrow.getComponent(cc.Sprite);
                if (sprite) {
                    sprite.spriteFrame = this._deskExpanded ? this.arrowUp : this.arrowDown;
                }
            }
        }
        let visibleCount = this._deskExpanded ? this.DeskGroup.childrenCount : UITexasSettingComponent.DESK_VISIBLE_COUNT;
        for (let index = 0; index < this.DeskGroup.childrenCount; index++) {
            const element = this.DeskGroup.children[index];
            element.active = index < visibleCount;
            if (element.active && !element['index'] && element['index'] !== 0) {
                element['index'] = index;
                element.on('click', this.setCheckmarkState, this);
            }
        }
    }

    setCheckmarkState(event): void {
        if (this._selectDesk) {
            let checkmark = cc.find('Background/Checkmark', this._selectDesk);
            checkmark.active = false;
        }
        this._selectDesk = event.node;
        let checkmark = cc.find('Background/Checkmark', this._selectDesk);
        checkmark.active = true;
        GC.localStore.setItem(StorageKey.SettingDeskType, this._selectDesk['index']);
        GameCache.Instance.CurGame.SetDeskType(this._selectDesk['index']);
    }

    /**
     * @method  牌的样式
     */
    initCardClickListen() {
        let selectedIndex = Number(GameCache.Instance.CurGame.pokerType);
        for (let index = 0; index < this.CardGroup.childrenCount; index++) {
            const element = this.CardGroup.children[index];
            element.on('click', this.setCardState, this);
            element['index'] = index;
            element.getChildByName('Checkmark').active = index === selectedIndex;
        }
    }

    setCardState(event): void {
        GC.localStore.setItem(StorageKey.SettingPokerType, String(event.node['index']));
        GameCache.Instance.CurGame.SetPokerType(event.node['index']);
        this.initCardClickListen();
    }

    /**
     * @method  按钮组切换（三按钮 / 五按钮）
     */
    initButtonSet() {
        let threeBtn = this.getChildNodeOrComponent('threeButtonSet') as cc.Node;
        let fiveBtn = this.getChildNodeOrComponent('fiveButtonSet') as cc.Node;
        if (threeBtn) {
            threeBtn.on(cc.Node.EventType.TOUCH_END, () => this.onButtonSetClick(threeBtn, fiveBtn), this);
        }
        if (fiveBtn) {
            fiveBtn.on(cc.Node.EventType.TOUCH_END, () => this.onButtonSetClick(fiveBtn, threeBtn), this);
        }
        if (threeBtn) {
            this.applyButtonSetState(threeBtn, true);
            this.applyButtonSetState(fiveBtn, false);
            this._selectedButtonSet = threeBtn;
        }
    }

    onButtonSetClick(selected: cc.Node, other: cc.Node) {
        if (this._selectedButtonSet === selected) return;
        this._selectedButtonSet = selected;
        this.applyButtonSetState(selected, true);
        this.applyButtonSetState(other, false);
    }

    applyButtonSetState(btn: cc.Node, selected: boolean) {
        if (!btn) return;
        let background = btn.getChildByName('Background');
        if (background) {
            let sprite = background.getComponent(cc.Sprite);
            if (sprite) {
                sprite.spriteFrame = selected ? this.btnSetSelect : this.btnSetNormal;
            }
        }
        let label = btn.getComponentInChildren(cc.Label);
        if (label) {
            label.node.color = selected ? UITexasSettingComponent.COLOR_SELECTED : UITexasSettingComponent.COLOR_NORMAL;
        }
    }

    /**
     * @method  底池设置切换（poolSetNode 下的三个按钮）
     */
    initPoolSet() {
        let poolSetNode = this.getChildNodeOrComponent('poolSetNode') as cc.Node;
        if (!poolSetNode) return;
        for (let index = 0; index < poolSetNode.childrenCount; index++) {
            const element = poolSetNode.children[index] as cc.Node;
            element.on(cc.Node.EventType.TOUCH_END, () => this.onPoolSetClick(element), this);
            let background = element.getChildByName('Background');
            if (background) {
                let sprite = background.getComponent(cc.Sprite);
                if (sprite) {
                    sprite.spriteFrame = index === 0 ? this.poolSelect : this.poolNormal;
                }
            }
        }
        this._selectedPoolSet = poolSetNode.children[0] as cc.Node;
    }

    onPoolSetClick(selected: cc.Node) {
        if (this._selectedPoolSet === selected) return;
        this.applyPoolSetState(this._selectedPoolSet, false);
        this.applyPoolSetState(selected, true);
        this._selectedPoolSet = selected;
    }

    applyPoolSetState(btn: cc.Node, selected: boolean) {
        if (!btn) return;
        let background = btn.getChildByName('Background');
        if (background) {
            let sprite = background.getComponent(cc.Sprite);
            if (sprite) {
                sprite.spriteFrame = selected ? this.poolSelect : this.poolNormal;
            }
        }
    }

    /**
     * @method  checkNode 开关切换（soundSet / bbSet）
     */
    initCheckToggle() {
        // soundSet 的 checkNode 关联声音开关
        let soundSet = this.getChildNodeOrComponent('soundSet') as cc.Node;
        if (soundSet) {
            let soundCheck = soundSet.getChildByName('checkNode') as cc.Node;
            if (soundCheck) {
                let sprite = soundCheck.getComponent(cc.Sprite);
                if (sprite) {
                    sprite.spriteFrame = SoundComponent.Instance.soundOn ? this.checkOn : this.checkOff;
                }
                soundCheck.on(
                    cc.Node.EventType.TOUCH_END,
                    () => {
                        this.onValueChangedVoice();
                        let sprite = soundCheck.getComponent(cc.Sprite);
                        if (sprite) {
                            sprite.spriteFrame = SoundComponent.Instance.soundOn ? this.checkOn : this.checkOff;
                        }
                    },
                    this
                );
            }
        }
        // bbSet 的 checkNode 独立切换贴图
        let bbSet = this.getChildNodeOrComponent('bbSet') as cc.Node;
        if (bbSet) {
            let bbCheck = bbSet.getChildByName('checkNode') as cc.Node;
            if (bbCheck) {
                bbCheck.on(
                    cc.Node.EventType.TOUCH_END,
                    () => {
                        let sprite = bbCheck.getComponent(cc.Sprite);
                        if (!sprite) return;
                        let isOn = sprite.spriteFrame === this.checkOn;
                        sprite.spriteFrame = isOn ? this.checkOff : this.checkOn;
                    },
                    this
                );
            }
        }
    }

    /**
     * @method  TabTitle 标签页切换
     */
    initTabTitle() {
        let tabTitle = this.getChildNodeOrComponent('TabTitle') as cc.Node;
        if (!tabTitle) return;
        for (let index = 0; index < tabTitle.childrenCount; index++) {
            const element = tabTitle.children[index] as cc.Node;
            element.on(cc.Node.EventType.TOUCH_END, this.onTabClick.bind(this, element, tabTitle), this);
            let select = element.getChildByName('select');
            if (select) {
                select.active = index === 0;
            }
        }
        this._selectedTab = tabTitle.children[0] as cc.Node;
        // 初始化显示第一个 Tab 内容
        let imageDialog = this.getChildNodeOrComponent('Image_Dialog') as cc.Node;
        if (imageDialog) {
            for (let i = 0; i < imageDialog.childrenCount; i++) {
                let child = imageDialog.children[i] as cc.Node;
                if (child.name.endsWith('Tab')) {
                    child.active = child.name === 'tableSettingTab';
                }
            }
        }
    }

    onTabClick(clicked: cc.Node, tabTitle: cc.Node) {
        if (this._selectedTab === clicked) return;
        let prevSelect = this._selectedTab.getChildByName('select');
        if (prevSelect) prevSelect.active = false;
        let curSelect = clicked.getChildByName('select');
        if (curSelect) curSelect.active = true;
        this._selectedTab = clicked;
        // 切换 Tab 内容页
        let imageDialog = this.getChildNodeOrComponent('Image_Dialog') as cc.Node;
        if (!imageDialog) return;
        let tabName = clicked.name + 'Tab';
        for (let i = 0; i < imageDialog.childrenCount; i++) {
            let child = imageDialog.children[i] as cc.Node;
            if (child.name.endsWith('Tab')) {
                child.active = child.name === tabName;
            }
        }
    }

    /**
     * @method  自定义 Slider 滑块（progressNode）
     */
    initSlider() {
        let progressNode = this.getChildNodeOrComponent('progressNode') as cc.Node;
        console.log('[Slider] progressNode found:', !!progressNode, 'size:', progressNode?.width, progressNode?.height);
        if (!progressNode) return;
        let slider = cc.find('base/slider', progressNode) as cc.Node;
        if (!slider) return;
        slider.x = Math.max(200, UITexasSettingComponent.SLIDER_MIN_X);
        this._updateProgress(slider);
        // 事件注册在 progressNode 上，避免 slider 尺寸过小导致触摸不响应
        progressNode.on(cc.Node.EventType.TOUCH_START, this._onSliderTouchStart, this);
        progressNode.on(cc.Node.EventType.TOUCH_MOVE, this._onSliderTouchMove, this);
        progressNode.on(cc.Node.EventType.TOUCH_END, this._onSliderTouchEnd, this);
        progressNode.on(cc.Node.EventType.TOUCH_CANCEL, this._onSliderTouchEnd, this);
    }

    _onSliderTouchStart(event: cc.Event.EventTouch) {
        console.log('[Slider] TOUCH_START');
        this._sliderDragging = true;
        event.stopPropagation();
    }

    _onSliderTouchMove(event: cc.Event.EventTouch) {
        if (!this._sliderDragging) return;
        let progressNode = this.getChildNodeOrComponent('progressNode') as cc.Node;
        let base = progressNode.getChildByName('base') as cc.Node;
        let slider = base.getChildByName('slider') as cc.Node;
        let delta = event.getDelta();
        let newX = slider.x + delta.x;
        newX = Math.max(UITexasSettingComponent.SLIDER_MIN_X, Math.min(UITexasSettingComponent.SLIDER_BASE_WIDTH, newX));
        let step = UITexasSettingComponent.SLIDER_STEP;
        newX = Math.round(newX / step) * step;
        slider.x = newX;
        this._updateProgress(slider);
    }

    _onSliderTouchEnd(event: cc.Event.EventTouch) {
        console.log('[Slider] TOUCH_END');
        this._sliderDragging = false;
        event.stopPropagation();
    }

    _updateProgress(slider: cc.Node) {
        let base = slider.parent;
        let progress = base.getChildByName('progress') as cc.Node;
        if (!progress) return;
        // base 的 anchorX=0，slider.x 范围 [0, 800]
        let percent = slider.x / UITexasSettingComponent.SLIDER_BASE_WIDTH;
        progress.width = percent * UITexasSettingComponent.SLIDER_BASE_WIDTH;
        // 更新 slider 上的 label 显示百分比
        let label = slider.getComponentInChildren(cc.Label);
        if (label) {
            label.string = Math.round(percent * 100) + '%';
        }
    }

    /**
     * @method  设置 自定义快捷加注
     */
    initQuickActionListen() {
        this._selectQuickAction = this.QuickActionGroup.children[this.curQuickActionIndex];
        let Checkmark = cc.find('Background/Checkmark', this._selectQuickAction);
        Checkmark.active = true;
        for (let index = 0; index < this.QuickActionGroup.childrenCount; index++) {
            const element = this.QuickActionGroup.children[index];
            element.on('click', this.setQuickActionState, this);
            element['index'] = index;
            let textCallPot = element.getChildByName('Text_CallPot').getComponent(cc.Label);
            let numStr = UITexasSettingComponent.GetCurQuickActionNum(index);
            if (numStr == '0') {
                numStr = '+';
                textCallPot.fontSize = 70;
            } else {
                textCallPot.fontSize = 40;
            }
            textCallPot.string = numStr;
        }
    }

    /**
     * @method  设置 自定义快捷加注按钮选中状态
     */
    setQuickActionState(event) {
        if (this._selectQuickAction) {
            let checkmark = cc.find('Background/Checkmark', this._selectQuickAction);
            checkmark.active = false;
        }
        this._selectQuickAction = event.node;
        let checkmark = cc.find('Background/Checkmark', this._selectQuickAction);
        checkmark.active = true;
        this.curQuickActionIndex = this._selectQuickAction['index'];
        this.setUpQuickActionNum();
    }

    /**
     * 设置加注
     */
    setUpQuickActionNum() {
        let selectTextCallPot = this._selectQuickAction.getChildByName('Text_CallPot').getComponent(cc.Label);
        for (let index = 0; index < this.QuickActionNumGroup.childrenCount; index++) {
            const element = this.QuickActionNumGroup.children[index];
            let checkmark = cc.find('Background/Checkmark', element);
            checkmark.active = false;
            let textCallPot = cc.find('Text_CallPot', element).getComponent(cc.Label);
            let numStr = this.getNumToggleString(index);
            if (numStr == selectTextCallPot.string) {
                // if (numStr == this.GetCurQuickActionNum(this.curQuickActionIndex)) {
                checkmark.active = true;
                // SelectNumToggle(numToggle.gameObject, i);
            }
            if (numStr == '0') {
                numStr = i18nMgr.Get(`adaptation${10077}`);
            }
            textCallPot.string = numStr;
            element['index'] = index;
            element.on('click', this.setUpQuickActionNumState, this);
        }
    }

    /**
     *
     * @param index
     * @returns
     */
    public static GetCurQuickActionNum(index) {
        let defaultActionNums = ['0', '1/2', '2/3', '1x', '0'];
        let numStr = GC.localStore.getItem(StorageKey.kQuickActionIndexKEY + index) || defaultActionNums[index];
        return numStr;
    }

    setUpQuickActionNumState(event) {
        for (let index = 0; index < this.QuickActionNumGroup.childrenCount; index++) {
            const element = this.QuickActionNumGroup.children[index];
            let checkmark = cc.find('Background/Checkmark', element);
            checkmark.active = false;
        }
        let checkmark = cc.find('Background/Checkmark', event.node);
        checkmark.active = true;
        let textCallPot = this._selectQuickAction.getChildByName('Text_CallPot').getComponent(cc.Label);
        let numStr = this.getNumToggleString(event.node['index']);
        if (numStr == '0') {
            numStr = '+';
            textCallPot.fontSize = 70;
        } else {
            textCallPot.fontSize = 40;
        }
        textCallPot.string = numStr;
        GC.localStore.setItem(StorageKey.kQuickActionIndexKEY + this._selectQuickAction['index'], numStr);
        GC.localStore.setItem(StorageKey.kQuickActionIndexValueKEY + this._selectQuickAction['index'], numStr);
    }

    /**
     * 获取加注的显示内容
     * @param index
     * @returns
     */
    getNumToggleString(index) {
        let num = [];
        if (this.curQuickActionIndex > 0 && this.curQuickActionIndex < 4) {
            num = ['1/2', '1/3', '1/4', '2/3', '3/4', '3/5', '1x', '1.5x', 'Allin'];
        } else {
            num = ['0', '1/2', '1/3', '1/4', '2/3', '3/4', '1x', '1.5x', 'Allin'];
        }
        return num[index];
    }

    onValueChangedVoice() {
        let closeVoice = cc.find('Background/closeVoice', this.Toggle_Voice);
        let openVoice = cc.find('Background/openVoice', this.Toggle_Voice);
        let newOn = !SoundComponent.Instance.soundOn;
        SoundComponent.Instance.setSoundOn(newOn);
        openVoice.active = newOn;
        closeVoice.active = !newOn;
        GC.localStore.setItem(StorageKey.soundIsOpen, newOn ? 1 + '' : 0 + '');
    }

    public static GetCurQuickActionNumValue(index) {
        let defaultActionNums = [0, 1.0 / 2, 2.0 / 3, 1.0, 0];
        let numStr = GC.localStore.getItem(StorageKey.kQuickActionIndexValueKEY + index) || defaultActionNums[index];
        return +numStr;
    }
}
