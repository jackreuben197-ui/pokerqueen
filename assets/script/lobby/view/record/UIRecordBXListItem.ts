import ListItem from "../../../common/ListItem";
import GC from "../../../frame/GameControl";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/lobby/view/record/UIRecordBXListItem')
export default class UIRecordBXListItem extends ListItem {
    private icon: cc.Sprite = null;
    private rank: cc.Label = null;
    private userName: cc.Label = null;
    private gold: cc.Label = null;
    private line: cc.Node = null;
    lateLoad() {
        super.lateLoad();
        this.icon = this.getChildNodeOrComponent("icon", cc.Sprite)
        this.rank = this.getChildNodeOrComponent("rank", cc.Label)
        this.userName = this.getChildNodeOrComponent("userName", cc.Label)
        this.gold = this.getChildNodeOrComponent("gold", cc.Label)
        this.line = this.getChildNodeOrComponent("line");
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }

    initData(data, index, isLast) {
        // "user_id": 1,
        // "src_type": 1,
        // "src_room_id": 91129802,
        // "src_match_id": 0,
        // "hand": 0,
        // "name": "test00-1",
        // "src_order_no": "",
        // "op_id": 1,
        // "gold_before": 0,
        // "gold_change": 0,
        // "gold_after": 0,
        // "gold_lock_before": 0,
        // "gold_lock_change": 0,
        // "gold_lock_after": 0,
        // "insurance": 0,
        // "hand_win": 0,
        // "hand_bet": 0,
        // "op_code": "INSUR",
        // "prop_use_count": 0,
        // "create_time": "2022-04-21T14:02:58Z"
        // "avatar": "http://static.awanptesting.com/image-avatar/99777674-ZwWEI.png",
        // "user_name": "weilai00"

        // 暂时没有头像字段，等待后端添加
        this.setTexture(this.icon, data.avatar)
        this.setText(this.rank, index + 1);
        this.setText(this.userName, GC.data.languageTemp.temp.getName(data.user_name));
        this.setText(this.gold, data.insurance);
        this.setInsuranceColor(data.insurance);
        this.setActive(this.line, !isLast);
    }

    setInsuranceColor(insurance) {
        if (insurance < 0) {
            this.setTextColor(this.gold, "#FFCC00");
            this.gold.node.opacity = 255;
        } else if (insurance > 0) {
            this.setTextColor(this.gold, "#35A3B3");
            this.gold.node.opacity = 255;
        } else {
            this.setTextColor(this.gold, "#FFFFFF");
            this.gold.node.opacity = 255 * 0.5;
        }
    }
}