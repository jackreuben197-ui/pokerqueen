import { i18nMgr } from "../i18n/i18nMgr";
import ToastManager from "../manager/ToastManager";

export default class PublicHelper {

    static InitSprite(sprite: cc.Sprite, spriteFrame?: cc.SpriteFrame) {
        sprite.node.color = cc.Color.WHITE;
        sprite.spriteFrame = spriteFrame;
    }
    static InitNode(node: cc.Node, position?: cc.Vec3, active: boolean = true) {
        node.setPosition(position);
        node.setScale(1, 1);
        node.active = active;
    }

    static copyToClipBoard(str) :boolean {
        if (cc.sys.isNative) {
        //原生自己实现 手机浏览器打开走下面的 可以复制
        } else if (cc.sys.isBrowser) {
            var textarea = document.createElement("textarea");
            textarea.textContent = str;
            document.body.appendChild(textarea);
            textarea.readOnly = true;
            textarea.select();
            textarea.setSelectionRange(0, textarea.textContent.length);
            try {
                const flag = document.execCommand('copy');
                document.body.removeChild(textarea);
                if(flag){
                    ToastManager.Instance.createToast("已经复制到剪贴板");
                    return true;
                }else{
                    ToastManager.Instance.createToast("复制到剪贴板失败");
                    return false;
                }
            } catch (err) {
                ToastManager.Instance.createToast("复制到剪贴板失败");
                return false;
            }
        }
    }
}
