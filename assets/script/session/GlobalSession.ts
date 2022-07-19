
export default class GlobalSession {

    static get NowTime(): number {
        return + new Date().getTime() / 1000;
    }

}
