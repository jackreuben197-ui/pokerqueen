import { LogLevel } from "./gameplay/common/core/LogTrace";

export default class DevConfig {
    public static VERSION = 1.0
    // 是否是老的进入房间
    public static IS_OLD = true;

    public static LOG_LEVEL: LogLevel = 'warn';
}