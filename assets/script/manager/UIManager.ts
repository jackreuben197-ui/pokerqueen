
import Singleton from "../common/Singleton";
import { IUIDefine, UIType } from "../define/EIDefine";
import UIBase from "../ui/UIBase";
import AlertManager from "./AlertManager";
import BoardManager from "./BoardManager";
import DialogManager from "./DialogManager";
import FormManager from "./FormManager";
import PromptManager from "./PromptManager";

const { ccclass } = cc._decorator;

@ccclass
export default class UIManager extends Singleton {

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
            case UIType.TexasPreLoad:
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
            case UIType.Alert:
                AlertManager.ins.close(UIDefine, param);
                break;
            case UIType.Prompt:
            case UIType.TexasPreLoad:
                PromptManager.ins.close(UIDefine, param);
                break;
        }
    }

    static find(UIDefine: IUIDefine): UIBase {

        let ui: UIBase = null;

        switch (UIDefine.UIType) {
            case UIType.Form:
                ui = FormManager.ins.find(UIDefine);
                break;
            case UIType.Dialog:
                ui = DialogManager.ins.find(UIDefine);
                break;
            case UIType.Board:
                ui = BoardManager.ins.find(UIDefine);
                break;
            case UIType.Alert:
                ui = AlertManager.ins.find(UIDefine);
                break;
            case UIType.Prompt:
            case UIType.TexasPreLoad:
                ui = PromptManager.ins.find(UIDefine);
                break;
            default:
                break;
        }
        return ui;
    }
}
