// package: holdem.pb
// file: protobuf/holdem/define.proto

import * as jspb from "google-protobuf";

export class Def extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Def.AsObject;
  static toObject(includeInstance: boolean, msg: Def): Def.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: Def, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Def;
  static deserializeBinaryFromReader(message: Def, reader: jspb.BinaryReader): Def;
}

export namespace Def {
  export type AsObject = {
  }

  export interface ActionMap {
    /// <summary>
    /// 未比赛自由状态
    /// </summary>
    NONE: 0;
    /// <summary>
    /// 前注
    /// </summary>
    ANTE: 1;
    /// <summary>
    /// 小盲
    /// </summary>
    SB: 2;
    /// <summary>
    /// 大盲
    /// </summary>
    BB: 3;
    /// <summary>
    /// 抓
    /// </summary>
    STRADDLE: 4;
    /// <summary>
    /// 下
    /// </summary>
    BET: 5;
    /// <summary>
    /// 跟
    /// </summary>
    CALL: 6;
    /// <summary>
    /// 盖
    /// </summary>
    FOLD: 7;
    /// <summary>
    /// 观望
    /// </summary>
    CHECK: 8;
    /// <summary>
    /// 追
    /// </summary>
    RAISE: 9;
    /// <summary>
    /// 全压
    /// </summary>
    ALLIN: 10;
    /// <summary>
    /// 补盲扣款
    /// </summary>
    POST: 11;
    /// <summary>
    /// 已经开始比赛还未动作
    /// </summary>
    READY: 12;
    /// <summary>
    /// 又补盲又前住
    /// </summary>
    POSTANTE: 13;
  }

  export const Action: ActionMap;

  export interface CanPlayStatusMap {
    /// <summary>
    /// 无法打牌
    /// </summary>
    DISABLE: 0;
    /// <summary>
    /// 正常打牌
    /// </summary>
    NORMAL: 1;
    /// <summary>
    /// 需要补盲
    /// </summary>
    NEED_POST: 2;
    /// <summary>
    /// 已经同意补盲
    /// </summary>
    AGREE_POST: 3;
    /// <summary>
    /// 留座,无法打牌
    /// </summary>
    KEEP_SEAT: 4;
  }

  export const CanPlayStatus: CanPlayStatusMap;

  export interface GameStatusMap {
    NOT_START: 0;
    WAIT_HAND_START: 1;
    HAND_STARTED: 2;
    HAND_PREFLOP: 3;
    HAND_FLOP: 4;
    HAND_TURN: 5;
    HAND_RIVER: 6;
    HAND_END: 7;
    CANCEL: 8;
    COMPLETE: 9;
    UNKNOWN: 10;
  }

  export const GameStatus: GameStatusMap;

  export interface RoundMap {
    UNDEFINED: 0;
    PREFLOP: 1;
    FLOP: 2;
    TURN: 3;
    RIVER: 4;
  }

  export const Round: RoundMap;

  export interface StandUpReasonMap {
    SUR_NONE: 0;
    SUR_NOCHIP: 1;
    SUR_ACTIVE: 2;
    SUR_GAME_END: 3;
    SUR_FORCE: 4;
    SUR_EXCHANGE: 5;
    SUR_AUTO_EXCEED_MAX_TIMES: 6;
    SUR_KEEPSEAT_TIMEOUT: 7;
    SUR_ACTIVE_LEAVE: 8;
  }

  export const StandUpReason: StandUpReasonMap;

  export interface LeaveReasonMap {
    LR_NONE: 0;
    LR_NOCHIP: 1;
    LR_ACTIVE: 2;
    LR_GAME_END: 3;
    LR_FORCE: 4;
    LR_EXCHANGE: 5;
    LR_AUTO_EXCEED_MAX_TIMES: 6;
    LR_OFFLINE: 7;
  }

  export const LeaveReason: LeaveReasonMap;

  export interface ChipChangeReasonMap {
    CC_NONE: 0;
    CC_STORE_CHIP: 1;
    CC_AUTO_ON_TABLE: 2;
    CC_MTT_ADD_ON: 3;
    CC_MTT_STORE_RETURN: 4;
    CC_MTT_ADD_ON_PLUS_MODE1: 5;
    CC_MTT_ADD_ON_PLUS_MODE2: 6;
  }

  export const ChipChangeReason: ChipChangeReasonMap;

  export interface ActionShortcutMap {
    SC_1_2: 0;
    SC_1_3: 1;
    SC_1_4: 2;
    SC_2_3: 3;
    SC_3_4: 4;
    SC_3_5: 5;
    SC_1_1: 6;
    SC_15_10: 7;
  }

  export const ActionShortcut: ActionShortcutMap;

  export interface MTTPropBuyTypeMap {
    MTTPBT_NOT_SUPPORT: 0;
    MTTPBT_ONLY: 1;
    MTTPBT_MIX: 2;
  }

  export const MTTPropBuyType: MTTPropBuyTypeMap;

  export interface ConsumeTypeMap {
    CT_NONE: 0;
    CT_MSG_1: 1;
    CT_MSG_2: 2;
    CT_MSG_3: 3;
    CT_MSG_4: 4;
    CT_EMOJI_1: 5;
    CT_EMOJI_2: 6;
    CT_EMOJI_3: 7;
    CT_EMOJI_4: 8;
    CT_DELAY_1: 9;
    CT_DELAY_2: 10;
    CT_DELAY_3: 11;
    CT_DELAY_4: 12;
    CT_VC_1: 13;
    CT_VC_2: 14;
  }

  export const ConsumeType: ConsumeTypeMap;

  export interface GameTypeMap {
    HOLDEM: 0;
    OMAHA4: 1;
    OMAHA5: 2;
    OMAHA6: 3;
  }

  export const GameType: GameTypeMap;

  export interface PokerTypeMap {
    STANDARD: 0;
    SIXPLUS_FIX: 2;
  }

  export const PokerType: PokerTypeMap;

  export interface LimitBetTypeMap {
    NO_LIMIT: 0;
    POT_LIMIT: 1;
    AOF: 2;
  }

  export const LimitBetType: LimitBetTypeMap;

  export interface AddOnModeMap {
    ADDON_NONE: 0;
    PLUS_MODE1: 1;
    PLUS_MODE2: 2;
    ADDON_NORMAL: 3;
  }

  export const AddOnMode: AddOnModeMap;
}

export class Room extends jspb.Message {
  getRoomId(): number;
  setRoomId(value: number): void;

  getMatchId(): number;
  setMatchId(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Room.AsObject;
  static toObject(includeInstance: boolean, msg: Room): Room.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: Room, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Room;
  static deserializeBinaryFromReader(message: Room, reader: jspb.BinaryReader): Room;
}

export namespace Room {
  export type AsObject = {
    roomId: number,
    matchId: number,
  }
}

export class Operator extends jspb.Message {
  getSeatId(): number;
  setSeatId(value: number): void;

  clearActionsList(): void;
  getActionsList(): Array<ActionLimit>;
  setActionsList(value: Array<ActionLimit>): void;
  addActions(value?: ActionLimit, index?: number): ActionLimit;

  clearInsuranceLimitList(): void;
  getInsuranceLimitList(): Array<InsurancePotLimit>;
  setInsuranceLimitList(value: Array<InsurancePotLimit>): void;
  addInsuranceLimit(value?: InsurancePotLimit, index?: number): InsurancePotLimit;

  getLeftOpTime(): number;
  setLeftOpTime(value: number): void;

  getDelayTimes(): number;
  setDelayTimes(value: number): void;

  clearShortcutsList(): void;
  getShortcutsList(): Array<ActionShortcutLimit>;
  setShortcutsList(value: Array<ActionShortcutLimit>): void;
  addShortcuts(value?: ActionShortcutLimit, index?: number): ActionShortcutLimit;

  getIsInsurance(): boolean;
  setIsInsurance(value: boolean): void;

  getIsAgreeSecondPc(): boolean;
  setIsAgreeSecondPc(value: boolean): void;

  getOpDeadline(): number;
  setOpDeadline(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Operator.AsObject;
  static toObject(includeInstance: boolean, msg: Operator): Operator.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: Operator, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Operator;
  static deserializeBinaryFromReader(message: Operator, reader: jspb.BinaryReader): Operator;
}

export namespace Operator {
  export type AsObject = {
    seatId: number,
    actionsList: Array<ActionLimit.AsObject>,
    insuranceLimitList: Array<InsurancePotLimit.AsObject>,
    leftOpTime: number,
    delayTimes: number,
    shortcutsList: Array<ActionShortcutLimit.AsObject>,
    isInsurance: boolean,
    isAgreeSecondPc: boolean,
    opDeadline: number,
  }
}

export class RoomInfo extends jspb.Message {
  getAnte(): number;
  setAnte(value: number): void;

  getSmallBlind(): number;
  setSmallBlind(value: number): void;

  getScheduleStartTime(): number;
  setScheduleStartTime(value: number): void;

  getSchedulePlayDuration(): number;
  setSchedulePlayDuration(value: number): void;

  getStartTime(): number;
  setStartTime(value: number): void;

  getCurrentMinRate(): number;
  setCurrentMinRate(value: number): void;

  getCurrentMaxRate(): number;
  setCurrentMaxRate(value: number): void;

  getLimitIp(): boolean;
  setLimitIp(value: boolean): void;

  getLimitGps(): boolean;
  setLimitGps(value: boolean): void;

  getInsurance(): boolean;
  setInsurance(value: boolean): void;

  getLimitPoolRateAllLv(): boolean;
  setLimitPoolRateAllLv(value: boolean): void;

  getLimitMinPoolRate(): number;
  setLimitMinPoolRate(value: number): void;

  getLimitRetainMinRate(): number;
  setLimitRetainMinRate(value: number): void;

  getLimitTotalHandNumAllLv(): boolean;
  setLimitTotalHandNumAllLv(value: boolean): void;

  getLimitTotalHandNum(): number;
  setLimitTotalHandNum(value: number): void;

  getDelaySeeCard(): boolean;
  setDelaySeeCard(value: boolean): void;

  getStraddle(): boolean;
  setStraddle(value: boolean): void;

  getOpDuration(): number;
  setOpDuration(value: number): void;

  getRetainType(): RoomInfo.RetainTypeMap[keyof RoomInfo.RetainTypeMap];
  setRetainType(value: RoomInfo.RetainTypeMap[keyof RoomInfo.RetainTypeMap]): void;

  getMuck(): boolean;
  setMuck(value: boolean): void;

  getUniqueId(): string;
  setUniqueId(value: string): void;

  getIsAgreeSecondPcs(): boolean;
  setIsAgreeSecondPcs(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RoomInfo.AsObject;
  static toObject(includeInstance: boolean, msg: RoomInfo): RoomInfo.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: RoomInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RoomInfo;
  static deserializeBinaryFromReader(message: RoomInfo, reader: jspb.BinaryReader): RoomInfo;
}

export namespace RoomInfo {
  export type AsObject = {
    ante: number,
    smallBlind: number,
    scheduleStartTime: number,
    schedulePlayDuration: number,
    startTime: number,
    currentMinRate: number,
    currentMaxRate: number,
    limitIp: boolean,
    limitGps: boolean,
    insurance: boolean,
    limitPoolRateAllLv: boolean,
    limitMinPoolRate: number,
    limitRetainMinRate: number,
    limitTotalHandNumAllLv: boolean,
    limitTotalHandNum: number,
    delaySeeCard: boolean,
    straddle: boolean,
    opDuration: number,
    retainType: RoomInfo.RetainTypeMap[keyof RoomInfo.RetainTypeMap],
    muck: boolean,
    uniqueId: string,
    isAgreeSecondPcs: boolean,
  }

  export interface RetainTypeMap {
    RT_DISABLE: 0;
    RT_AUTO: 1;
    RT_MANUAL: 2;
  }

  export const RetainType: RetainTypeMap;
}

export class HandInfo extends jspb.Message {
  getHandNum(): number;
  setHandNum(value: number): void;

  getBuSeatId(): number;
  setBuSeatId(value: number): void;

  getSbSeatId(): number;
  setSbSeatId(value: number): void;

  getBbSeatId(): number;
  setBbSeatId(value: number): void;

  clearPublicCardsList(): void;
  getPublicCardsList(): Array<number>;
  setPublicCardsList(value: Array<number>): void;
  addPublicCards(value: number, index?: number): number;

  getAllBet(): number;
  setAllBet(value: number): void;

  clearPotsList(): void;
  getPotsList(): Array<SidePot>;
  setPotsList(value: Array<SidePot>): void;
  addPots(value?: SidePot, index?: number): SidePot;

  getRoundBet(): number;
  setRoundBet(value: number): void;

  getInsurancePool(): number;
  setInsurancePool(value: number): void;

  clearExtPublicCardsList(): void;
  getExtPublicCardsList(): Array<number>;
  setExtPublicCardsList(value: Array<number>): void;
  addExtPublicCards(value: number, index?: number): number;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HandInfo.AsObject;
  static toObject(includeInstance: boolean, msg: HandInfo): HandInfo.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: HandInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HandInfo;
  static deserializeBinaryFromReader(message: HandInfo, reader: jspb.BinaryReader): HandInfo;
}

export namespace HandInfo {
  export type AsObject = {
    handNum: number,
    buSeatId: number,
    sbSeatId: number,
    bbSeatId: number,
    publicCardsList: Array<number>,
    allBet: number,
    potsList: Array<SidePot.AsObject>,
    roundBet: number,
    insurancePool: number,
    extPublicCardsList: Array<number>,
  }
}

export class MTTInfo extends jspb.Message {
  getUpBlindInterval(): number;
  setUpBlindInterval(value: number): void;

  getBlindType(): number;
  setBlindType(value: number): void;

  getRebuyTimes(): number;
  setRebuyTimes(value: number): void;

  getMaxRebuyBlindLevel(): number;
  setMaxRebuyBlindLevel(value: number): void;

  getRebuyScore(): number;
  setRebuyScore(value: number): void;

  getAddOn(): boolean;
  setAddOn(value: boolean): void;

  getStartAddOnBlindLevel(): number;
  setStartAddOnBlindLevel(value: number): void;

  getEndAddOnBlindLevel(): number;
  setEndAddOnBlindLevel(value: number): void;

  getAddOnScore(): number;
  setAddOnScore(value: number): void;

  getHuntMode(): boolean;
  setHuntMode(value: boolean): void;

  getHunterBonus(): number;
  setHunterBonus(value: number): void;

  getHunterFee(): number;
  setHunterFee(value: number): void;

  getPoolFee(): number;
  setPoolFee(value: number): void;

  getServiceFee(): number;
  setServiceFee(value: number): void;

  getPartialBringIn(): boolean;
  setPartialBringIn(value: boolean): void;

  getMoneySync(): boolean;
  setMoneySync(value: boolean): void;

  getPartialBringInReturnBlindLevel(): number;
  setPartialBringInReturnBlindLevel(value: number): void;

  getBuyPropId(): number;
  setBuyPropId(value: number): void;

  getPropBuyType(): Def.MTTPropBuyTypeMap[keyof Def.MTTPropBuyTypeMap];
  setPropBuyType(value: Def.MTTPropBuyTypeMap[keyof Def.MTTPropBuyTypeMap]): void;

  getAddOnPlusMode1(): boolean;
  setAddOnPlusMode1(value: boolean): void;

  getAddOnPlusMode1Limit(): number;
  setAddOnPlusMode1Limit(value: number): void;

  getAddOnPlusMode1MaxTimes(): number;
  setAddOnPlusMode1MaxTimes(value: number): void;

  getAddOnPlusMode2(): boolean;
  setAddOnPlusMode2(value: boolean): void;

  getAddOnPlusMode2EndBl(): number;
  setAddOnPlusMode2EndBl(value: number): void;

  getAddOnPlusMode2MaxTimes(): number;
  setAddOnPlusMode2MaxTimes(value: number): void;

  getBuyRatio(): number;
  setBuyRatio(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MTTInfo.AsObject;
  static toObject(includeInstance: boolean, msg: MTTInfo): MTTInfo.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: MTTInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MTTInfo;
  static deserializeBinaryFromReader(message: MTTInfo, reader: jspb.BinaryReader): MTTInfo;
}

export namespace MTTInfo {
  export type AsObject = {
    upBlindInterval: number,
    blindType: number,
    rebuyTimes: number,
    maxRebuyBlindLevel: number,
    rebuyScore: number,
    addOn: boolean,
    startAddOnBlindLevel: number,
    endAddOnBlindLevel: number,
    addOnScore: number,
    huntMode: boolean,
    hunterBonus: number,
    hunterFee: number,
    poolFee: number,
    serviceFee: number,
    partialBringIn: boolean,
    moneySync: boolean,
    partialBringInReturnBlindLevel: number,
    buyPropId: number,
    propBuyType: Def.MTTPropBuyTypeMap[keyof Def.MTTPropBuyTypeMap],
    addOnPlusMode1: boolean,
    addOnPlusMode1Limit: number,
    addOnPlusMode1MaxTimes: number,
    addOnPlusMode2: boolean,
    addOnPlusMode2EndBl: number,
    addOnPlusMode2MaxTimes: number,
    buyRatio: number,
  }
}

export class MTTProgress extends jspb.Message {
  getUpBlindLeftTime(): number;
  setUpBlindLeftTime(value: number): void;

  getNextAnte(): number;
  setNextAnte(value: number): void;

  getNextSmallBlind(): number;
  setNextSmallBlind(value: number): void;

  getStartCountDown(): number;
  setStartCountDown(value: number): void;

  getBlindLevel(): number;
  setBlindLevel(value: number): void;

  getCanAddOn(): boolean;
  setCanAddOn(value: boolean): void;

  getAddonMode(): Def.AddOnModeMap[keyof Def.AddOnModeMap];
  setAddonMode(value: Def.AddOnModeMap[keyof Def.AddOnModeMap]): void;

  getIsBubbleWait(): boolean;
  setIsBubbleWait(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MTTProgress.AsObject;
  static toObject(includeInstance: boolean, msg: MTTProgress): MTTProgress.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: MTTProgress, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MTTProgress;
  static deserializeBinaryFromReader(message: MTTProgress, reader: jspb.BinaryReader): MTTProgress;
}

export namespace MTTProgress {
  export type AsObject = {
    upBlindLeftTime: number,
    nextAnte: number,
    nextSmallBlind: number,
    startCountDown: number,
    blindLevel: number,
    canAddOn: boolean,
    addonMode: Def.AddOnModeMap[keyof Def.AddOnModeMap],
    isBubbleWait: boolean,
  }
}

export class MyGameInfo extends jspb.Message {
  getChip(): number;
  setChip(value: number): void;

  getSeatId(): number;
  setSeatId(value: number): void;

  getMttCurrentRank(): number;
  setMttCurrentRank(value: number): void;

  getRebuyTimes(): number;
  setRebuyTimes(value: number): void;

  getAddon(): boolean;
  setAddon(value: boolean): void;

  getHunterKill(): number;
  setHunterKill(value: number): void;

  getHunterKillAward(): number;
  setHunterKillAward(value: number): void;

  getHunterRank(): number;
  setHunterRank(value: number): void;

  getStoreChips(): number;
  setStoreChips(value: number): void;

  getIsAutoop(): boolean;
  setIsAutoop(value: boolean): void;

  getRoundActioned(): boolean;
  setRoundActioned(value: boolean): void;

  getAddonPlusMode1Times(): number;
  setAddonPlusMode1Times(value: number): void;

  getAddonPlusMode2Times(): number;
  setAddonPlusMode2Times(value: number): void;

  getHunterKillAwardOther(): number;
  setHunterKillAwardOther(value: number): void;

  getHunterHeadValue(): number;
  setHunterHeadValue(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MyGameInfo.AsObject;
  static toObject(includeInstance: boolean, msg: MyGameInfo): MyGameInfo.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: MyGameInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MyGameInfo;
  static deserializeBinaryFromReader(message: MyGameInfo, reader: jspb.BinaryReader): MyGameInfo;
}

export namespace MyGameInfo {
  export type AsObject = {
    chip: number,
    seatId: number,
    mttCurrentRank: number,
    rebuyTimes: number,
    addon: boolean,
    hunterKill: number,
    hunterKillAward: number,
    hunterRank: number,
    storeChips: number,
    isAutoop: boolean,
    roundActioned: boolean,
    addonPlusMode1Times: number,
    addonPlusMode2Times: number,
    hunterKillAwardOther: number,
    hunterHeadValue: number,
  }
}

export class ActionLimit extends jspb.Message {
  getAction(): Def.ActionMap[keyof Def.ActionMap];
  setAction(value: Def.ActionMap[keyof Def.ActionMap]): void;

  getMin(): number;
  setMin(value: number): void;

  getMax(): number;
  setMax(value: number): void;

  getStraddleLevel(): number;
  setStraddleLevel(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ActionLimit.AsObject;
  static toObject(includeInstance: boolean, msg: ActionLimit): ActionLimit.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: ActionLimit, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ActionLimit;
  static deserializeBinaryFromReader(message: ActionLimit, reader: jspb.BinaryReader): ActionLimit;
}

export namespace ActionLimit {
  export type AsObject = {
    action: Def.ActionMap[keyof Def.ActionMap],
    min: number,
    max: number,
    straddleLevel: number,
  }
}

export class ActionShortcutLimit extends jspb.Message {
  getSc(): Def.ActionShortcutMap[keyof Def.ActionShortcutMap];
  setSc(value: Def.ActionShortcutMap[keyof Def.ActionShortcutMap]): void;

  getAmount(): number;
  setAmount(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ActionShortcutLimit.AsObject;
  static toObject(includeInstance: boolean, msg: ActionShortcutLimit): ActionShortcutLimit.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: ActionShortcutLimit, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ActionShortcutLimit;
  static deserializeBinaryFromReader(message: ActionShortcutLimit, reader: jspb.BinaryReader): ActionShortcutLimit;
}

export namespace ActionShortcutLimit {
  export type AsObject = {
    sc: Def.ActionShortcutMap[keyof Def.ActionShortcutMap],
    amount: number,
  }
}

export class SidePot extends jspb.Message {
  getPotId(): number;
  setPotId(value: number): void;

  getAmount(): number;
  setAmount(value: number): void;

  clearSeatIdsList(): void;
  getSeatIdsList(): Array<number>;
  setSeatIdsList(value: Array<number>): void;
  addSeatIds(value: number, index?: number): number;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SidePot.AsObject;
  static toObject(includeInstance: boolean, msg: SidePot): SidePot.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: SidePot, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SidePot;
  static deserializeBinaryFromReader(message: SidePot, reader: jspb.BinaryReader): SidePot;
}

export namespace SidePot {
  export type AsObject = {
    potId: number,
    amount: number,
    seatIdsList: Array<number>,
  }
}

export class InsurancePotLimit extends jspb.Message {
  getPotId(): number;
  setPotId(value: number): void;

  getPotAmount(): number;
  setPotAmount(value: number): void;

  getBet(): number;
  setBet(value: number): void;

  getMax(): number;
  setMax(value: number): void;

  getMin(): number;
  setMin(value: number): void;

  getInsuranced(): number;
  setInsuranced(value: number): void;

  getOuts(): number;
  setOuts(value: number): void;

  clearOutsDetailList(): void;
  getOutsDetailList(): Array<UserOuts>;
  setOutsDetailList(value: Array<UserOuts>): void;
  addOutsDetail(value?: UserOuts, index?: number): UserOuts;

  getPotUserCount(): number;
  setPotUserCount(value: number): void;

  getPotLeaderCount(): number;
  setPotLeaderCount(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InsurancePotLimit.AsObject;
  static toObject(includeInstance: boolean, msg: InsurancePotLimit): InsurancePotLimit.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: InsurancePotLimit, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InsurancePotLimit;
  static deserializeBinaryFromReader(message: InsurancePotLimit, reader: jspb.BinaryReader): InsurancePotLimit;
}

export namespace InsurancePotLimit {
  export type AsObject = {
    potId: number,
    potAmount: number,
    bet: number,
    max: number,
    min: number,
    insuranced: number,
    outs: number,
    outsDetailList: Array<UserOuts.AsObject>,
    potUserCount: number,
    potLeaderCount: number,
  }
}

export class OutsCard extends jspb.Message {
  getCard(): number;
  setCard(value: number): void;

  getIsEqual(): boolean;
  setIsEqual(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OutsCard.AsObject;
  static toObject(includeInstance: boolean, msg: OutsCard): OutsCard.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: OutsCard, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OutsCard;
  static deserializeBinaryFromReader(message: OutsCard, reader: jspb.BinaryReader): OutsCard;
}

export namespace OutsCard {
  export type AsObject = {
    card: number,
    isEqual: boolean,
  }
}

export class UserOuts extends jspb.Message {
  getSeatId(): number;
  setSeatId(value: number): void;

  clearOutsCardsList(): void;
  getOutsCardsList(): Array<OutsCard>;
  setOutsCardsList(value: Array<OutsCard>): void;
  addOutsCards(value?: OutsCard, index?: number): OutsCard;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UserOuts.AsObject;
  static toObject(includeInstance: boolean, msg: UserOuts): UserOuts.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: UserOuts, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UserOuts;
  static deserializeBinaryFromReader(message: UserOuts, reader: jspb.BinaryReader): UserOuts;
}

export namespace UserOuts {
  export type AsObject = {
    seatId: number,
    outsCardsList: Array<OutsCard.AsObject>,
  }
}

export class PotInsuranceBuy extends jspb.Message {
  getRound(): Def.RoundMap[keyof Def.RoundMap];
  setRound(value: Def.RoundMap[keyof Def.RoundMap]): void;

  getPotId(): number;
  setPotId(value: number): void;

  getActiveAmount(): number;
  setActiveAmount(value: number): void;

  clearActiveOutsList(): void;
  getActiveOutsList(): Array<number>;
  setActiveOutsList(value: Array<number>): void;
  addActiveOuts(value: number, index?: number): number;

  getPassiveAmount(): number;
  setPassiveAmount(value: number): void;

  clearPassiveOutsList(): void;
  getPassiveOutsList(): Array<number>;
  setPassiveOutsList(value: Array<number>): void;
  addPassiveOuts(value: number, index?: number): number;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PotInsuranceBuy.AsObject;
  static toObject(includeInstance: boolean, msg: PotInsuranceBuy): PotInsuranceBuy.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: PotInsuranceBuy, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PotInsuranceBuy;
  static deserializeBinaryFromReader(message: PotInsuranceBuy, reader: jspb.BinaryReader): PotInsuranceBuy;
}

export namespace PotInsuranceBuy {
  export type AsObject = {
    round: Def.RoundMap[keyof Def.RoundMap],
    potId: number,
    activeAmount: number,
    activeOutsList: Array<number>,
    passiveAmount: number,
    passiveOutsList: Array<number>,
  }
}

export class PlayerCards extends jspb.Message {
  getSeatId(): number;
  setSeatId(value: number): void;

  clearCardsList(): void;
  getCardsList(): Array<number>;
  setCardsList(value: Array<number>): void;
  addCards(value: number, index?: number): number;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PlayerCards.AsObject;
  static toObject(includeInstance: boolean, msg: PlayerCards): PlayerCards.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: PlayerCards, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PlayerCards;
  static deserializeBinaryFromReader(message: PlayerCards, reader: jspb.BinaryReader): PlayerCards;
}

export namespace PlayerCards {
  export type AsObject = {
    seatId: number,
    cardsList: Array<number>,
  }
}

export class PlayerStartInfo extends jspb.Message {
  getSeatId(): number;
  setSeatId(value: number): void;

  clearCardsList(): void;
  getCardsList(): Array<number>;
  setCardsList(value: Array<number>): void;
  addCards(value: number, index?: number): number;

  getAnte(): number;
  setAnte(value: number): void;

  getAction(): Def.ActionMap[keyof Def.ActionMap];
  setAction(value: Def.ActionMap[keyof Def.ActionMap]): void;

  getRoundBet(): number;
  setRoundBet(value: number): void;

  getChip(): number;
  setChip(value: number): void;

  getStoreChips(): number;
  setStoreChips(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PlayerStartInfo.AsObject;
  static toObject(includeInstance: boolean, msg: PlayerStartInfo): PlayerStartInfo.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: PlayerStartInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PlayerStartInfo;
  static deserializeBinaryFromReader(message: PlayerStartInfo, reader: jspb.BinaryReader): PlayerStartInfo;
}

export namespace PlayerStartInfo {
  export type AsObject = {
    seatId: number,
    cardsList: Array<number>,
    ante: number,
    action: Def.ActionMap[keyof Def.ActionMap],
    roundBet: number,
    chip: number,
    storeChips: number,
  }
}

export class GPS extends jspb.Message {
  getLongitude(): string;
  setLongitude(value: string): void;

  getLatitude(): string;
  setLatitude(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GPS.AsObject;
  static toObject(includeInstance: boolean, msg: GPS): GPS.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: GPS, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GPS;
  static deserializeBinaryFromReader(message: GPS, reader: jspb.BinaryReader): GPS;
}

export namespace GPS {
  export type AsObject = {
    longitude: string,
    latitude: string,
  }
}

export class Player extends jspb.Message {
  getSeatId(): number;
  setSeatId(value: number): void;

  getUserRid(): number;
  setUserRid(value: number): void;

  getAction(): Def.ActionMap[keyof Def.ActionMap];
  setAction(value: Def.ActionMap[keyof Def.ActionMap]): void;

  clearCardsList(): void;
  getCardsList(): Array<number>;
  setCardsList(value: Array<number>): void;
  addCards(value: number, index?: number): number;

  getName(): string;
  setName(value: string): void;

  getAvatar(): string;
  setAvatar(value: string): void;

  getSex(): number;
  setSex(value: number): void;

  getChip(): number;
  setChip(value: number): void;

  getHandBet(): number;
  setHandBet(value: number): void;

  getRoundBet(): number;
  setRoundBet(value: number): void;

  getStatus(): Def.CanPlayStatusMap[keyof Def.CanPlayStatusMap];
  setStatus(value: Def.CanPlayStatusMap[keyof Def.CanPlayStatusMap]): void;

  getKeepSeatLeftTime(): number;
  setKeepSeatLeftTime(value: number): void;

  getBuyInsuranceStep(): number;
  setBuyInsuranceStep(value: number): void;

  clearBuyInsuranceList(): void;
  getBuyInsuranceList(): Array<PotInsuranceBuy>;
  setBuyInsuranceList(value: Array<PotInsuranceBuy>): void;
  addBuyInsurance(value?: PotInsuranceBuy, index?: number): PotInsuranceBuy;

  getIsAutoop(): boolean;
  setIsAutoop(value: boolean): void;

  getRoundActioned(): boolean;
  setRoundActioned(value: boolean): void;

  getHunterKill(): number;
  setHunterKill(value: number): void;

  getHunterKillAward(): number;
  setHunterKillAward(value: number): void;

  getHunterKillAwardOther(): number;
  setHunterKillAwardOther(value: number): void;

  getHunterHeadValue(): number;
  setHunterHeadValue(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Player.AsObject;
  static toObject(includeInstance: boolean, msg: Player): Player.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: Player, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Player;
  static deserializeBinaryFromReader(message: Player, reader: jspb.BinaryReader): Player;
}

export namespace Player {
  export type AsObject = {
    seatId: number,
    userRid: number,
    action: Def.ActionMap[keyof Def.ActionMap],
    cardsList: Array<number>,
    name: string,
    avatar: string,
    sex: number,
    chip: number,
    handBet: number,
    roundBet: number,
    status: Def.CanPlayStatusMap[keyof Def.CanPlayStatusMap],
    keepSeatLeftTime: number,
    buyInsuranceStep: number,
    buyInsuranceList: Array<PotInsuranceBuy.AsObject>,
    isAutoop: boolean,
    roundActioned: boolean,
    hunterKill: number,
    hunterKillAward: number,
    hunterKillAwardOther: number,
    hunterHeadValue: number,
  }
}

export class Result extends jspb.Message {
  getSeatId(): number;
  setSeatId(value: number): void;

  getWin(): number;
  setWin(value: number): void;

  getHandValueType(): number;
  setHandValueType(value: number): void;

  clearWinCardsList(): void;
  getWinCardsList(): Array<WinCard>;
  setWinCardsList(value: Array<WinCard>): void;
  addWinCards(value?: WinCard, index?: number): WinCard;

  clearMyCardsList(): void;
  getMyCardsList(): Array<number>;
  setMyCardsList(value: Array<number>): void;
  addMyCards(value: number, index?: number): number;

  getChip(): number;
  setChip(value: number): void;

  getInsurance(): number;
  setInsurance(value: number): void;

  getInsuranceWin(): number;
  setInsuranceWin(value: number): void;

  getFee(): number;
  setFee(value: number): void;

  getMttHunterKillPlus(): number;
  setMttHunterKillPlus(value: number): void;

  getMttHunterKill(): number;
  setMttHunterKill(value: number): void;

  getMttHunterKillAward(): number;
  setMttHunterKillAward(value: number): void;

  getHandBet(): number;
  setHandBet(value: number): void;

  getStoreChips(): number;
  setStoreChips(value: number): void;

  getMttHunterKillAwardPlus(): number;
  setMttHunterKillAwardPlus(value: number): void;

  getMuck(): boolean;
  setMuck(value: boolean): void;

  getHandValueType2(): number;
  setHandValueType2(value: number): void;

  clearWinCards2List(): void;
  getWinCards2List(): Array<WinCard>;
  setWinCards2List(value: Array<WinCard>): void;
  addWinCards2(value?: WinCard, index?: number): WinCard;

  clearSplitResultsList(): void;
  getSplitResultsList(): Array<SplitedResult>;
  setSplitResultsList(value: Array<SplitedResult>): void;
  addSplitResults(value?: SplitedResult, index?: number): SplitedResult;

  getMttHunterKillAwardOther(): number;
  setMttHunterKillAwardOther(value: number): void;

  getMttHunterKillAwardOtherPlus(): number;
  setMttHunterKillAwardOtherPlus(value: number): void;

  getStandUp(): boolean;
  setStandUp(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Result.AsObject;
  static toObject(includeInstance: boolean, msg: Result): Result.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: Result, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Result;
  static deserializeBinaryFromReader(message: Result, reader: jspb.BinaryReader): Result;
}

export namespace Result {
  export type AsObject = {
    seatId: number,
    win: number,
    handValueType: number,
    winCardsList: Array<WinCard.AsObject>,
    myCardsList: Array<number>,
    chip: number,
    insurance: number,
    insuranceWin: number,
    fee: number,
    mttHunterKillPlus: number,
    mttHunterKill: number,
    mttHunterKillAward: number,
    handBet: number,
    storeChips: number,
    mttHunterKillAwardPlus: number,
    muck: boolean,
    handValueType2: number,
    winCards2List: Array<WinCard.AsObject>,
    splitResultsList: Array<SplitedResult.AsObject>,
    mttHunterKillAwardOther: number,
    mttHunterKillAwardOtherPlus: number,
    standUp: boolean,
  }
}

export class SplitedResult extends jspb.Message {
  getWin(): number;
  setWin(value: number): void;

  getIsWinner(): boolean;
  setIsWinner(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SplitedResult.AsObject;
  static toObject(includeInstance: boolean, msg: SplitedResult): SplitedResult.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: SplitedResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SplitedResult;
  static deserializeBinaryFromReader(message: SplitedResult, reader: jspb.BinaryReader): SplitedResult;
}

export namespace SplitedResult {
  export type AsObject = {
    win: number,
    isWinner: boolean,
  }
}

export class WinCard extends jspb.Message {
  getCard(): number;
  setCard(value: number): void;

  getIsPublic(): boolean;
  setIsPublic(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WinCard.AsObject;
  static toObject(includeInstance: boolean, msg: WinCard): WinCard.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: WinCard, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WinCard;
  static deserializeBinaryFromReader(message: WinCard, reader: jspb.BinaryReader): WinCard;
}

export namespace WinCard {
  export type AsObject = {
    card: number,
    isPublic: boolean,
  }
}

export class PostStatusChange extends jspb.Message {
  getSeatId(): number;
  setSeatId(value: number): void;

  getOldPostStatus(): Def.CanPlayStatusMap[keyof Def.CanPlayStatusMap];
  setOldPostStatus(value: Def.CanPlayStatusMap[keyof Def.CanPlayStatusMap]): void;

  getCurrentPostStatus(): Def.CanPlayStatusMap[keyof Def.CanPlayStatusMap];
  setCurrentPostStatus(value: Def.CanPlayStatusMap[keyof Def.CanPlayStatusMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PostStatusChange.AsObject;
  static toObject(includeInstance: boolean, msg: PostStatusChange): PostStatusChange.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: PostStatusChange, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PostStatusChange;
  static deserializeBinaryFromReader(message: PostStatusChange, reader: jspb.BinaryReader): PostStatusChange;
}

export namespace PostStatusChange {
  export type AsObject = {
    seatId: number,
    oldPostStatus: Def.CanPlayStatusMap[keyof Def.CanPlayStatusMap],
    currentPostStatus: Def.CanPlayStatusMap[keyof Def.CanPlayStatusMap],
  }
}

export class PlayerChipChange extends jspb.Message {
  getSeatId(): number;
  setSeatId(value: number): void;

  getChange(): number;
  setChange(value: number): void;

  getChips(): number;
  setChips(value: number): void;

  getStoreChips(): number;
  setStoreChips(value: number): void;

  getAuto(): boolean;
  setAuto(value: boolean): void;

  getReason(): Def.ChipChangeReasonMap[keyof Def.ChipChangeReasonMap];
  setReason(value: Def.ChipChangeReasonMap[keyof Def.ChipChangeReasonMap]): void;

  getMttHunterHeadPlus(): number;
  setMttHunterHeadPlus(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PlayerChipChange.AsObject;
  static toObject(includeInstance: boolean, msg: PlayerChipChange): PlayerChipChange.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: PlayerChipChange, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PlayerChipChange;
  static deserializeBinaryFromReader(message: PlayerChipChange, reader: jspb.BinaryReader): PlayerChipChange;
}

export namespace PlayerChipChange {
  export type AsObject = {
    seatId: number,
    change: number,
    chips: number,
    storeChips: number,
    auto: boolean,
    reason: Def.ChipChangeReasonMap[keyof Def.ChipChangeReasonMap],
    mttHunterHeadPlus: number,
  }
}

export class Roomer extends jspb.Message {
  getUserRid(): number;
  setUserRid(value: number): void;

  getName(): string;
  setName(value: string): void;

  getAvatar(): string;
  setAvatar(value: string): void;

  getSex(): number;
  setSex(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Roomer.AsObject;
  static toObject(includeInstance: boolean, msg: Roomer): Roomer.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: Roomer, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Roomer;
  static deserializeBinaryFromReader(message: Roomer, reader: jspb.BinaryReader): Roomer;
}

export namespace Roomer {
  export type AsObject = {
    userRid: number,
    name: string,
    avatar: string,
    sex: number,
  }
}

export class PlayerSummary extends jspb.Message {
  getUserRid(): number;
  setUserRid(value: number): void;

  getName(): string;
  setName(value: string): void;

  getAvatar(): string;
  setAvatar(value: string): void;

  getSex(): number;
  setSex(value: number): void;

  getHandNum(): number;
  setHandNum(value: number): void;

  getBringInTotal(): number;
  setBringInTotal(value: number): void;

  getBringOutTotal(): number;
  setBringOutTotal(value: number): void;

  getChip(): number;
  setChip(value: number): void;

  getWin(): number;
  setWin(value: number): void;

  getStatus(): Def.CanPlayStatusMap[keyof Def.CanPlayStatusMap];
  setStatus(value: Def.CanPlayStatusMap[keyof Def.CanPlayStatusMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PlayerSummary.AsObject;
  static toObject(includeInstance: boolean, msg: PlayerSummary): PlayerSummary.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: PlayerSummary, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PlayerSummary;
  static deserializeBinaryFromReader(message: PlayerSummary, reader: jspb.BinaryReader): PlayerSummary;
}

export namespace PlayerSummary {
  export type AsObject = {
    userRid: number,
    name: string,
    avatar: string,
    sex: number,
    handNum: number,
    bringInTotal: number,
    bringOutTotal: number,
    chip: number,
    win: number,
    status: Def.CanPlayStatusMap[keyof Def.CanPlayStatusMap],
  }
}

