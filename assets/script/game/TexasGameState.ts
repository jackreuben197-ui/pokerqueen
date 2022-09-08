export enum TexasGameState {
        /// <summary>
        /// 无状态
        /// </summary>
        None = 0,
        /// <summary>
        /// 网络异常状态(可在此状态下处理重连逻辑)
        /// </summary>
        NetworkException = 1,
        /// <summary>
        /// 玩法状态机启动状态(可在此状态下处理进入房间的逻辑)
        /// </summary>
        Launch = 2,
        /// <summary>
        /// 初始化状态(Launch的次状态，可在此状态下处理进入房间后相关初始化逻辑）
        /// </summary>
        Init = 3,
        /// <summary>
        /// 退出玩法
        /// </summary>
        Exit = 4,
        /// <summary>
        /// MTT拆并桌换房间
        /// </summary>
        ExchangeRoom = 5,
        /// <summary>
        /// 游戏还未开局
        /// </summary>
        NotStart = 6,
        /// <summary>
        /// 游戏已开局，但一手还没开始(比如上座人数不够)
        /// </summary>
        WaitHandStart = 7,
        /// <summary>
        /// 一手开始，还未发底牌
        /// </summary>
        HandStarted = 8,
        /// <summary>
        /// 翻牌前下注(已发手牌)
        /// </summary>
        HandPreflop = 9,
        /// <summary>
        /// 翻牌轮下注(已发三张公牌)
        /// </summary>
        HandFlop = 10,
        /// <summary>
        /// 转牌轮下注(已发四张公牌)
        /// </summary>
        HandTurn = 11,
        /// <summary>
        /// 河牌轮下注(已发五张公牌)
        /// </summary>
        HandRiver = 12,
        /// <summary>
        /// 结算状态
        /// </summary>
        HandShowdown = 13,
        /// <summary>
        /// 一手结束,如果继续,转HandStart; 不继续, 转Complete
        /// </summary>
        HandEnd = 14,
        /// <summary>
        /// 牌局被取消(还未开始就结束了)
        /// </summary>
        Cancel = 15,
        /// <summary>
        /// 牌局正常结束
        /// </summary>
        Complete = 16,
        /// <summary>
        /// 游戏状态未知(后端异常情况)
        /// </summary>
        Unknown = 17,
}