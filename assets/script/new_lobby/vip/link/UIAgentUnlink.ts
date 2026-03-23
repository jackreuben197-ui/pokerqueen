import { ClubCache } from "../../../frame/data/club/ClubCache";
import WebImageHelper from "../../../helper/WebImageHelper";
import { UIClubModel } from "../../../lobby/labor/UIClubModel";
import { WebClubAgentDel, WebWww } from "../../../net/https/WebRequest";
import UIBase from "../../../ui/UIBase";
import UIBasePlus from "../../../ui/UIBasePlus";
import UIComponent from "../../../ui/UIComponent";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIAgentUnlink extends UIBasePlus {


    $Back: cc.Node = null;

    $Content: cc.Node = null;

    $Close: cc.Node = null;
    $Unlink: cc.Node = null;

    protected declare_list: [string, any?][] = [
        ["Back"],
        ["Button_Cancel"],
        ["Button_Commit"]
    ]
    protected lateLoad() {
        super.lateLoad();
    }
    regiterTouchEvents() {
        super.regiterTouchEvents();
        this.setButtonClick(this.$Back, this.backClick);
        this.setButtonClick(this.$Close, this.closeClick);
        this.setButtonClick(this.$Unlink, this.unlinkClick);
    }
    onShow(param: any) {
        super.onShow(param);
        //测试 this._param.user
        this.refreshInfo(0, this._param.user);
        this.reqAgentInfo();
    }

    refreshInfo(index: number, data) {
        let item = this.$Content.children[index];
        this.setChildLabel(item, "Nick", data.nickname);
        this.setChildLabel(item, "ID", data.random_id);
        WebImageHelper.SetHeadImage(item.getChildByName("Head").getComponent(cc.Sprite), data.avatar);
    }

    ///////////////////点击
    //背景点击
    private backClick() {
        UIComponent.close(this.UIDefine);
    }
    //取消点击
    private closeClick() {
        UIComponent.close(this.UIDefine);
    }
    //提交点击
    private unlinkClick() {
        UIComponent.close(this.UIDefine);
        //发送请求
        this.reqUnlink();
    }

    //////////////////////////////////////////////请求
    // -> 请求绑定对象信息
    reqAgentInfo() {
        UIClubModel.mInstance.WebOrgClubUserInfo({
            "user_id": this._param.agent_id,
            "club_id": ClubCache.club_id
        }).then(
            (res: any) => {
                this.refreshInfo(1, res.data.user_info);
            },
            (res) => {

            }
        )
    }
    // -> 请求解绑
    reqUnlink() {
        WebWww.Instance.CommonAPI(
            {
                web_class: WebClubAgentDel,
                body: {
                    "user_id": this._param.user.user_id,
                    "club_id": ClubCache.club_id,
                    "agent_id": this._param.agent_id
                },
                club_id: ClubCache.club_id
            }
        ).then(
            (res: any) => {
                this.post('refresh_vip_ui')
                UIComponent.Instance.Toast("成功解除绑定");
            },
            (res: any) => {

            }
        )
    }


}
