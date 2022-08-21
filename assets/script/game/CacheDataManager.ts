//const DtoSNS = WEB2_sns_batch_relations.DataElement;
export class CacheDataManager extends cc.Component {

    private static instance: CacheDataManager;
    public static get mInstance(): CacheDataManager {
        return this.instance ??= new CacheDataManager();
    }

    //Dictionary<string, DtoSNS> mDicRandomIdSNS:Map<string>;
    //Dictionary<int, DtoSNS> mDicIdSNS;

    CacheDataManager() {
        //mDicRandomIdSNS = new Dictionary<string, DtoSNS>();
        //mDicIdSNS = new Dictionary<int, DtoSNS>();
    }
    public GetRemarkName(userId: number, nick: string): string {
        // DtoSNS tDto = null;
        // if (mDicIdSNS.TryGetValue(userId, out tDto)) {
        //     return string.IsNullOrEmpty(tDto.remarkName) ? nick : tDto.remarkName;;
        // }
        return nick;
    }
}
