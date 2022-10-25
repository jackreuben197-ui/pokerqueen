import GC from "../../../GameControl";
import MTTGameUtil from "../MttGameUtils"

export default class MttRealTimeBlindsModel {
    get list() {
        let list = []
        let gameType = GC.data.mtt.list.select.blindtable_type
        let levelCount = MTTGameUtil.numOfLevel(gameType);
        for (let index = 0; index < levelCount; index++) {
            let sb = MTTGameUtil.BlindAtLevel(index, gameType, 1);
            let ante = MTTGameUtil.AnteAtLevel(index, gameType, 1);


            let item = {
                ante: Math.floor(ante) / 100,
                blind: Math.floor(sb) / 100,
                level: index + 1,
                updateTime: GC.data.mtt.detail.upblind_interval
            }
            list.push(item)
        }
        return list;
    }
}