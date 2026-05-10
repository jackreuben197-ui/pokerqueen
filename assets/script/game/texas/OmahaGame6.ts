import OmahaGame4 from './OmahaGame4';

/**
 * 奥马哈 +6 玩法
 */
export default class OmahaGame6 extends OmahaGame4 {

    public override get HandCards(): number {
        return 6;
    }
}
