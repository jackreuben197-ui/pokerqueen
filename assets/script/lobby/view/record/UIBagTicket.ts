import GC from "../../../frame/GameControl";
import UIMatchModel from "../../../game/MTT/UIMatchModel";
import TimeHelper from "../../../helper/TimeHelper";
import WebImageHelper from "../../../helper/WebImageHelper";
import BaseForm from "../../../ui/form/BaseForm";
import { LobbyControl } from "../../control/LobbyControl";



const { ccclass, property } = cc._decorator;

@ccclass
export default class UIBagTicket extends BaseForm {

    _allInfo = [];
    _useInfo = [];

    protected lateLoad() {
        super.lateLoad();
    }


    lateClose(param: any = null) {
        super.lateClose(param);
    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: cc.Node): void {
        super.onShow(param, fromUI);

        let Text_title = this.getChildNodeOrComponent("Text_title", cc.Label);
        Text_title.string = "门票";
      
        this.resetUI();

        if (param.info) {
            let data = param.info;
            let img_main = this.getChildNodeOrComponent("img_main", cc.Sprite);
            WebImageHelper.SetUrlImage(img_main, data.game_prop.prop_icon).then(()=>{
            });

            let nameStr = GC.data.languageTemp.temp.getName(data.game_prop.prop_name);
            let lbl_name = this.getChildNodeOrComponent("lbl_name", cc.Label);
            lbl_name.string = nameStr + "  x"

            let lbl_num = this.getChildNodeOrComponent("lbl_num", cc.Label);
            lbl_num.string = data.prop_amount;

            let lbl_start = this.getChildNodeOrComponent("lbl_start", cc.Label);
            lbl_start.string = TimeHelper.convertUTCTimeToLocalTime(data.create_time);

            let lbl_end = this.getChildNodeOrComponent("lbl_end", cc.Label);
            lbl_end.string = TimeHelper.convertUTCTimeToLocalTime(data.expired_time);

            let lbl_ticket = this.getChildNodeOrComponent("lbl_ticket", cc.Label);
            lbl_ticket.string = nameStr + "x1";



            for (let i=1; i<4; i++) {
                let btn_c1: cc.Node = this.getChildNodeOrComponent("btn_c" + i);
                btn_c1["index"] = i;
                btn_c1.on(cc.Node.EventType.TOUCH_END, this.onClickItem, this)
            }

            let btn_add: cc.Node = this.getChildNodeOrComponent("btn_add");
            btn_add.on(cc.Node.EventType.TOUCH_END, this.onClickAdd, this)

            this.reqInfo(param.info);
        }

    }

    reqInfo(data) {
        // let info = {
        //     limit: 100,  // 页码
        //     offset: 0,  // 页大小
        //     name: data.game_prop.prop_name,  //名字(name)
        //     mine: true,  //是否只有我报名(mine)
        //     types: number[], // 类型(types)
        //     hunter: boolean, //猎人模式(hunter)
        //     tribe_id: number, //联盟ID(tribe_id)
        //     start_time_s: number, // 开始时间开始(start_time_s)
        //     start_time_e: number, // 开始时间结束(start_time_e)
        //     enter_time_s: number,  //进入时间开始(enter_time_s)
        //     enter_time_e: number,  //进入时间开始(enter_time_e)
        //     game_type: number[], //游戏类型(game_type)
        //     poker_type: number[], // 牌类型(poker_type)
        //     limit_bet_type: number[],  //下注类型(limit_bet_type)
        //     order: string[], // 排序(order[id_asc,id_desc,start_xxx,enter_xxx])  //asc 正序   //desc 倒序
        //     buyin_min: number, // 最低买入价格(buyin_min),不包括服务费,人头费
        //     buyin_max: number, // 最高买入价格(buyin_max),不包括服务费,人头费
        //     status: data.status//0已创建 1正在进行 2已关闭
        // }
        // UIMatchModel.Instance.APIMTTRoomList(info).then(
        //     (res: any) => {
        //         this._allInfo = res.data;
        //         if (cb) {
        //             cb();
        //         }
        //     },
        //     (res) => {
        //     }
        // )
    }


    resetUI() {
       
        // let scrollView = this.getChildNodeOrComponent("sv_down", cc.ScrollView);
        // scrollView.content.removeAllChildren();
    }

    onClickItem() {
        let target = event.currentTarget;

    }

    onClickAdd() {

    }

}
