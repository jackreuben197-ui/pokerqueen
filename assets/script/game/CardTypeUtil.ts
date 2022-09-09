
/// <summary>
/// 普通牌型
/// </summary>
export enum CardType {
    HighCard = 1,        // 高牌
    OnePair = 2,         // 一对
    TwoPair = 3,         // 两对
    ThreeOfAKind = 4,    // 三条
    Straight = 5,        // 顺子
    Flush = 6,           // 同花
    FullHouse = 7,       // 葫芦
    FourOfAKind = 8,     // 四条    
    StraightFlush = 9,   // 同花顺
    RoyalFlush = 10,     // 皇家同花顺
}

/// <summary>
///  2-14   对应    2,3,4,5,6,7,8,9,10,J,Q,K,A
/// </summary>
export enum CardNum {
    Two = 2,
    Three,
    Four,
    Five,
    Six,
    Seven,
    Eight,
    Nine,
    Ten,
    J,
    Q,
    K,
    A,

}

/// <summary>
/// 0-3        0(♠), 1(♥), 2(♣), 3(♦)
/// </summary>
export enum CardSuit {
    Spade = 0,
    Heart,
    Club,
    Diamond,
}

export class CardTypeUtil {

    //获取普通局牌型
    public static GetCardType(cards: number[], highlightCards: number[], isSixPlus: boolean = false): CardType {
        let mCards = cards;

        if (mCards.length < 7) {
            //不够7张牌，先补齐
            for (let i = mCards.length; i < 7; i++) {
                mCards.push(-1);
            }
        }
        highlightCards = [];
        let carTypeNum = 0;
        let lastMin = 100;
        //List < sbyte > card = new List<sbyte>(new sbyte[5]);
        let card = []
        //7选5
        for (let i = 0; i < 3; i++) {
            card[0] = mCards[i];
            for (let j = i + 1; j < 4; j++) {
                card[1] = mCards[j];
                for (let a = j + 1; a < 5; a++) {
                    card[2] = mCards[a];
                    for (let b = a + 1; b < 6; b++) {
                        card[3] = mCards[b];
                        for (let c = b + 1; c < 7; c++) {
                            card[4] = mCards[c];
                            //CardTypeUtil.CompareCardType(card, ref carTypeNum, ref lastMin, ref highlightCards, isSixPlus);
                        }
                    }
                }
            }
        }
        return carTypeNum;
    }

    /// <summary>
    /// 比较牌型大小
    /// </summary>
    /// <param name="card"></param>
    /// <param name="carTypeNum"></param>
    /// <param name="lastMin"></param>
    /// <param name="highlightCards"></param>
    /// <param name="isSixPlus"></param>
    public static CompareCardType(card: number[], carTypeNum: number, lastMin: number, highlightCards: number[], isSixPlus: boolean = false) {
        // let cardType: CardType = CardTypeUtil.GetExactCardType(card, isSixPlus);
        //     int num = (int)cardType;
        // if (CarTypeNumConversionToSixPlusCardType(isSixPlus, num) > CarTypeNumConversionToSixPlusCardType(isSixPlus, carTypeNum)) {
        //     carTypeNum = num;
        //     lastMin = 100;

        //     //记录不同牌型需要记录的来比较
        //     if (num == (int)CardType.StraightFlush || num == (int)CardType.Straight)
        //     {
        //         //同花顺或者顺子
        //         for (int i = 0; i < 5; i++)
        //         {
        //             if ((card[i] % weightValue) < lastMin) {
        //                 //取牌型最小一张
        //                 lastMin = card[i] % weightValue;
        //             }
        //         }
        //         if (lastMin == (int)CardNum.Two)
        //         {
        //             //有2要判断是否有A，因为A到5最小
        //             for (int i = 0; i < 5; i++)
        //             {
        //                 if ((card[i] % weightValue) == (int)CardNum.A)
        //                 {
        //                     //1到5
        //                     lastMin = -1;
        //                 }
        //             }
        //         }
        //     }
        //         else if (num == (int)CardType.FourOfAKind)
        //     {
        //         //四条
        //         for (int i = 0; i < 4; i++)
        //         {//四条不可能遍历完
        //             if ((card[i] % weightValue) == (card[i + 1] % weightValue)) {
        //                 //取四条牌型
        //                 lastMin = card[i] % weightValue;
        //                 break;
        //             }
        //         }
        //     }
        //         else if (num == (int)CardType.FullHouse)
        //     {
        //         //葫芦
        //         lastMin = card[0] % weightValue + card[1] % weightValue + card[2] % weightValue + card[3] % weightValue + card[4] % weightValue;
        //     }
        //         else if (num == (int)CardType.Flush)
        //     {
        //         //同花
        //         lastMin = 0;
        //         for (int i = 0; i < 5; i++)
        //         {
        //             lastMin += (card[i] % weightValue);
        //         }
        //     }
        //         else if (num == (int)CardType.ThreeOfAKind || num == (int)CardType.OnePair)
        //     {
        //         //三条或者一对(手牌两对才可能平行变三条或者一对)
        //         for (int i = 0; i < 4; i++)
        //         {
        //             for (int j = i + 1; j < 5; j++)
        //             {
        //                 if ((card[i] % weightValue) == (card[j] % weightValue)) {
        //                     //取牌型
        //                     lastMin = card[i] % weightValue;
        //                 }
        //             }
        //         }
        //     }
        //         else if (num == (int)CardType.TwoPair)
        //     {
        //             //两对
        //             int first = -1;
        //             int second = -1;
        //         for (int i = 0; i < 4; i++)
        //         {
        //             for (int j = i + 1; j < 5; j++)
        //             {
        //                 if ((card[i] % weightValue) == (card[j] % weightValue)) {
        //                     //取两个对子牌型
        //                     if (first == -1) {
        //                         first = card[i] % weightValue;
        //                     }
        //                     else {
        //                         second = card[i] % weightValue;
        //                     }
        //                 }
        //             }
        //         }
        //             int maxOne = Mathf.Max(first, second);
        //             int minOne = Mathf.Min(first, second);
        //         //两对判断大小，以大牌的大小优先，所以乘一个加权
        //         lastMin = maxOne * 20 + minOne;
        //     }
        //     highlightCards = CardTypeUtil.GetHighlightCard(card, (CardType)num);
        // }
        // else if (num == carTypeNum) {
        //     //牌型相同时候部分牌型需要比较大小
        //     if (num == (int)CardType.StraightFlush || num == (int)CardType.Straight)
        //     {
        //             //同花顺或者顺子
        //             bool bigger = true;
        //         for (int i = 0; i < 5; i++)
        //         {
        //             if ((card[i] % weightValue) < lastMin) {
        //                 //有一张小于就是小于
        //                 bigger = false;
        //             }
        //         }
        //         if (bigger) {
        //             lastMin = 100;
        //             for (int i = 0; i < 5; i++)
        //             {
        //                 if ((card[i] % weightValue) < lastMin) {
        //                     //取新的牌型最小一张
        //                     lastMin = card[i] % weightValue;
        //                 }
        //             }
        //             if (lastMin == (int)CardNum.Two)
        //             {
        //                 //有2要判断是否有1，因为1到5最小
        //                 for (int i = 0; i < 5; i++)
        //                 {
        //                     if ((card[i] % weightValue) == (int)CardNum.A)
        //                     {
        //                         //1到5
        //                         lastMin = -1;
        //                     }
        //                 }
        //             }
        //             //显示更大
        //             highlightCards = CardTypeUtil.GetHighlightCard(card, (CardType)num);
        //         }
        //     }
        //         else if (num == (int)CardType.FourOfAKind)
        //     {
        //             //四条
        //             int currentMin = 0;
        //         for (int i = 0; i < 4; i++)
        //         {//四条不可能遍历完
        //             if ((card[i] % weightValue) == (card[i + 1] % weightValue)) {
        //                 //取四条牌型
        //                 currentMin = card[i] % weightValue;
        //                 break;
        //             }
        //         }
        //         if (currentMin > lastMin) {
        //             lastMin = currentMin;
        //             //显示更大
        //             highlightCards = CardTypeUtil.GetHighlightCard(card, (CardType)num);
        //         }
        //     }
        //         else if (num == (int)CardType.FullHouse)
        //     {
        //             //葫芦
        //             int newNum = card[0] % weightValue + card[1] % weightValue + card[2] % weightValue + card[3] % weightValue + card[4] % weightValue;
        //         if (lastMin < newNum) {
        //             lastMin = newNum;
        //             //显示更大
        //             highlightCards = CardTypeUtil.GetHighlightCard(card, (CardType)num);
        //         }
        //     }
        //         else if (num == (int)CardType.Flush)
        //     {
        //             //同花
        //             int currentMin = 0;
        //         for (int i = 0; i < 5; i++)
        //         {
        //             currentMin += (card[i] % weightValue);
        //         }
        //         if (currentMin > lastMin) {
        //             lastMin = currentMin;
        //             //显示更大
        //             highlightCards = CardTypeUtil.GetHighlightCard(card, (CardType)num);
        //         }
        //     }
        //         else if (num == (int)CardType.ThreeOfAKind || num == (int)CardType.OnePair)
        //     {
        //             //三条或者一对
        //             int currentMin = 0;
        //         for (int i = 0; i < 4; i++)
        //         {
        //             for (int j = i + 1; j < 5; j++)
        //             {
        //                 if ((card[i] % weightValue) == (card[j] % weightValue)) {
        //                     //取牌型
        //                     currentMin = card[i] % weightValue;
        //                 }
        //             }
        //         }
        //         if (currentMin > lastMin) {
        //             lastMin = currentMin;
        //             //显示更大
        //             highlightCards = CardTypeUtil.GetHighlightCard(card, (CardType)num);
        //         }
        //     }
        //         else if (num == (int)CardType.TwoPair)
        //     {
        //             //两对
        //             int first = -1;
        //             int second = -1;
        //             int currentMin = 0;
        //         for (int i = 0; i < 4; i++)
        //         {
        //             for (int j = i + 1; j < 5; j++)
        //             {
        //                 if ((card[i] % weightValue) == (card[j] % weightValue)) {
        //                     //取两个对子牌型
        //                     if (first == -1) {
        //                         first = card[i] % weightValue;
        //                     }
        //                     else {
        //                         second = card[i] % weightValue;
        //                     }
        //                 }
        //             }
        //         }
        //             int maxOne = Mathf.Max(first, second);
        //             int minOne = Mathf.Min(first, second);
        //         //两对判断大小，以大牌的大小优先，所以乘一个加权
        //         currentMin = maxOne * 20 + minOne;
        //         if (currentMin > lastMin) {
        //             lastMin = currentMin;
        //             //显示更大
        //             highlightCards = CardTypeUtil.GetHighlightCard(card, (CardType)num);
        //         }
        //     }
        // }
    }

    //5张确定牌
    private static GetExactCardType(cards: number[], isSixPlus: boolean = false): CardType {
        if (cards.length < 5) {
            return CardType.HighCard;
        }
        // CardType cardType = CardType.HighCard;
        // List < sbyte > CardColor = new List<sbyte>(new sbyte[5]);
        // List < sbyte > CardNumber = new List<sbyte>(new sbyte[5]);
        // List < sbyte > array = new List<sbyte>(new sbyte[5]);
        // for (int i = 0; i < 5; i++)
        // {
        //     if (cards[i] == -1) {
        //         //空的公共牌处理
        //         return CardType.HighCard;
        //     }
        //     CardColor[i] = (sbyte)(cards[i] / weightValue);
        //     CardNumber[i] = (sbyte)(cards[i] % weightValue);
        // }

        // bool bsameColorOverFive = false;
        // bsameColorOverFive = true;
        // for (int i = 0, n = 4; i < n; i++)
        // {
        //     if (CardColor[i] != CardColor[i + 1]) {
        //         bsameColorOverFive = false;
        //         break;
        //     }
        // }

        // if (bsameColorOverFive) {
        //     for (int i = 0, n = array.Count; i < n; i++)
        //     {
        //         array[i] = CardNumber[i];
        //     }
        // }

        // if (bsameColorOverFive) {
        //     List < sbyte > arraySorted = new List<sbyte>(array.ToArray());
        //     arraySorted.Sort();
        //     if (CardTypeUtil.isStraight(arraySorted, array, isSixPlus)) {
        //         if (array.Contains((int)CardNum.A) && array.Contains((int)CardNum.K)) {
        //             cardType = CardType.RoyalFlush;
        //         }
        //         else {
        //             cardType = CardType.StraightFlush;
        //         }
        //     }
        //     else {
        //         cardType = CardType.Flush;
        //     }

        // }
        // else {

        //     array.Clear();
        //     for (int i = 0; i < 5; i++)
        //     {
        //         array.Add(CardNumber[i]);
        //     }
        //     List < sbyte > arrInput = new List<sbyte>(array.ToArray());
        //     arrInput.Sort();
        //     if (CardTypeUtil.isStraight(arrInput, null, isSixPlus)) {
        //         cardType = CardType.Straight;
        //     }
        //     else {
        //         int type = CardTypeUtil.getTempCardType(array);
        //         if (type != -1) {
        //             // 0  hulu  1 duizi 2  santiao  3 liangdui  -1 gaopai  4 sitiao
        //             switch (type) {
        //                 case 0:
        //                     cardType = CardType.FullHouse;
        //                     break;
        //                 case 1:
        //                     cardType = CardType.OnePair;
        //                     break;
        //                 case 2:
        //                     cardType = CardType.ThreeOfAKind;
        //                     break;
        //                 case 3:
        //                     cardType = CardType.TwoPair;
        //                     break;
        //                 case 4:
        //                     cardType = CardType.FourOfAKind;
        //                     break;
        //                 default:
        //                     break;
        //             }
        //         }
        //         else {
        //             cardType = CardType.HighCard;
        //         }
        //     }
        // }

        // return cardType;
    }
    // //根据牌型代号获取牌型英文名称
    // public static GetCardTypeEnglishName(cardTypeNum) {
    //     let cardType: CardType = cardTypeNum;
    //     return GetCardTypeEnglishName(cardType);
    // }

    public static GetCardTypeEnglishName(cardType) {
        switch (cardType) {
            case CardType.RoyalFlush:
                return "Royal Flush";
            case CardType.StraightFlush:
                return "Straight Flush";
            case CardType.FourOfAKind:
                return "Four of a kind";
            case CardType.FullHouse:
                return "Full House";
            case CardType.Flush:
                return "Flush";
            case CardType.Straight:
                return "Straight";
            case CardType.ThreeOfAKind:
                return "Three of a kind";
            case CardType.TwoPair:
                return "Two Pairs";
            case CardType.OnePair:
                return "One Pair";
            case CardType.HighCard:
                return "High Card";
            default:
                return "Fold";
        }
    }

}
