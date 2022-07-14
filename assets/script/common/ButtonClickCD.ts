/**
 * 按钮点击冷却判断
 */
import ToastManager from "../manager/ToastManager";
import GlobalSession from "../session/GlobalSession";

export default class ButtonClickCD {

    private static clickMap: any = {};

    //默认冷却 2000 毫秒
    static canClick(button: cc.Node, duration: number = 2, showToast: boolean = true) {
        let lastTime: number = ButtonClickCD.clickMap[button.uuid];
        let now = GlobalSession.NowTime();
        ButtonClickCD.clickMap[button.uuid] = now;
        if (!lastTime || now - lastTime > duration) {
            return true;
        }
        showToast && ToastManager.ins.craeteToast("clickNum");
        return false;
    }
    // update (dt) {}
}
