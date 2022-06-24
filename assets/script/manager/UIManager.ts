
import { DialogParam } from "../define/EIDefine";
import { UIType } from "../define/UIDefine";
import BoardManager from "./BoardManager";
import DialogManager from "./DialogManager";
import FormManager from "./FormManager";
import SingleManager from "./SingleManager";

const { ccclass } = cc._decorator;

@ccclass
export default class UIManager extends SingleManager {

    static ins: UIManager;

    static open<TParam extends unknown>(UIDefine: { UIType: UIType, Name: string, Bundle: string, Path: string }, param: TParam = null) {

        switch (UIDefine.UIType) {
            case UIType.Form:
                FormManager.ins.open(UIDefine, param);
                break;
            case UIType.Dialog:
                DialogManager.ins.open(UIDefine, param);
                break;
            case UIType.Board:
                BoardManager.ins.open(UIDefine, param);
                break;
        }
    }

    static close(UIDefine: { UIType: UIType, Name: string, Bundle: string, Path: string } = null, param: any = null) {

        switch (UIDefine.UIType) {
            case UIType.Form:
                FormManager.ins.close(UIDefine, param);
                break;
            case UIType.Dialog:
                DialogManager.ins.close(UIDefine, param);
                break;
            case UIType.Board:
                BoardManager.ins.close(UIDefine, param);
                break;
        }
    }

}
