
import OmahaGame4 from "./OmahaGame6";

/**
 * 奥马哈 +5 玩法
 */
export default class OmahaGame5 extends OmahaGame4 {

    public override get HandCards(): number {
        return 5;
    }

}
