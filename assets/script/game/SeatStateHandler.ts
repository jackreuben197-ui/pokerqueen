import { StateHandler } from "../statemachine/StateHandler";
import Seat from "./Seat";
import { SeatFSM } from "./SeatFSM";

export class SeatSitAnimation extends StateHandler {

    public Name: string = "SeatSitAnimation";

    private static _Instance: SeatSitAnimation = null;

    public static get Instance() {
        return this._Instance || (this._Instance = new SeatSitAnimation);
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
        return this._Instance || (this._Instance = new SeatSit);
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
        return this._Instance || (this._Instance = new SeatWaitStart);
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