/**
 * 横屏时候的提示
 */
import Main from "../Main";
import { IUpComponent } from "./UpdateComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class OrientationComponent implements IUpComponent {

    active: boolean = true;

    Update(dt: number) {

        if (Main.Orientation == null) {
            return;
        }

        if (Main.Orientation.active) {
            if (window.orientation == 0) Main.Orientation.active = false;
        } else {
            if (window.orientation == 90 || window.orientation == -90) {
                Main.Orientation.active = true;
            }
        }
    }
}
