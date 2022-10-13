

export default class MyLog {
    private static needLog: boolean = true;
    public static log(msg: string | any, ...subst: any[]) {
        if (MyLog.needLog) {
            console.log(msg, ...subst);
        }
    }

    public static worn(msg: string | any, ...subst: any[]) {
        if (MyLog.needLog) {
            console.warn(msg, ...subst);
        }
    }

    public static error(msg: string | any, ...subst: any[]) {
        if (MyLog.needLog) {
            console.error(msg, ...subst);
        }
    }
}