import { UIDefine } from "../define/UIDefine";
import ToastManager from "../manager/ToastManager";
import UIManager from "../manager/UIManager";
import UIBase from "./UIBase";


const { ccclass, property } = cc._decorator;

@ccclass
export default class MainTest extends UIBase {

    testLayout: cc.Node;

    async lateLoad() {
        super.lateLoad();
        //调试节点
        this.testLayout = this.getChildNodeOrComponent("测试 - layout");
        if (this.testLayout) {
            for (let i = 0; i < this.testLayout.childrenCount; i++) {
                let button = this.testLayout.children[i];
                button.getComponent(cc.Button).name = button.getComponent(cc.Label).string;
                button.on("click", this.testClick, this);
            }
        }


    }

    //////////////////////////////////测试///////////////////////////////////

    //测试按钮触发
    private testClick(e) {
        switch (e.name) {
            case "右入面板":
                UIManager.open(UIDefine.RightTouchBoard);
                break;
            case "多层标题面板":
                UIManager.open(UIDefine.LanguageForm);
                UIManager.open(UIDefine.RegisterForm);
                break;
            case "提示弹板":
                UIManager.open(UIDefine.BaseAlert, {
                    data: {
                        title: "大大的标题", content: "无限的能量", confirm: "Sure", cancel: "Cancel", confirmCallback: () => {
                            ToastManager.ins.craeteToast("面板 确认 回调");
                        },
                        cancelCallback: () => {
                            ToastManager.ins.craeteToast("面板 取消 回调");
                        }
                    }
                });
                break;
            case "Toast":
                let dic = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789阿克苏据了解阿卡链接发圣诞节快乐收到简历咖决胜巅峰";
                let len = 5 + Math.random() * 50 ^ 0;
                let str = "";
                for (let i = 0; i < len; i++) {
                    str += dic[Math.random() * dic.length ^ 0];
                }
                if (str.length > 30) {
                    let a = str.substring(0, str.length / 3 ^ 0);
                    let b = str.substring(str.length / 3 ^ 0, str.length * (2 / 3) ^ 0);
                    let c = str.substring(str.length * (2 / 3) ^ 0, str.length);

                    str = a + "\n" + b + "\n" + c;
                } else if (str.length > 20) {
                    let a = str.substring(0, str.length / 2 ^ 0);
                    let b = str.substring((str.length / 2 ^ 0), str.length - 1);
                    str = a + "\n" + b;
                }

                ToastManager.ins.craeteToast(str);
                break;
            case "下入面板":
                UIManager.open(UIDefine.BottomTouchBoard);
                break;
            case "loading":
                UIManager.open(UIDefine.UIPromptComponent);
                break;

        }
    }
}
