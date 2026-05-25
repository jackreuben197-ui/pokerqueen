const { ccclass, property, menu } = cc._decorator;

/**
 * startTimer 的命名参数接口定义
 */
export interface ITimerOptions {
    totalTime: number;                  // 倒计时总时长（秒）
    stepInterval?: number;              // 步长回调间隔（秒），不传或传 0 则完全关闭
    elapsedTime?: number;               // 已经走过的时间（秒），默认 0
    onComplete?: () => void;            // 结束回调
    onStep?: (remainingTime: number) => void; // 步长回调
}

function generateDefaultCirclePoints(): cc.Vec2[] {
    const pts: cc.Vec2[] = [];
    const count = 24;
    for (let i = 0; i < count; i++) {
        let angle = 90 - (i / count) * 360;
        let radian = angle * Math.PI / 180;
        let x = Math.round(Math.cos(radian) * 50 * 100) / 100;
        let y = Math.round(Math.sin(radian) * 50 * 100) / 100;
        pts.push(new cc.Vec2(x, y));
    }
    return pts;
}

@ccclass
@menu('CrazyPoker/Common/ShiningPathTimer')
export default class ShiningPathTimer extends cc.Component {

    @property(cc.Sprite)
    public progressBar: cc.Sprite = null; 

    @property(cc.Node)
    public handle: cc.Node = null;        

    @property({
        type: [cc.Vec2],
        tooltip: "标准 100x100 空间内的控制点。"
    })
    public standardPoints: cc.Vec2[] = generateDefaultCirclePoints();

    @property({
        type: cc.Integer,
        tooltip: "指定哪个控制点索引作为起点"
    })
    public startIndex: number = 0;

    private _totalTime: number = 15;
    private _stepInterval: number = 1.0;
    private _currentTime: number = 0;
    private _isCounting: boolean = false;
    
    private _realPoints: cc.Vec2[] = [];
    private _segmentLengths: number[] = [];
    private _totalPathLength: number = 0;
    
    private _pointProgressRatios: number[] = [];
    private _startProgressOffset: number = 0; 

    private _onCompleteCallback: (() => void) = null;
    private _onStepCallback: ((remainingTime: number) => void) = null;
    private _nextStepTriggerTime: number = 0; 

    protected onLoad(): void {
        this.initPathGeometry();
    }

    /**
     * 纯几何打点初始化
     */
    private initPathGeometry(): void {
        if (!this.standardPoints || this.standardPoints.length < 2) return;

        const firstStd = this.standardPoints[0];
        const lastStd = this.standardPoints[this.standardPoints.length - 1];
        if (!firstStd.equals(lastStd)) {
            this.standardPoints.push(cc.v2(firstStd.x, firstStd.y));
        }

        const realWidth = this.node.width;
        const realHeight = this.node.height;
        const scaleX = realWidth / 100;
        const scaleY = realHeight / 100;

        this._realPoints = [];
        for (let i = 0; i < this.standardPoints.length; i++) {
            let stdPt = this.standardPoints[i];
            this._realPoints.push(cc.v2(stdPt.x * scaleX, stdPt.y * scaleY));
        }

        this._segmentLengths = [];
        this._totalPathLength = 0;
        for (let i = 0; i < this._realPoints.length - 1; i++) {
            let dist = this._realPoints[i].sub(this._realPoints[i + 1]).mag();
            this._segmentLengths.push(dist);
            this._totalPathLength += dist;
        }

        this._pointProgressRatios = [0];
        let accumulatedLength = 0;
        for (let i = 0; i < this._segmentLengths.length; i++) {
            accumulatedLength += this._segmentLengths[i];
            this._pointProgressRatios.push(accumulatedLength / this._totalPathLength);
        }

        if (this.startIndex < 0 || this.startIndex >= this._pointProgressRatios.length) {
            this.startIndex = 0;
        }
        this._startProgressOffset = this._pointProgressRatios[this.startIndex];

        if (this.progressBar) {
            this.progressBar.fillStart = 0; 
        }
    }

    /**
     * 开启路径倒计时入口
     */
    public startTimer(options: ITimerOptions): void {
        if (this._realPoints.length < 2) return;

        const totalTime = options.totalTime;
        const elapsedTime = options.elapsedTime !== undefined ? options.elapsedTime : 0;
        const stepInterval = options.stepInterval !== undefined ? options.stepInterval : 0;

        if (elapsedTime >= totalTime) {
            if (this.progressBar) this.progressBar.fillRange = 0;
            if (options.onComplete) options.onComplete();
            return;
        }

        this._totalTime = totalTime;
        this._currentTime = totalTime - elapsedTime;
        this._stepInterval = stepInterval;
        this._onCompleteCallback = options.onComplete || null;
        this._onStepCallback = options.onStep || null;
        
        this.resetStepTrigger();
        this._isCounting = true;
        this.updateVisual(this._currentTime / this._totalTime);
    }

    /**
     * 中途延长时间方法
     */
    public extendTime(extendedSeconds: number): void {
        if (!this._isCounting && this._currentTime <= 0) return;

        const newTotalTime = this._currentTime + extendedSeconds;
        this._totalTime = newTotalTime;
        this._currentTime = newTotalTime; 

        this.resetStepTrigger();
        this.updateVisual(1.0);
    }

    private resetStepTrigger(): void {
        if (this._stepInterval > 0 && this._onStepCallback) {
            this._nextStepTriggerTime = Math.floor(this._currentTime / this._stepInterval) * this._stepInterval;
            this._onStepCallback(Math.ceil(this._currentTime));
        } else {
            this._nextStepTriggerTime = -1;
        }
    }

    /**
     * 停止倒计时：立刻停止 update 计数，但画面（小圆点、进度条）死死定格在当前的最新状态。
     */
    public stop(): void {
        this._isCounting = false;
    }

    /**
     * 暂停倒计时：功能与 stop 类似，但语义上用于后续还会通过 resume 恢复的场景。
     */
    public pause(): void {
        this._isCounting = false;
    }

    /**
     * 恢复倒计时：从被 pause 或 stop 锁定的当前时间和位置，继续平滑往下走。
     */
    public resume(): void {
        if (this._isCounting || this._currentTime <= 0) return;
        this._isCounting = true;
    }

    /**
     * 重置并彻底清空计时器：画面归零。
     */
    public reset(): void {
        this._isCounting = false;
        this._currentTime = 0;
        this._onCompleteCallback = null;
        this._onStepCallback = null;
        
        if (this.progressBar) {
            this.progressBar.fillRange = 0;
        }
    }

    protected update(dt: number): void {
        if (!this._isCounting) return;

        this._currentTime -= dt;

        if (this._nextStepTriggerTime >= 0 && this._currentTime <= this._nextStepTriggerTime && this._currentTime > 0) {
            if (this._onStepCallback) {
                this._onStepCallback(Math.ceil(this._currentTime));
            }
            this._nextStepTriggerTime -= this._stepInterval;
        }

        if (this._currentTime <= 0) {
            this._currentTime = 0;
            this._isCounting = false;
            if (this._onCompleteCallback) this._onCompleteCallback();
        }

        this.updateVisual(this._currentTime / this._totalTime);
    }

    /**
     * 纯几何映射驱动渲染
     */
    private updateVisual(timeProgress: number): void {
        if (!this.handle || this._realPoints.length < 2) return;

        let rawBallProgress = (1.0 - timeProgress) + this._startProgressOffset;
        let finalBallProgress = rawBallProgress % 1.0; 

        let rawBarProgress = timeProgress + this._startProgressOffset;
        let finalBarProgress = rawBarProgress % 1.0;

        if (this.progressBar) {
            this.progressBar.fillRange = finalBarProgress;
        }

        let targetLen = finalBallProgress * this._totalPathLength;
        let currentAccumulatedLen = 0;

        for (let i = 0; i < this._segmentLengths.length; i++) {
            let segLen = this._segmentLengths[i];
            
            if (currentAccumulatedLen + segLen >= targetLen) {
                let segmentProgress = (targetLen - currentAccumulatedLen) / segLen;
                let startPos = this._realPoints[i];
                let endPos = this._realPoints[i + 1];

                let finalX = startPos.x + (endPos.x - startPos.x) * segmentProgress;
                let finalY = startPos.y + (endPos.y - startPos.y) * segmentProgress;
                this.handle.setPosition(finalX, finalY);

                let dir = endPos.sub(startPos).normalize();
                this.handle.angle = Math.atan2(dir.y, dir.x) * 180 / Math.PI;
                return;
            }
            currentAccumulatedLen += segLen;
        }
    }
}