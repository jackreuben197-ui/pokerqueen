
import { IUIDefine, UIType } from "../define/EIDefine";
import UIBase from "../ui/UIBase";
import { UIBoardMgr, UIDialogMgr, UIFormMgr, UIPromptMgr } from "./UIMgr";

const { ccclass } = cc._decorator;

@ccclass
export default class UIComponent {

    static open<TParam extends unknown>(UIDefine: IUIDefine, param: TParam = null) {
        if (!UIDefine) return;
        switch (UIDefine.UIType) {
            case UIType.Form:
                UIFormMgr.Instance.open(UIDefine, param);
                break;
            case UIType.Dialog:
                UIDialogMgr.Instance.open(UIDefine, param);
                break;
            case UIType.Board:
                UIBoardMgr.Instance.open(UIDefine, param);
                break;
            case UIType.Prompt:
            case UIType.TexasPreLoad:
                UIPromptMgr.Instance.open(UIDefine, param);
                break;
        }
    }

    static close<TParam extends unknown>(UIDefine: IUIDefine = null, param: TParam = null) {
        if (!UIDefine) return;
        switch (UIDefine.UIType) {
            case UIType.Form:
                UIFormMgr.Instance.close(UIDefine, param);
                break;
            case UIType.Dialog:
                UIDialogMgr.Instance.close(UIDefine, param);
                break;
            case UIType.Board:
                UIBoardMgr.Instance.close(UIDefine, param);
                break;
            case UIType.Prompt:
            case UIType.TexasPreLoad:
                UIPromptMgr.Instance.close(UIDefine, param);
                break;
        }
    }

    static find(UIDefine: IUIDefine): UIBase {

        let ui: UIBase = null;

        switch (UIDefine.UIType) {
            case UIType.Form:
                ui = UIFormMgr.Instance.find(UIDefine);
                break;
            case UIType.Dialog:
                ui = UIDialogMgr.Instance.find(UIDefine);
                break;
            case UIType.Board:
                ui = UIBoardMgr.Instance.find(UIDefine);
                break;
            case UIType.Prompt:
            case UIType.TexasPreLoad:
                ui = UIPromptMgr.Instance.find(UIDefine);
                break;
            default:
                break;
        }
        return ui;
    }

    static closeAll() {
        UIFormMgr.Instance.closeAll();
        UIDialogMgr.Instance.closeAll();
        UIBoardMgr.Instance.closeAll();
        UIPromptMgr.Instance.closeAll();
    }
}
