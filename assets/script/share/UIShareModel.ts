import { WebWww, WebShareUsable } from "../net/https/WebRequest";

export default class UIShareModel {
    public static get Instance(): UIShareModel {
        return (this as any).instance ??= new UIShareModel;
    }

    public SHARE_TYPE_MTT = 1;//1 mtt赛事结果      
    public SHARE_TYPE_PLAY_CARDS = 2;//2牌桌界面牌普
    public SHARE_TYPE_CARDS_DETAIL = 3;//3牌普详情界面
    public SHARE_TYPE_PLAY_INVITE = 4;//4牌桌界面邀请
    public SHARE_TYPE_MISSION = 5;//5任务列表
    public SHARE_TYPE_HAPPYSHOP_MISSION = 6;//6一元购任务列表
    public SHARE_TYPE_HAPPYSHOP_MYAWARD = 7;//7一元购我的奖品


    public APIShareUsable(entry_type: number, callback: Function) {

        WebWww.Instance.CommonAPI(
            {
                web_class: WebShareUsable,
                body: { entry_type: entry_type }
            }
        ).then(
            (res: any) => {
                callback(res);
            },
            () => {

            }
        );

    }

}
