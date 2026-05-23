import { ServerMessageEnterRoom } from '../../../../protobuf/holdem/req_th_enter_room_pb';
import roomDataManager from '../../common/core/RoomDataManager';
import TexasGameRoomData from '../../texas/data/TexasGameRoomData';
import SceneManager from '../../../../manager/SceneManager';
import { UIDefine } from '../../../../define/UIDefine';
import UIComponent, { PrefabUI } from '../../../../ui/UIComponent';
import { UIRoomTexasEnterParam } from '../../common/view/room/texas/UIRoomTexas';
const LN = '[EnterRoom]';

// EnterRoom 1002
export default async function EnterRoom(data: ServerMessageEnterRoom.AsObject, roomID: number, matchID: number): Promise<void> {
    let roomData = roomDataManager.getRoomData<TexasGameRoomData>(roomID, matchID);
    if (!roomData && matchID > 0) {
        roomData = roomDataManager.getRoomData<TexasGameRoomData>(0, matchID);
        if (roomData) roomData.roomID = roomID;
        roomDataManager.deleteRoomData(0, matchID);
        roomDataManager.setRoomData(roomID, matchID, roomData);
    }
    if (!roomData) {
        console.error(LN, 'no store room data');
        return;
    }

    UIComponent.Instance.HideUI(PrefabUI.UIPreloading);
    if (data.status == 0) {
        roomData.basicInfo.sbante = { sb: data.roomInfo.smallBlind, ante: data.roomInfo.ante };
        if (data.handInfo) {
            roomData.basicInfo.handNum = data.handInfo.handNum;
            roomData.potInfo.allPot = data.handInfo.allBet;
            roomData.potInfo.potList = data.handInfo.potsList;
        }
        data.playersList.forEach((player) => {
            let seatData = roomData.seatsStateManager.getSeatPlayer(player.seatId);
            seatData.name = player.name;
            seatData.userID = player.userRid;
            seatData.avatar = player.avatar;
            seatData.chip = player.chip;
            seatData.roundBet = player.roundBet;
            seatData.handBet = player.handBet;
            seatData.cards  = player.cardsList;
            console.log('1111111111', player.cardsList);
        })
        setTimeout(() => {roomData.seatsStateManager.seated(3, true)}, 3000);
        // if (data.myInfo) {
            
        // }
        // if (matchID > 0) {
        //     // roomData.roomID =
        //     // //matchId;
        //     // console.log(LN, `Protocol_Holdem_EnterRoom_Handler: cache mtt room id: ${GameCache.Instance.room_id}`);
        // }
        // // if (ProcedureManager.currProcedure.id == ProcedureEnum.Texas) {
        //     let game_enter_type = GameCache.Instance.enter_param.game_enter_type;
        //     //ProcedureManager.currProcedure.param?.game_enter_type;
        //     // if (game_enter_type?.length) {
        //     //     for (let i = 0; i < fromUIs.length; i++) {
        //     //         UIComponent.Instance.CloseNoAnimation(fromUIs[i]);
        //     //     }
        //     // }
        //     switch (game_enter_type) {
        //         case 0:
        //             break;
        //         case 1: //工會
        //             UIComponent.Instance.CloseNoAnimation(UIDefine.UIClubHome);
        //             break;
        //         case 2: //朋友
        //             UIComponent.Instance.CloseNoAnimation(UIDefine.UIClubCreateMatchHome);
        //             UIComponent.Instance.CloseNoAnimation(UIDefine.UIClubCreateMatch);
        //             break;
        //         case 3: //MTT
        //             //UIComponent.Instance.CloseNoAnimation(UIDefine.MttDetailForm);
        //             // UIComponent.Instance.CloseNoAnimation(UIDefine.MttListForm);
        //             // UIComponent.Instance.CloseNoAnimation(UIDefine.UIMTTDetail);
        //             // UIComponent.Instance.CloseNoAnimation(UIDefine.UIMTTList);
        //             break;
        //     }
        // }
        await SceneManager.Instance.switchScene<UIRoomTexasEnterParam>(UIDefine.UIRoomTexas, null, {
            roomID: roomID,
            matchID: matchID,
            observer: false
        });
        // this.game.SMAgency.ChangeGameState(TexasGameState.Init, response);
        // // 进房成功后加入 Agora 视频频道（确保场景和协议都已就绪）
        // this.game.TexasGameProtocol.JoinVideoChannelAfterEnterRoom();
    }

    // } else if (response.status == ServerErrorCode.Gameplay_AutoSeatReturnToInvalidGame && isMTT) {
    //     console.log(LN, `Protocol_Holdem_EnterRoom_Handler: response.state : ServerErrorCode.Gameplay_AutoSeatReturnToInvalidGame`);
    //     // 进入ExchangeRoom状态，等待换房
    //     this.game.SMAgency.ChangeGameState(TexasGameState.ExchangeRoom, null);
    // } else {
    //     UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(response.status));
    //     // 进入房间失败
    //     this.game.SMAgency.ChangeGameState(TexasGameState.Exit, response);
    // }
}
