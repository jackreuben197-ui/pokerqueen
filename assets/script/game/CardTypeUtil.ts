
/// <summary>
/// 普通牌型

import {CPErrorCode} from "../i18n/CPErrorCode";

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

    private static weightValue: number = 15;
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
                            CardTypeUtil.CompareCardType(card, carTypeNum, lastMin, highlightCards, isSixPlus);
                        }
                    }
                }
            }
        }
        return carTypeNum;
    }


    /// <summary>
    /// 用于判断哪个牌型大。短牌同花比葫芦大，转换一下，在做对比（只转换比大小，不参与牌型运算）
    /// </summary>
    /// <param name="isSixPlus"></param>
    /// <param name="carTypeNum"></param>
    /// <returns></returns>
    public static CarTypeNumConversionToSixPlusCardType(isSixPlus: boolean, carTypeNum: number): number {
        let cardType = 10;
        if (isSixPlus) {
            if (carTypeNum == CardType.FullHouse) {
                cardType = CardType.Flush;
            }
            else if (carTypeNum == CardType.Flush) {
                cardType = CardType.FullHouse;
            }
            else {
                cardType = carTypeNum;
            }
        }
        else {
            cardType = carTypeNum;
        }
        return cardType;
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
        let cardType: CardType = CardTypeUtil.GetExactCardType(card, isSixPlus);
        let num = cardType;
        if (this.CarTypeNumConversionToSixPlusCardType(isSixPlus, num) > this.CarTypeNumConversionToSixPlusCardType(isSixPlus, carTypeNum)) {
            carTypeNum = num;
            lastMin = 100;

            //记录不同牌型需要记录的来比较
            if (num == CardType.StraightFlush || num == CardType.Straight) {
                //同花顺或者顺子
                for (let i = 0; i < 5; i++) {
                    if ((card[i] % this.weightValue) < lastMin) {
                        //取牌型最小一张
                        lastMin = card[i] % this.weightValue;
                    }
                }
                if (lastMin == CardNum.Two) {
                    //有2要判断是否有A，因为A到5最小
                    for (let i = 0; i < 5; i++) {
                        if ((card[i] % this.weightValue) == CardNum.A) {
                            //1到5
                            lastMin = -1;
                        }
                    }
                }
            }
            else if (num == CardType.FourOfAKind) {
                //四条
                for (let i = 0; i < 4; i++) {//四条不可能遍历完
                    if ((card[i] % this.weightValue) == (card[i + 1] % this.weightValue)) {
                        //取四条牌型
                        lastMin = card[i] % this.weightValue;
                        break;
                    }
                }
            }
            else if (num == CardType.FullHouse) {
                //葫芦
                lastMin = card[0] % this.weightValue + card[1] % this.weightValue + card[2] % this.weightValue + card[3] % this.weightValue + card[4] % this.weightValue;
            }
            else if (num == CardType.Flush) {
                //同花
                lastMin = 0;
                for (let i = 0; i < 5; i++) {
                    lastMin += (card[i] % this.weightValue);
                }
            }
            else if (num == CardType.ThreeOfAKind || num == CardType.OnePair) {
                //三条或者一对(手牌两对才可能平行变三条或者一对)
                for (let i = 0; i < 4; i++) {
                    for (let j = i + 1; j < 5; j++) {
                        if ((card[i] % this.weightValue) == (card[j] % this.weightValue)) {
                            //取牌型
                            lastMin = card[i] % this.weightValue;
                        }
                    }
                }
            }
            else if (num == CardType.TwoPair) {
                //两对
                let first = -1;
                let second = -1;
                for (let i = 0; i < 4; i++) {
                    for (let j = i + 1; j < 5; j++) {
                        if ((card[i] % this.weightValue) == (card[j] % this.weightValue)) {
                            //取两个对子牌型
                            if (first == -1) {
                                first = card[i] % this.weightValue;
                            }
                            else {
                                second = card[i] % this.weightValue;
                            }
                        }
                    }
                }
                let maxOne = Math.max(first, second);
                let minOne = Math.min(first, second);
                //两对判断大小，以大牌的大小优先，所以乘一个加权
                lastMin = maxOne * 20 + minOne;
            }
            highlightCards = CardTypeUtil.GetHighlightCard(card, num);
        }
        else if (num == carTypeNum) {
            //牌型相同时候部分牌型需要比较大小
            if (num == CardType.StraightFlush || num == CardType.Straight) {
                //同花顺或者顺子
                let bigger: boolean = true;
                for (let i = 0; i < 5; i++) {
                    if ((card[i] % this.weightValue) < lastMin) {
                        //有一张小于就是小于
                        bigger = false;
                    }
                }
                if (bigger) {
                    lastMin = 100;
                    for (let i = 0; i < 5; i++) {
                        if ((card[i] % this.weightValue) < lastMin) {
                            //取新的牌型最小一张
                            lastMin = card[i] % this.weightValue;
                        }
                    }
                    if (lastMin == CardNum.Two) {
                        //有2要判断是否有1，因为1到5最小
                        for (let i = 0; i < 5; i++) {
                            if ((card[i] % this.weightValue) == CardNum.A) {
                                //1到5
                                lastMin = -1;
                            }
                        }
                    }
                    //显示更大
                    highlightCards = CardTypeUtil.GetHighlightCard(card, num);
                }
            }
            else if (num == CardType.FourOfAKind) {
                //四条
                let currentMin = 0;
                for (let i = 0; i < 4; i++) {//四条不可能遍历完
                    if ((card[i] % this.weightValue) == (card[i + 1] % this.weightValue)) {
                        //取四条牌型
                        currentMin = card[i] % this.weightValue;
                        break;
                    }
                }
                if (currentMin > lastMin) {
                    lastMin = currentMin;
                    //显示更大
                    highlightCards = CardTypeUtil.GetHighlightCard(card, num);
                }
            }
            else if (num == CardType.FullHouse) {
                //葫芦
                let newNum = card[0] % this.weightValue + card[1] % this.weightValue + card[2] % this.weightValue + card[3] % this.weightValue + card[4] % this.weightValue;
                if (lastMin < newNum) {
                    lastMin = newNum;
                    //显示更大
                    highlightCards = CardTypeUtil.GetHighlightCard(card, num);
                }
            }
            else if (num == CardType.Flush) {
                //同花
                let currentMin = 0;
                for (let i = 0; i < 5; i++) {
                    currentMin += (card[i] % this.weightValue);
                }
                if (currentMin > lastMin) {
                    lastMin = currentMin;
                    //显示更大
                    highlightCards = CardTypeUtil.GetHighlightCard(card, num);
                }
            }
            else if (num == CardType.ThreeOfAKind || num == CardType.OnePair) {
                //三条或者一对
                let currentMin = 0;
                for (let i = 0; i < 4; i++) {
                    for (let j = i + 1; j < 5; j++) {
                        if ((card[i] % this.weightValue) == (card[j] % this.weightValue)) {
                            //取牌型
                            currentMin = card[i] % this.weightValue;
                        }
                    }
                }
                if (currentMin > lastMin) {
                    lastMin = currentMin;
                    //显示更大
                    highlightCards = CardTypeUtil.GetHighlightCard(card, num);
                }
            }
            else if (num == CardType.TwoPair) {
                //两对
                let first = -1;
                let second = -1;
                let currentMin = 0;
                for (let i = 0; i < 4; i++) {
                    for (let j = i + 1; j < 5; j++) {
                        if ((card[i] % this.weightValue) == (card[j] % this.weightValue)) {
                            //取两个对子牌型
                            if (first == -1) {
                                first = card[i] % this.weightValue;
                            }
                            else {
                                second = card[i] % this.weightValue;
                            }
                        }
                    }
                }
                let maxOne = Math.max(first, second);
                let minOne = Math.min(first, second);
                //两对判断大小，以大牌的大小优先，所以乘一个加权
                currentMin = maxOne * 20 + minOne;
                if (currentMin > lastMin) {
                    lastMin = currentMin;
                    //显示更大
                    highlightCards = CardTypeUtil.GetHighlightCard(card, num);
                }
            }
        }
    }



    //5张确定牌
    private static GetExactCardType(cards: number[], isSixPlus: boolean = false): CardType {
        if (cards.length < 5) {
            return CardType.HighCard;
        }
        let cardType: CardType = CardType.HighCard;
        let CardColor: number[] = [];
        let CardNumber: number[] = [];
        let array: number[] = [];
        for (let i = 0; i < 5; i++) {
            if (cards[i] == -1) {
                //空的公共牌处理
                return CardType.HighCard;
            }
            CardColor[i] = (cards[i] / this.weightValue);
            CardNumber[i] = (cards[i] % this.weightValue);
        }

        let bsameColorOverFive = false;
        bsameColorOverFive = true;
        for (let i = 0, n = 4; i < n; i++) {
            if (CardColor[i] != CardColor[i + 1]) {
                bsameColorOverFive = false;
                break;
            }
        }

        if (bsameColorOverFive) {
            for (let i = 0, n = array.length; i < n; i++) {
                array[i] = CardNumber[i];
            }
        }

        if (bsameColorOverFive) {
            let arraySorted: number[] = [...array];
            arraySorted.sort((a, b) => a - b);
            if (CardTypeUtil.isStraight(arraySorted, array, isSixPlus)) {
                if (array.includes(CardNum.A) && array.includes(CardNum.K)) {
                    cardType = CardType.RoyalFlush;
                }
                else {
                    cardType = CardType.StraightFlush;
                }
            }
            else {
                cardType = CardType.Flush;
            }

        }
        else {

            array = [];
            for (let i = 0; i < 5; i++) {
                array.push(CardNumber[i]);
            }
            let arrInput: number[] = [...array];
            arrInput.sort((a, b) => a - b);
            if (CardTypeUtil.isStraight(arrInput, null, isSixPlus)) {
                cardType = CardType.Straight;
            }
            else {
                let type = CardTypeUtil.getTempCardType(array);
                if (type != -1) {
                    // 0  hulu  1 duizi 2  santiao  3 liangdui  -1 gaopai  4 sitiao
                    switch (type) {
                        case 0:
                            cardType = CardType.FullHouse;
                            break;
                        case 1:
                            cardType = CardType.OnePair;
                            break;
                        case 2:
                            cardType = CardType.ThreeOfAKind;
                            break;
                        case 3:
                            cardType = CardType.TwoPair;
                            break;
                        case 4:
                            cardType = CardType.FourOfAKind;
                            break;
                        default:
                            break;
                    }
                }
                else {
                    cardType = CardType.HighCard;
                }
            }
        }

        return cardType;
    }


    private static getTempCardType(array: number[]): number {
        let arrInfo: number[] = [...array];
        let countOfDuiZi = 0;
        let countOfThree = 0;
        let countOfFour = 0;
        for (let i = 0; i < arrInfo.length; i++) {
            let count = 0;
            let value = arrInfo[i];
            for (let j = 0; j < arrInfo.length; j++) {
                if (i == j) {
                    continue;
                }

                if (value == arrInfo[j]) {
                    count++;
                    arrInfo.splice(j, 1)
                    j--;
                    if (arrInfo.length <= 1) {
                        break;
                    }
                }
            }
            arrInfo.splice(i, 1)
            i--;
            if (count == 2) {
                countOfThree++;
            }
            if (count == 1) {
                countOfDuiZi++;
            }
            if (count == 3) {
                countOfFour++;
            }
            if (arrInfo.length <= 1) {
                break;
            }
        }

        if (countOfFour >= 1) {
            return 4;
        }
        if ((countOfDuiZi >= 1 && countOfThree >= 1) || countOfThree == 2) {
            return 0;
        }
        if (countOfThree >= 1) {
            return 2;
        }
        if (countOfDuiZi >= 2) {
            return 3;
        }
        if (countOfDuiZi == 1) {
            return 1;
        }

        return -1;

    }



    private static isStraight(array: number[], arrayStoreStraight: number[], isSixPlus = false): boolean {
        let count = 0;
        if (arrayStoreStraight == null) {
            arrayStoreStraight = [];
        }
        arrayStoreStraight = [];
        for (let i = array.length - 1; i > 0; i--) {
            if (array[i] - 1 == array[i - 1]) {
                count++;
                arrayStoreStraight.push(array[i]);
            }
            else {
                count = 0;
                arrayStoreStraight = [];
            }
            if (i == 1 && count == 3) {
                arrayStoreStraight.push(array[i - 1]);
            }
            if (count >= 4) {
                arrayStoreStraight.push(array[i - 1]);
                return true;
            }
        }
        if (count == 3) {
            arrayStoreStraight.sort((a, b) => a - b);
            if (isSixPlus)//短牌，判断最小是否是6，如果是6 A可以当5也可以组成顺子
            {
                if (arrayStoreStraight[0] == CardNum.Six) {

                    array.forEach(number => {
                        if (number == CardNum.A) {
                            return true;
                        }
                    })
                }
            }
            else {
                if (arrayStoreStraight[0] == CardNum.Two) {
                    array.forEach(number => {
                        if (number == CardNum.A) {
                            return true;
                        }
                    })
                }
            }

        }
        return false;
    }

    private static GetHighlightCard(cards: number[], cardType: CardType): number[] {
        let highlightCard: number[] = [];
        if (cardType == CardType.RoyalFlush
            || cardType == CardType.StraightFlush
            || cardType == CardType.FullHouse
            || cardType == CardType.Flush
            || cardType == CardType.Straight) {
            //5张都高亮
            highlightCard.push(...cards);
        }
        else {
            //找相同牌高亮
            let arrInfo: number[] = [...cards];
            //new List<sbyte>(cards.ToArray());
            for (let i = 0; i < arrInfo.length; i++) {
                let valueCard: number = arrInfo[i];
                let valueCardNum: number = valueCard % this.weightValue;
                for (let j = 0; j < arrInfo.length; j++) {
                    if (i == j) {
                        continue;
                    }
                    let comparedCard = arrInfo[j];
                    let comparedCardNum = comparedCard % this.weightValue;
                    if (valueCardNum == comparedCardNum && valueCardNum != -1) {
                        if (!highlightCard.includes(valueCard)) {
                            highlightCard.push(valueCard);
                        }
                        if (!highlightCard.includes(comparedCard)) {
                            highlightCard.push(comparedCard);
                        }
                        arrInfo.splice(j, 1);
                        j--;
                        if (arrInfo.length <= 1) {
                            break;
                        }
                    }
                }
                arrInfo.splice(i, 1);
                i--;
                if (arrInfo.length <= 1) {
                    break;
                }
            }
        }

        return highlightCard;
    }

    public static GetCardTypeName(cardType: CardType): string {
        switch (cardType) {
            case CardType.RoyalFlush:
                return CPErrorCode.LanguageDescription(10053);
            case CardType.StraightFlush:
                return CPErrorCode.LanguageDescription(10054);
            case CardType.FourOfAKind:
                return CPErrorCode.LanguageDescription(10055);
            case CardType.FullHouse:
                return CPErrorCode.LanguageDescription(10056);
            case CardType.Flush:
                return CPErrorCode.LanguageDescription(10057);
            case CardType.Straight:
                return CPErrorCode.LanguageDescription(10058);
            case CardType.ThreeOfAKind:
                return CPErrorCode.LanguageDescription(10059);
            case CardType.TwoPair:
                return CPErrorCode.LanguageDescription(10060);
            case CardType.OnePair:
                return CPErrorCode.LanguageDescription(10061);
            case CardType.HighCard:
                return CPErrorCode.LanguageDescription(10062);
            default:
                return "";
        }
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
