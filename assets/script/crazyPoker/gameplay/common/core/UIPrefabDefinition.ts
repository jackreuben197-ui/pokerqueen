import UIBringIn from "../view/chips/UIBringIn"
import UIComponentBase from "./UIComponentBase";

export interface IUIConfigItem {
    UIType: { new (): UIComponentBase<any> }; // 或者是你的基类：typeof UIComponentBase
    Name: string;
    Bundle: string;
    Path: string;
}

export type UIPrefabType = 'BringInDialog';

export const UIPrefabDefinition: Record<UIPrefabType,IUIConfigItem> = {
    BringInDialog: {
        UIType: UIBringIn,
        Name: '带入弹框',
        Bundle: '',
        Path: 'xxxxxx',
    }
}