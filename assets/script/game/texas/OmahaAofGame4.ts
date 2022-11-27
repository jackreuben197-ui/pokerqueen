import { GameCache } from "../GameCache";
import OmahaGame4 from "./OmahaGame4";

export default class OmahaAofGame4 extends OmahaGame4 {
    /// <summary>
    /// 最小可玩的筹码，少于等于此数需要带入才能玩
    /// </summary>
    public GetMinPlayChips(): number {
        return this.currentMinRate * GameCache.Instance.carry_small - 1;
    }
}
