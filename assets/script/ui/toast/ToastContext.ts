
const { ccclass, property } = cc._decorator;

@ccclass
export default class ToastContext extends cc.Component {
    @property(cc.Prefab)
    toast_prefab: cc.Prefab = null;
}
