
export default class MTTModel {


}

// MTT比赛列表排序类型
export enum MTTListOrderTypeString {
    id_asc,//比赛id正序
    id_desc,//比赛id倒序
    start_asc,//开始时间正序
    start_desc,//开始时间倒序
    enter_asc,//结束时间正序
    enter_desc,//结束时间倒序
}

// mtt比赛状态
export enum MTTMatchStatus {
    /// <summary>
    /// 未开赛
    /// </summary>
    Created,
    /// <summary>
    /// 比赛中
    /// </summary>
    Running,
    /// <summary>
    /// 已关闭
    /// </summary>
    Closed,
    /// <summary>
    /// 已取消
    /// </summary>
    Cancel,
}