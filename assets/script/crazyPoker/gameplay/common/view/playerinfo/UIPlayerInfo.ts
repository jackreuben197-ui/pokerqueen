import UIBasePlus from '../../../../../ui/UIBasePlus';
import UIComponent from '../../../../../ui/UIComponent';
import { UIDefine } from '../../../../../define/UIDefine';
import { CPlayer } from '../../../../../game/CPlayer';
import { WebOtherUserInfo, WWW } from '../../../../../net/https/WebRequest';
import WebImageHelper from '../../../../../helper/WebImageHelper';
const { ccclass } = cc._decorator;

@ccclass
export default class UIPlayerInfo extends UIBasePlus {
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

    // Tab 相关
    private _tabNodes: cc.Node[] = [];
    private _tabLabels: cc.Label[] = [];
    private _underlineNodes: cc.Node[] = [];
    private _contentNodes: cc.Node[] = [];
    private _tabIndex: number = 0;

    protected lateLoad(): void {
        super.lateLoad();
        this._headSprite = this.$HeadImgIcon.getComponent(cc.Sprite);
        this.setButtonClick(this.$panel_click, this.click_panel);
        // 手动查找无 $ 前缀的节点
        let dlg = this.node.getChildByName('PlayerInfoDlg');
        if (dlg) {
            this._male = dlg.getChildByName('male');
            this._female = dlg.getChildByName('female');
            let playeridNode = dlg.getChildByName('playerid');
            this._playerid = playeridNode ? playeridNode.getComponent(cc.Label) : null;
        }
        this.initTabs();
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
        if (!param) return;
        this._player = param as CPlayer;

        // 先用桌位数据即时显示
        this.refreshBasicInfo({
            nick_name: this._player.nick,
            avatar: this._player.headPic,
            sex: this._player.sex,
            random_num: this._player.userID
        });

        // 默认选中 Data tab
        this.switchTab(0);

        // 再请求服务端完整数据
        this.reqUserInfo(this._player.userID);
    }

    private click_tab(index: number): void {
        this.switchTab(index);
    }

    private switchTab(index: number): void {
        this._tabIndex = index;
        // 更新 tab 选中状态：下划线 + 颜色
        for (let i = 0; i < this._tabLabels.length; i++) {
            let label = this._tabLabels[i];
            if (label) {
                label.node.color = (i === index)
                    ? new cc.Color(255, 255, 255, 255)
                    : new cc.Color(150, 150, 150, 255);
            }
            if (this._underlineNodes[i]) {
                this._underlineNodes[i].active = (i === index);
            }
        }
        // 切换内容节点显示
        for (let i = 0; i < this._contentNodes.length; i++) {
            if (this._contentNodes[i]) {
                this._contentNodes[i].active = (i === index);
            }
        }
    }

    /** 请求用户详细信息 */
    private reqUserInfo(userid: number) {
        WWW.Instance.CommonAPI({
            web_class: WebOtherUserInfo,
            api_id: userid
        }).then((res: any) => {
            if (!cc.isValid(this.node)) return;
            if (res?.data) {
                this.refreshBasicInfo(res.data);
            }
        });
    }

    /** 刷新基础信息：头像、昵称、性别、ID */
    private refreshBasicInfo(data: { nick_name: string; avatar: string; sex: number; random_num: number }) {
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
    }

    private click_panel() {
        UIComponent.close(UIDefine.UIPlayerInfo);
    }
}
