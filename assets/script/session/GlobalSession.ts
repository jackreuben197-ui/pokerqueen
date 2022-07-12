
export default class GlobalSession {

    static CurrAreaCode: string;

    static NowTime(): number {
        return + new Date().getTime() / 1000;
    }

}
