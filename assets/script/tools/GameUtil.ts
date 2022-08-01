import { RoomType } from "../define/EIDefine";
import TexasGame from "../game/TexasGame";

export default class GameUtil {
    private static readonly normalOuts: number[] = [0, 30, 16, 10, 8, 6, 5, 4, 3.5, 3, 2.5, 2.2, 2, 1.8, 1.6, 1.4, 1.2, 1, 0.8, 0.6, 0.5];
    private static readonly omahaOuts: number[] = [0, 24, 12, 8, 6, 4.5, 4, 3.2, 2.7, 2.3, 2, 1.7, 1.5, 1.3, 1.2, 1.1, 1, 0.8, 0.7, 0.6, 0.5];
    public static OutsList = new Map<number, number[]>();
    public static TexasGameDic = new Map<RoomType, TexasGame>();

    public static InstantiateTexasGame(roomType: RoomType) {

        let game: TexasGame = null;

        switch (roomType) {
            case RoomType.TexasHoldemStandardNoLimit: // 普通
            case RoomType.TexasHoldemStandardPotLimit: // 普通底池限注
            case RoomType.TexasHoldemSixPlusFixedNoLimit: // 普通短牌
            case RoomType.TexasHoldemSixPlusFixedPotLimit: // 普通短牌底池限注
                {

                    (game = this.TexasGameDic.get(roomType)) || this.TexasGameDic.set(roomType, game = new TexasGame);
                    //ComponentFactory.CreateWithId<TexasGame, Component>((int)roomType, component, fromPool);
                }
                break;

            case RoomType.TexasHoldemStandardAof: // 普通AOF
            case RoomType.TexasHoldemSixPlusFixedAof: // 普通短牌AOF
                {
                    //game = ComponentFactory.CreateWithId<TexasAofGame, Component>((int)roomType, component, fromPool);
                }
                break;

            case RoomType.Omaha4StandardNoLimit: // 奥马哈4张
            case RoomType.Omaha4StandardPotLimit: // 奥马哈4张底池限注
            case RoomType.Omaha4SixPlusFixedNoLimit: // 奥马哈4张短牌
            case RoomType.Omaha4SixPlusFixedPotLimit: // 奥马哈4张短牌, 底池限注
                {
                    // game = ComponentFactory.CreateWithId<OmahaGame, Component>((int)roomType, component, fromPool);
                }
                break;

            case RoomType.Omaha4StandardAof: // 奥马哈4张AOF
            case RoomType.Omaha4SixPlusFixedAof: // 奥马哈4张短牌AOF
                {
                    // game = ComponentFactory.CreateWithId<OmahaAofGame, Component>((int)roomType, component, fromPool);
                }
                break;

            case RoomType.Omaha5StandardNoLimit: // 奥马哈5张
            case RoomType.Omaha5StandardPotLimit: // 奥马哈5张底池限注
            case RoomType.Omaha5SixPlusFixedNoLimit: // 奥马哈5张短牌
            case RoomType.Omaha5SixPlusFixedPotLimit: // 奥马哈5张短牌底池限注
                {
                    //game = ComponentFactory.CreateWithId<OmahaGameFive, Component>((int)roomType, component, fromPool);
                }
                break;

            case RoomType.Omaha5StandardAof: // 奥马哈5张aof
            case RoomType.Omaha5SixPlusFixedAof: // 奥马哈5张短牌aof
                {
                    //game = ComponentFactory.CreateWithId<OmahaGameFiveAof, Component>((int)roomType, component, fromPool);
                }
                break;

            case RoomType.Omaha6StandardNoLimit: // 奥马哈6张
            case RoomType.Omaha6StandardPotLimit: // 奥马哈6张底池限注
            case RoomType.Omaha6SixPlusFixedNoLimit: // 奥马哈6张短牌
            case RoomType.Omaha6SixPlusFixedPotLimit: // 奥马哈6张短牌底池限注
                {
                    //game = ComponentFactory.CreateWithId<OmahaGameSix, Component>((int)roomType, component, fromPool);
                }
                break;

            case RoomType.Omaha6StandardAof: // 奥马哈6张aof
            case RoomType.Omaha6SixPlusFixedAof: // 奥马哈6张短牌aof
                {
                    //game = ComponentFactory.CreateWithId<OmahaGameSixAof, Component>((int)roomType, component, fromPool);
                }
                break;

            case RoomType.MTTTexasHoldemStandardNoLimit:
            case RoomType.MTTTexasHoldemStandardPotLimit:
            case RoomType.MTTTexasHoldemStandardAof:
            case RoomType.MTTTexasHoldemSixPlusFixedNoLimit:
            case RoomType.MTTTexasHoldemSixPlusFixedPotLimit:
            case RoomType.MTTTexasHoldemSixPlusFixedAof:
                {
                    //game = ComponentFactory.CreateWithId<MTTGame, Component>((int)roomType, component, fromPool);
                }
                break;

            case RoomType.MTTOmaha4StandardNoLimit:
            case RoomType.MTTOmaha4StandardPotLimit:
            case RoomType.MTTOmaha4StandardAof:
            case RoomType.MTTOmaha4SixPlusFixedNoLimit:
            case RoomType.MTTOmaha4SixPlusFixedPotLimit:
            case RoomType.MTTOmaha4SixPlusFixedAof:
                {
                    //game = ComponentFactory.CreateWithId<MTTOmahaGameFour, Component>((int)roomType, component, fromPool);
                }
                break;

            case RoomType.MTTOmaha5StandardNoLimit:
            case RoomType.MTTOmaha5StandardPotLimit:
            case RoomType.MTTOmaha5StandardAof:
            case RoomType.MTTOmaha5SixPlusFixedNoLimit:
            case RoomType.MTTOmaha5SixPlusFixedPotLimit:
            case RoomType.MTTOmaha5SixPlusFixedAof:
                {
                    //game = ComponentFactory.CreateWithId<MTTOmahaGameFive, Component>((int)roomType, component, fromPool);
                }
                break;

            case RoomType.MTTOmaha6StandardNoLimit:
            case RoomType.MTTOmaha6StandardPotLimit:
            case RoomType.MTTOmaha6StandardAof:
            case RoomType.MTTOmaha6SixPlusFixedNoLimit:
            case RoomType.MTTOmaha6SixPlusFixedPotLimit:
            case RoomType.MTTOmaha6SixPlusFixedAof:
                {
                    //game = ComponentFactory.CreateWithId<MTTOmahaGameSix, Component>((int)roomType, component, fromPool);
                }
                break;
        }

        return game;

    }
}
