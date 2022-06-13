import SingleManager from "./SingleManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class SceneManager extends SingleManager {

    static ins: SceneManager;
    
    /**
     * 场景切换
     */
    switchScene() {

    }
}
