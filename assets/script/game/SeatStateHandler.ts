import { StateHandler } from "../statemachine/StateHandler";
import Seat from "./Seat";
import { SeatFSM } from "./SeatFSM";


export class SeatEmpty extends StateHandler {

    public Name: string = "SeatEmpty";

    private static _Instance: SeatEmpty = null;

    public static get Instance() {
        return this._Instance ??= new SeatEmpty;
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
        return this._Instance ??= new SeatIdle;
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
        return this._Instance ??= new SeatSitAnimation;
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
        return this._Instance ??= new SeatSit;
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
        return this._Instance ??= new SeatWaitStart;
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
        return this._Instance ??= new SeatWaitBlind;
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