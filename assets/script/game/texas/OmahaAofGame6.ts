import { GameCache } from '../GameCache';
import OmahaGame6 from './OmahaGame6';

export default class OmahaAofGame6 extends OmahaGame6 {

    /// <summary>
    /// 最小可玩的筹码，少于等于此数需要带入才能玩
    /// </summary>
    public GetMinPlayChips(): number {
        return this.currentMinRate * GameCache.Instance.carry_small - 1;
    }
}
