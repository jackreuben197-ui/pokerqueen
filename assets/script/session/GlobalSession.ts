
export default class GlobalSession {

    static NowTime(): number {
        return + new Date().getTime() / 1000;
    }

}
