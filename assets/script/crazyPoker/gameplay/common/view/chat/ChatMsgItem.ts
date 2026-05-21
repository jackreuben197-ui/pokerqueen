import ListItem from '../../../../../common/ListItem';
const { ccclass } = cc._decorator;

@ccclass
export default class ChatMsgItem extends ListItem {
    private _userNameLabel: cc.Label = null;
    private _chatContentLabel: cc.Label = null;

    /** 刷新单条聊天消息 */
    initData(data: { name: string; content: string }): void {
        // ListItem 继承链不经过 UIBasePlus，不支持 cc_Label$ 自动绑定，需手动获取
        if (!this._userNameLabel) {
            const node = this.node.getChildByName('userName');
            if (node) this._userNameLabel = node.getComponent(cc.Label);
        }
        if (!this._chatContentLabel) {
            const node = this.node.getChildByName('chatContent');
            if (node) this._chatContentLabel = node.getComponent(cc.Label);
        }
        if (this._userNameLabel) {
            this._userNameLabel.string = data.name;
        }
        if (this._chatContentLabel) {
            this._chatContentLabel.string = data.content;
        }
    }
}
