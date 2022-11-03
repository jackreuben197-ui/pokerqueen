

import UIBase from "../../ui/UIBase";
import { GameCache } from "../GameCache";
import Seat from "../seat/Seat";


class AgreeSecondData {
    title: string;// = LanguageManager.Get("UIAgreeSecondPcs_title"),
    content: string;// = LanguageManager.Get("UIAgreeSecondPcs_agree"),
    contentCommit: string;// = LanguageManager.Get("adaptation20085"),
    contentCancel: string;// = LanguageManager.Get("adaptation10334"),
    SecondPcsTime: number;// = (int)Operator.LeftOpTime,
    actionCommit: Function;
    actionCancel: Function;
}


const { ccclass } = cc._decorator;

@ccclass
export default class UIAgreeSecondPcsComponent extends UIBase {

    public static AgreeSecondData: typeof AgreeSecondData = AgreeSecondData;


    Text_Title: cc.Label = null;
    Text_CountDown: cc.Label = null;

    Text_Reject: cc.Label = null;
    Text_Agree: cc.Label = null;

    Button_Reject: cc.Node = null;
    Button_Agree: cc.Node = null;

    curAgreeSecondData: AgreeSecondData = null;

    time: number = 0;

    PlayerActionToggleList: cc.Node[] = null;

    Heads: cc.Node = null;

    protected lateLoad() {
        super.lateLoad();
        this.Text_Title = this.getChildNodeOrComponent("Text_Title", cc.Label);
        this.Text_CountDown = this.getChildNodeOrComponent("Text_CountDown", cc.Label);
        this.Text_Reject = this.getChildNodeOrComponent("Text_Reject", cc.Label);
        this.Text_Agree = this.getChildNodeOrComponent("Text_Agree", cc.Label);

        this.Button_Reject = this.getChildNodeOrComponent("Button_Reject");
        this.Button_Agree = this.getChildNodeOrComponent("Button_Agree");

        this.Heads = this.getChildNodeOrComponent("Heads");
    }

    onShow(param: AgreeSecondData): void {
        super.onShow(param);
        if (param != null) {
            this.curAgreeSecondData = param;
            //textCommit.text = string.IsNullOrEmpty(param.contentCommit) ? $"Commit" : param.contentCommit;
            //textCancel.text = string.IsNullOrEmpty(param.contentCancel) ? $"Cancel" : param.contentCancel;
            this.Text_Reject.string = param.contentCancel ?? "Cancel";
            this.Text_Agree.string = param.contentCommit ?? "Commit";

            this.Text_Title.string = param.title ?? "";

            this.time = param.SecondPcsTime;
            this.UpdateSecondPcsUI();
            //AgreeNumText.text = $"{0}/{PlayerActionToggleList.Count}\t" + LanguageManager.mInstance.GetLanguageForKey("UIAgreeSecondPcs_AgreeDtail");
        }
    }
    protected regiterTouchEvents() {
        this.setButtonClick(this.Button_Reject, this.onClickReject);
        this.setButtonClick(this.Button_Agree, this.onClickAgree);
    }
    //拒绝点击
    onClickReject() {
        this.setButtonInteractable(this.Button_Reject, false);
        this.setButtonInteractable(this.Button_Agree, false);
        this.curAgreeSecondData?.actionCancel?.();
    }
    //同意点击
    onClickAgree() {
        this.setButtonInteractable(this.Button_Reject, false);
        this.setButtonInteractable(this.Button_Agree, false);
        this.curAgreeSecondData?.actionCommit?.();
    }

    private UpdateSecondPcsUI(): void {

        if (GameCache.Instance.CurGame == null) return;


        this.PlayerActionToggleList = [];

        // if (PlayerActionToggleList == null) {
        //     PlayerActionToggleList = new List<GameObject>();
        // }
        // else {
        //     ClearGameObjList(PlayerActionToggleList);
        // }

        for (let i = 0; i < GameCache.Instance.CurGame.listSeat.length; i++) {
            let seat: Seat = GameCache.Instance.CurGame.listSeat[i];
            if (seat.Player == null || seat.seatID == -1 || !seat.Player.isPlaying) {
                continue;
            }
            //this.PlayerActionToggleList.push(this.CreatGameObj(item_head.gameObject, this.PlayerAgreeAndRefuse, seat.seatID, seat.Player.headPic));
        }
    }

    private CreatGameObj(gameObject: cc.Node, parent: cc.Node, seatID: number, headPic: string): cc.Node {
        let go = cc.instantiate(gameObject);
        go.parent = parent;
        //go = GameObject.Instantiate(gameObject, parent);
        go.name = seatID.toString();
        //WebImageHelper.SetUrlImage(go.transform.Find("Mask_head/img_head").GetComponent<RawImage>(), headPic);
        // go.transform.localPosition = Vector3.zero;
        // go.transform.localRotation = Quaternion.identity;
        // go.transform.localScale = Vector3.one;
        //go.gameObject.SetActive(true);
        go.active = true;
        return go;
    }


}
