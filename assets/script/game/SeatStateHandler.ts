import { StateHandler } from "../statemachine/StateHandler";
import { SeatFSM } from "./SeatFSM";


export class SeatEmpty extends StateHandler {

    public Name: string = "SeatEmpty";

    static get Instance(): SeatEmpty {
        return (this as any).instance ??= new SeatEmpty;
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

    static get Instance(): SeatIdle {
        return (this as any).instance ??= new SeatIdle;
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

    static get Instance(): SeatSitAnimation {
        return (this as any).instance ??= new SeatSitAnimation;
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

    static get Instance(): SeatSit {
        return (this as any).instance ??= new SeatSit;
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

    static get Instance(): SeatWaitStart {
        return (this as any).instance ??= new SeatWaitStart;
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

    static get Instance(): SeatWaitBlind {
        return (this as any).instance ??= new SeatWaitBlind;
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

    static get Instance(): SeatStandupAnimation {
        return (this as any).instance ??= new SeatStandupAnimation;
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

    static get Instance(): SeatStandup {
        return (this as any).instance ??= new SeatStandup;
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

    static get Instance(): SeatStart {
        return (this as any).instance ??= new SeatStart;
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

    static get Instance(): SeatStraddle {
        return (this as any).instance ??= new SeatStraddle;
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
//开始转游戏中
export class SeatStartToPlaying extends StateHandler {

    public Name: string = "SeatStartToPlaying";

    static get Instance(): SeatStartToPlaying {
        return (this as any).instance ??= new SeatStartToPlaying;
    }
    public Enter(entity?: any) {
        super.Enter(entity);
        if (entity instanceof SeatFSM) entity.StartToPlayingEnter();

    }

    public Execute(entity?: any) {
        super.Execute(entity);
        if (entity instanceof SeatFSM) entity.StartToPlayingExecute();

    }

    public Exit(entity?: any) {
        super.Exit(entity);
        if (entity instanceof SeatFSM) entity.StartToPlayingExit();
    }
}

//操作中
export class SeatOperation extends StateHandler {

    public Name: string = "SeatOperation";

    static get Instance(): SeatOperation {
        return (this as any).instance ??= new SeatOperation;
    }
    public Enter(entity?: any) {
        super.Enter(entity);
        if (entity instanceof SeatFSM) entity.OperationEnter();

    }

    public Execute(entity?: any, dt?: number) {
        super.Execute(entity);
        if (entity instanceof SeatFSM) entity.OperationExecute(dt);

    }

    public Exit(entity?: any) {
        super.Exit(entity);
        if (entity instanceof SeatFSM) entity.OperationExit();
    }
}


//
export class SeatInsuranc extends StateHandler {

    public Name: string = "SeatInsuranc";

    static get Instance(): SeatInsuranc {
        return (this as any).instance ??= new SeatInsuranc;
    }
    public Enter(entity?: any) {
        super.Enter(entity);
        if (entity instanceof SeatFSM) entity.InsuranceEnter();

    }

    public Execute(entity?: any) {
        super.Execute(entity);
        if (entity instanceof SeatFSM) entity.InsuranceExecute();

    }

    public Exit(entity?: any) {
        super.Exit(entity);
        if (entity instanceof SeatFSM) entity.InsuranceExit();
    }
}


//
export class SeatWaitOther extends StateHandler {

    public Name: string = "SeatWaitOther";

    static get Instance(): SeatWaitOther {
        return (this as any).instance ??= new SeatWaitOther;
    }
    public Enter(entity?: any) {
        super.Enter(entity);
        if (entity instanceof SeatFSM) entity.WaitOtherEnter();

    }

    public Execute(entity?: any) {
        super.Execute(entity);
        if (entity instanceof SeatFSM) entity.WaitOtherExecute();

    }

    public Exit(entity?: any) {
        super.Exit(entity);
        if (entity instanceof SeatFSM) entity.WaitOtherExit();
    }
}


export class SeatPutChip extends StateHandler {

    public Name: string = "SeatPutChip";

    static get Instance(): SeatPutChip {
        return (this as any).instance ??= new SeatPutChip;
    }
    public Enter(entity?: any) {
        super.Enter(entity);
        if (entity instanceof SeatFSM) entity.PutChipEnter();

    }

    public Execute(entity?: any) {
        super.Execute(entity);
        if (entity instanceof SeatFSM) entity.PutChipExecute();

    }

    public Exit(entity?: any) {
        super.Exit(entity);
        if (entity instanceof SeatFSM) entity.PutChipExit();
    }
}


export class SeatCall extends StateHandler {

    public Name: string = "SeatCall";

    static get Instance(): SeatCall {
        return (this as any).instance ??= new SeatCall;
    }
    public Enter(entity?: any) {
        super.Enter(entity);
        if (entity instanceof SeatFSM) entity.CallEnter();

    }

    public Execute(entity?: any) {
        super.Execute(entity);
        if (entity instanceof SeatFSM) entity.CallExecute();

    }

    public Exit(entity?: any) {
        super.Exit(entity);
        if (entity instanceof SeatFSM) entity.CallExit();
    }
}

export class SeatRaise extends StateHandler {

    public Name: string = "SeatRaise";

    static get Instance(): SeatRaise {
        return (this as any).instance ??= new SeatRaise;
    }
    public Enter(entity?: any) {
        super.Enter(entity);
        if (entity instanceof SeatFSM) entity.RaiseEnter();

    }

    public Execute(entity?: any) {
        super.Execute(entity);
        if (entity instanceof SeatFSM) entity.RaiseExecute();

    }

    public Exit(entity?: any) {
        super.Exit(entity);
        if (entity instanceof SeatFSM) entity.RaiseExit();
    }
}


export class SeatAllin extends StateHandler {

    public Name: string = "SeatAllin";

    static get Instance(): SeatAllin {
        return (this as any).instance ??= new SeatAllin;
    }
    public Enter(entity?: any) {
        super.Enter(entity);
        if (entity instanceof SeatFSM) entity.AllinEnter();

    }

    public Execute(entity?: any) {
        super.Execute(entity);
        if (entity instanceof SeatFSM) entity.AllinExecute();

    }

    public Exit(entity?: any) {
        super.Exit(entity);
        if (entity instanceof SeatFSM) entity.AllinExit();
    }
}



export class SeatCheck extends StateHandler {

    public Name: string = "SeatCheck";

    static get Instance(): SeatCheck {
        return (this as any).instance ??= new SeatCheck;
    }
    public Enter(entity?: any) {
        super.Enter(entity);
        if (entity instanceof SeatFSM) entity.CheckEnter();

    }

    public Execute(entity?: any) {
        super.Execute(entity);
        if (entity instanceof SeatFSM) entity.CheckExecute();

    }

    public Exit(entity?: any) {
        super.Exit(entity);
        if (entity instanceof SeatFSM) entity.CheckExit();
    }
}

export class SeatFold extends StateHandler {

    public Name: string = "SeatFold";

    static get Instance(): SeatFold {
        return (this as any).instance ??= new SeatFold;
    }
    public Enter(entity?: any) {
        super.Enter(entity);
        if (entity instanceof SeatFSM) entity.FoldEnter();

    }

    public Execute(entity?: any) {
        super.Execute(entity);
        if (entity instanceof SeatFSM) entity.FoldExecute();

    }

    public Exit(entity?: any) {
        super.Exit(entity);
        if (entity instanceof SeatFSM) entity.FoldExit();
    }
}
export class SeatRoundEnd extends StateHandler {

    public Name: string = "SeatRoundEnd";

    static get Instance(): SeatRoundEnd {
        return (this as any).instance ??= new SeatRoundEnd;
    }
    public Enter(entity?: any) {
        super.Enter(entity);
        if (entity instanceof SeatFSM) entity.RoundEndEnter();

    }

    public Execute(entity?: any) {
        super.Execute(entity);
        if (entity instanceof SeatFSM) entity.RoundEndExecute();

    }

    public Exit(entity?: any) {
        super.Exit(entity);
        if (entity instanceof SeatFSM) entity.RoundEndExit();
    }
}
export class SeatKeep extends StateHandler {

    public Name: string = "SeatKeep";

    static get Instance(): SeatKeep {
        return (this as any).instance ??= new SeatKeep;
    }
    public Enter(entity?: any) {
        super.Enter(entity);
        if (entity instanceof SeatFSM) entity.KeepEnter();

    }

    public Execute(entity?: any) {
        super.Execute(entity);
        if (entity instanceof SeatFSM) entity.KeepExecute();

    }

    public Exit(entity?: any) {
        super.Exit(entity);
        if (entity instanceof SeatFSM) entity.KeepExit();
    }
}


