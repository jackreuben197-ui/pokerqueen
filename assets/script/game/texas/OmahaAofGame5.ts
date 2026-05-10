import { GameCache } from '../GameCache';
import OmahaGame5 from './OmahaGame5';

export default class OmahaAofGame5 extends OmahaGame5 {

    /// <summary>
    /// 最小可玩的筹码，少于等于此数需要带入才能玩
    /// </summary>
    public GetMinPlayChips(): number {
        return this.currentMinRate * GameCache.Instance.carry_small - 1;
    }
}
