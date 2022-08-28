import { StateHandler } from "../statemachine/StateHandler";
import { SeatFSM } from "./SeatFSM";


export class SeatEmpty extends StateHandler {

    public Name: string = "SeatEmpty";

    private static _Instance: SeatEmpty = null;

    public static get Instance() {
        return this._Instance ||= new SeatEmpty();
    }
    public Enter(entity?: any) {
        super.Enter(entity);
        if (entity instanceof SeatFSM) entity.EmptyEnter();
    }

    public Execute(entity?: any) {
        super.Execute(entity);
        if (entity instanceof SeatFSM) entity.EmptyExecute();
    }

    public Exit(entity?: any) {
        super.Exit(entity);
        if (entity instanceof SeatFSM) entity.EmptyExit();
    }

}





export class SeatIdle extends StateHandler {

    public Name: string = "SeatIdle";

    private static _Instance: SeatIdle = null;

    public static get Instance() {
        return this._Instance ||= new SeatIdle();
    }
    public Enter(entity?: any) {
        super.Enter(entity);
        if (entity instanceof SeatFSM) entity.IdleEnter();
    }

    public Execute(entity?: any) {
        super.Execute(entity);
        if (entity instanceof SeatFSM) entity.IdleExecute();
    }

    public Exit(entity?: any) {
        super.Exit(entity);
        if (entity instanceof SeatFSM) entity.IdleExit();
    }

}


export class SeatSitAnimation extends StateHandler {

    public Name: string = "SeatSitAnimation";

    private static _Instance: SeatSitAnimation = null;

    public static get Instance() {
        return this._Instance ||= new SeatSitAnimation();
    }
    public Enter(entity?: any) {
        super.Enter(entity);
        if (entity instanceof SeatFSM) entity.SitAnimationEnter();
    }

    public Execute(entity?: any) {
        super.Execute(entity);
        if (entity instanceof SeatFSM) entity.SitAnimationExecute();
    }

    public Exit(entity?: any) {
        super.Exit(entity);
        if (entity instanceof SeatFSM) entity.SitAnimationExit();
    }

}

export class SeatSit extends StateHandler {
    public Name: string = "SeatSit";

    private static _Instance: SeatSit = null;

    public static get Instance() {
        return this._Instance ||= new SeatSit();
    }
    public Enter(entity?: any) {
        super.Enter(entity);
        if (entity instanceof SeatFSM) entity.SitEnter();
    }

    public Execute(entity?: any) {
        super.Execute(entity);
        if (entity instanceof SeatFSM) entity.SitExecute();
    }

    public Exit(entity?: any) {
        super.Exit(entity);
        if (entity instanceof SeatFSM) entity.SitExit();
    }
}
export class SeatWaitStart extends StateHandler {
    public Name: string = "SeatWaitStart";

    private static _Instance: SeatWaitStart = null;

    public static get Instance() {
        return this._Instance ||= new SeatWaitStart();
    }
    public Enter(entity?: any) {
        super.Enter(entity);
        if (entity instanceof SeatFSM) entity.WaitStartEnter();

    }

    public Execute(entity?: any) {
        super.Execute(entity);
        if (entity instanceof SeatFSM) entity.WaitStartExecute();

    }

    public Exit(entity?: any) {
        super.Exit(entity);
        if (entity instanceof SeatFSM) entity.WaitStartExit();
    }
}

// 补盲
export class SeatWaitBlind extends StateHandler {

    public Name: string = "SeatWaitBlind";

    private static _Instance: SeatWaitBlind = null;

    public static get Instance() {
        return this._Instance ||= new SeatWaitBlind();
    }
    public Enter(entity?: any) {
        super.Enter(entity);
        if (entity instanceof SeatFSM) entity.WaitBlindEnter();

    }

    public Execute(entity?: any) {
        super.Execute(entity);
        if (entity instanceof SeatFSM) entity.WaitBlindExecute();

    }

    public Exit(entity?: any) {
        super.Exit(entity);
        if (entity instanceof SeatFSM) entity.WaitBlindExit();
    }

}

// 站起动画
export class SeatStandupAnimation extends StateHandler {

    public Name: string = "SeatStandupAnimation";

    private static _Instance: SeatStandupAnimation = null;

    public static get Instance() {
        return this._Instance ||= new SeatStandupAnimation();
    }
    public Enter(entity?: any) {
        super.Enter(entity);
        if (entity instanceof SeatFSM) entity.StandupAnimationEnter();

    }

    public Execute(entity?: any) {
        super.Execute(entity);
        if (entity instanceof SeatFSM) entity.StandupAnimationExecute();

    }

    public Exit(entity?: any) {
        super.Exit(entity);
        if (entity instanceof SeatFSM) entity.StandupAnimationExit();
    }
}


//站起
export class SeatStandup extends StateHandler {

    public Name: string = "SeatStandup";

    private static _Instance: SeatStandup = null;

    public static get Instance() {
        return this._Instance ||= new SeatStandup();
    }
    public Enter(entity?: any) {
        super.Enter(entity);
        if (entity instanceof SeatFSM) entity.StandupEnter();

    }

    public Execute(entity?: any) {
        super.Execute(entity);
        if (entity instanceof SeatFSM) entity.StandupExecute();

    }

    public Exit(entity?: any) {
        super.Exit(entity);
        if (entity instanceof SeatFSM) entity.StandupExit();
    }
}
//每手开始
export class SeatStart extends StateHandler {

    public Name: string = "SeatStart";

    private static _Instance: SeatStart = null;

    public static get Instance() {
        return this._Instance ||= new SeatStart();
    }
    public Enter(entity?: any) {
        super.Enter(entity);
        if (entity instanceof SeatFSM) entity.StartEnter();

    }

    public Execute(entity?: any) {
        super.Execute(entity);
        if (entity instanceof SeatFSM) entity.StartExecute();

    }

    public Exit(entity?: any) {
        super.Exit(entity);
        if (entity instanceof SeatFSM) entity.StartExit();
    }
}
//抓
export class SeatStraddle extends StateHandler {

    public Name: string = "SeatStraddle";

    private static _Instance: SeatStraddle = null;

    public static get Instance() {
        return this._Instance ||= new SeatStraddle();
    }
    public Enter(entity?: any) {
        super.Enter(entity);
        if (entity instanceof SeatFSM) entity.StraddleEnter();

    }

    public Execute(entity?: any) {
        super.Execute(entity);
        if (entity instanceof SeatFSM) entity.StraddleExecute();

    }

    public Exit(entity?: any) {
        super.Exit(entity);
        if (entity instanceof SeatFSM) entity.StraddleExit();
    }
}
