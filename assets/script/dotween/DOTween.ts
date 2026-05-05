export class DOTween {
    static Sequence<T>(target: T): Sequence<T> {
        return new Sequence(target);
    }
}
export type sequence_unit = { t?: Function, duration?: number, args?: any };

export class Sequence<T> {

    private _tween: cc.Tween = null;

    private _sequence: sequence_unit[][] = [];

    private _completeFunc: Function = null;
    private _startFunc: Function = null;

    private _isPlaying: boolean = false;


    private _mainTarget: T = null;

    private _targets: any[] = [];

    private _childCompletes: Function[] = [];

    constructor(target: T) {
        this._tween = cc.tween(this._mainTarget = target);
    }
    AddTarget(target:T) {
        if (!this._targets.includes(target)) this._targets.push(target);
    }
    AddChildComplete(cc: Function) {
        this._childCompletes.push(cc);
    }

    Append(this: Sequence<T>, tFunc: Function, duration: number): Sequence<T> {
        this._sequence.push([{ t: tFunc, duration: duration }]);

        return this;
    }
    Join(this: Sequence<T>, tFunc: Function, duration: number): Sequence<T> {

        let last = this._sequence[this._sequence.length - 1];
        if (last) {
            last.push({ t: tFunc, duration: duration });
        } else {
            this._sequence.push([{ t: tFunc, duration: duration }]);
        }
        return this;
    }
    AppendInterval(this: Sequence<T>, duration: number): Sequence<T> {
        this._sequence.push([{ duration: duration }]);
        return this;
    }

    OnStart(this: Sequence<T>, startFunc: Function): Sequence<T> {
        this._startFunc = startFunc;
        return this;
    }

    Then(this: Sequence<T>, tFunc: Function): Sequence<T> {
        this._sequence.push([{ t: tFunc }]);
        return this;
    }

    OnComplete(this: Sequence<T>, completeFunc: Function): Sequence<T> {
        this._completeFunc = completeFunc;
        return this;
    }

    Play(): Sequence<T> {
        this._startFunc?.();
        for (let i = 0; i < this._sequence.length; i++) {
            let spawn = this._sequence[i];
            let a_obj: sequence_unit = null;
            if (spawn.length == 1) {
                a_obj = spawn[0];
                a_obj.t && this._tween.then(cc.callFunc(() => {
                    a_obj.t();
                }));
                a_obj.duration && this._tween.delay(a_obj.duration);
            } else {
                let duration = 0;
                for (let j = 0; j < spawn.length; j++) {
                    let b_obj = spawn[j];
                    b_obj.t && this._tween.then(cc.callFunc(() => {
                        b_obj.t();
                    }));
                    duration = Math.max(duration, b_obj.duration);
                }
                duration && this._tween.delay(duration);
            }
        }
        this._tween.call(() => {
            this._completeFunc?.();
            this._isPlaying = false;
        }).start();
        this._isPlaying = true;
        return this;
    }
    get IsPlaying() {
        return this._isPlaying;
    }
    Complete(this: Sequence<T>, doCom: boolean = true) {
        this.Kill();
        while (this._childCompletes) {
            let cc = this._childCompletes.shift();
            cc();
        }
        doCom && this._completeFunc?.();
    }
    Kill() {
        while (this._targets.length) {
            let target = this._targets.shift();
            cc.Tween.stopAllByTarget(target);
        }
        cc.Tween.stopAllByTarget(this._mainTarget);
        this._isPlaying = false;
    }
}

