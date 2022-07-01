
import { IUIDefine, UIType } from "../define/EIDefine";
import AlertManager from "./AlertManager";
import BoardManager from "./BoardManager";
import DialogManager from "./DialogManager";
import FormManager from "./FormManager";
import PromptManager from "./PromptManager";
import SingleManager from "./SingleManager";

const { ccclass } = cc._decorator;

@ccclass
export default class UIManager extends SingleManager {

    static ins: UIManager;

    static open<TParam extends unknown>(UIDefine: IUIDefine, param: TParam = null) {

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
            case UIType.Alert:
                AlertManager.ins.open(UIDefine, param);
                break;
            case UIType.Prompt:
                PromptManager.ins.open(UIDefine, param);
                break;
        }
    }

    static close<TParam extends unknown>(UIDefine: IUIDefine = null, param: TParam = null) {

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
            case UIType.Prompt:
                PromptManager.ins.close(UIDefine, param);
                break;
        }
    }
}
