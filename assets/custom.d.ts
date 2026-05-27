// global-extensions.d.ts

declare namespace cc {
    interface Component {
        /** 自动注入的追踪日志记录器 */
        readonly tracelog: import("./script/crazyPoker/gameplay/common/core/LogTrace").ITraceLogger;
    }
}

declare global {
    interface Object {
        readonly tracelog: import("./script/crazyPoker/gameplay/common/core/LogTrace").ITraceLogger;
    }
}