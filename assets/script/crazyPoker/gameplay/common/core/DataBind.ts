/**
 * =========================================================================
 * @file DataBind.ts
 * @description 扑克游戏真理源数据绑定核心框架
 * * =========================================================================
 * 🌟 核心设计原则 🌟
 * 1. 绝对硬编码映射：
 * 砍掉所有动态猜测、模糊前缀匹配以及小驼峰隐式转换。所有的状态字段必须通过 
 * @observable 进行严格声明登记，确保底层运行期的绝对健壮。
 * * 2. 强契约注册制：
 * 如果一个事件名没有登记在原型链的反向账本（EVENT_MAP_KEY）中，
 * autoBindEvents 在静态初始化拉取首屏值时将直接跳过，绝不做任何无意义的盲猜检索。
 * * 3. 完美兼容纯消息动作（一站式插眼注册）：
 * 对于不绑定任何物理属性、仅作为动作状态重置通知的纯事件（例如：EMPTY_SEAT、WINNER），
 * 支持直接在具体的清理或逻辑业务方法上方通过 @pureEvent 挂载。
 * 底层不仅能接管方法执行完毕后的全自动事件派发与 shouldEmit 条件控制过滤，
 * 更能在 autoBindEvents 初始对齐时，以 PURE_MARK 标记在账本中自证存在，实现首屏完美放行。
 * * =========================================================================
 * 🎯 生产环境实战级业务模型声明示例（API 备忘录）
 * =========================================================================
 * * @bindData()
 * export class TexasGameRoomDataPlayer extends cc.EventTarget {
 * * // 示例 1: 常规响应式变量声明
 * @observable('CHIPS_CHANGE')
 * public chip: number = 0;
 * * // 示例 2: 强断言无序集合比对数组（如手牌、高亮牌组等乱序等价不重新渲染 UI 场景）
 * @observable({ eventName: 'SHOW_CARDS_CHANGE', compareType: 'arrayAsSet' })
 * public cards: number[] = [];
 * * // 示例 3: 带 shouldEmit 的高级控制变量声明（满足特定条件时才向 UI 发送事件通知）
 * @observable({ 
 * eventName: 'VIP_SCORE_CHANGE', 
 * shouldEmit: (oldVal, newVal) => {
 * // 仅当分数产生跨越式暴涨时才允许派发事件通知 UI 播放华丽动效
 * return newVal - oldVal > 10000;
 * } 
 * })
 * public vipScore: number = 0;
 * * // 示例 4: 基础型纯通知消息方法（执行完清理现场后自动 emit 'EMPTY_SEAT'）
 * @pureEvent('EMPTY_SEAT')
 * public emptySeat() {
 * // 🔔 muteEvents & unmuteEvents 经典应用：批量更新防抖
 * this.muteEvents();   // 开启静音：接下来批量修改响应式变量，绝不触发任何单体变量对应的事件
 * * this.chip = 0;       // 静音期：仅物理赋值，不派发 CHIPS_CHANGE 事件
 * this.cards = [];     // 静音期：仅物理赋值，不派发 SHOW_CARDS_CHANGE 事件
 * this.vipScore = 0;   // 静音期：仅物理赋值
 * * this.unmuteEvents(); // 关闭静音：恢复变量代理的响应式通知阀门
 * // 函数执行完毕离开：@pureEvent 顺理成章、干净利落地自动发射一发 'EMPTY_SEAT' 纯动作信号
 * }
 * * // 示例 5: 带 shouldEmit 条件控制的纯通知消息方法
 * @pureEvent('WIN_ANIMATION_TRIGGER', {
 * shouldEmit: function() {
 * // 里面的 this 上下文完美指向当前运行时的实例本身
 * // 只有当玩家确实赢取了金币（chip > 0）且处于亮牌状态时，方法体执行完才允许向 UI 发射大招特效事件
 * return this.chip > 0 && this.cards.length > 0;
 * }
 * })
 * public claimWinnerDataAndTriggerEffect() {
 * // 执行局内结算数据合并逻辑...
 * }
 * }
 * =========================================================================
 */

// UI 组件层挂载的订阅信息唯一标识
const OBSERVER_KEY = Symbol('observer_events');
// 模型原型链上焊接的反向账本：[事件名 -> 物理属性私有键名] 或 [事件名 -> 'PURE_MARK']
const EVENT_MAP_KEY = Symbol('event_to_property_map');

const LN = '[DataBind]';

// 编译期类型体操：用于将属性名首字母大写拼装成 setXxxx 契约方法
type CapitalizeString<S extends string> = S extends `${infer F}${infer R}` ? `${UpperChar<F>}${R}` : S;
type UpperChar<C extends string> = C extends infer T ? T extends string ? Uppercase<T> : never : never;


// =========================================================================
// ==================== 强约束契约接口声明 ================================
// =========================================================================

/**
 * 批量更新静音阀门控制接口
 */
export interface IObservableMuted {
    /** 开启静音：后续所有属性修改或方法执行仅更新物理值，绝不触发事件派发 */
    muteEvents(): void;
    /** 关闭静音：恢复正常的响应式派发流程 */
    unmuteEvents(): void;
}

/**
 * 模型数据变更方法集的强类型契约绑定
 * 自动根据 Class 属性和 Bindings 事件映射，拼装出带强类型约束的 setXxxx 方法集
 */
export type IObservableBindings<Class, Bindings extends Record<string, any[]>> = {
    [K in keyof Bindings as `set${CapitalizeString<Extract<K, string>>}`]: (
        value: K extends keyof Class ? Class[K] : any,
        ...args: Bindings[K]
    ) => void;
} & IObservableMuted;

/**
 * UI 组件层内部记录的绑定元数据结构
 */
interface BindingInfo {
    eventName: string | string[]; // 监听的引擎事件名（支持多选）
    methodName: string;          // UI 组件上接收回调的成员方法名
    defaultArgs: any[];          // 静态初始值后面追加的透传默认参数
    targetTag: string;           // 对应绑定的真理源数据源标签（如 'player'）
}

/**
 * 响应式属性高级配置项
 */
export interface ObservableOptions {
    eventName?: string;                                               // 自定义派发的事件名，缺省为物理属性名
    forceEmit?: boolean;                                              // 是否强制发射（跳过前后值脏检查比对）
    shouldEmit?: (oldVal: any, newVal: any, ...args: any[]) => boolean; // 自定义脏检查过滤器
    compareType?: 'normal' | 'arrayAsSet';                            // 脏检查比对模式：'normal' 严格序比对 | 'arrayAsSet' 集合无序比对
}

/**
 * 纯消息方法装饰器专用配置项
 */
export interface PureEventOptions {
    /** 选填的自定义发射控制拦截器。返回 true 允许发射，返回 false 阻止发射 */
    shouldEmit?: (this: any, ...args: any[]) => boolean;
}


// =========================================================================
// ==================== 核心响应式装饰器实现 ==============================
// =========================================================================

/**
 * 【类装饰器】@bindData
 * 核心职责：向数据源类注入全自动的静音控制阀门（实现 IObservableMuted 契约接口）
 */
export function bindData() {
    return function (constructor: any) {
        const target = constructor.prototype;
        if (!target.muteEvents) {
            target.muteEvents = function () { this._isMuted = true; };
            target.unmuteEvents = function () { this._isMuted = false; };
        }
    };
}

/**
 * 【方法装饰器】@pureEvent
 * 专为纯消息业务动作定制。拦截业务方法的执行，在执行完毕后全自动发射事件，
 * 并支持动态注入 shouldEmit 规则判定，同时向首屏账本挂载 PURE_MARK 占位符。
 * @param eventName 发射的事件名（如 'EMPTY_SEAT'）
 * @param options 可选配置项（可以传入 shouldEmit 控制器）
 */
export function pureEvent(eventName: string, options?: PureEventOptions) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        // 向原型链反向账本焊接：该纯通知事件存在，首屏拉取时认领它，且没有对应的下划线私有物理属性
        if (!target[EVENT_MAP_KEY]) {
            target[EVENT_MAP_KEY] = new Map<string, string>();
        }
        target[EVENT_MAP_KEY].set(eventName, 'PURE_MARK');

        // 劫持业务方法的物理执行过程
        descriptor.value = function (...args: any[]) {
            // 1. 首先执行原本函数体内手写的逻辑（如你写在 emptySeat 内的数据清空）
            const result = originalMethod.apply(this, args);

            // 2. 检查当前模型是否处于批量控制的静音期
            if ((this as any)._isMuted) return result;

            // 3. 如果装饰器注入了 shouldEmit 断言选项
            if (options && typeof options.shouldEmit === 'function') {
                // 将当前函数执行的上下文环境（this）和入参透喂给 shouldEmit 拦截器
                const canEmit = options.shouldEmit.apply(this, args);
                if (!canEmit) return result; // 判定不通过，默默执行完数据层，直接返回，不发射事件
            }

            // 4. 业务体内部执行完毕，全自动通过引擎派发事件，并将执行方法时的入参顺带全量丢给 UI 监听侧
            if (typeof (this as any).emit === 'function') {
                (this as any).emit(eventName, ...args);
            }

            return result;
        };
    };
}

/**
 * 【属性装饰器】@observable
 * 接管变量的 Getter/Setter 劫持，并在原型链上生成标准化的小驼峰 setXxxx 更新方法。
 */
export function observable(config?: string | ObservableOptions) {
    return function (target: any, propertyKey: string) {
        const privateKey = `_${propertyKey}`; // 自动派生的物理私有存储键名
        const capitalizedKey = propertyKey.charAt(0).toUpperCase() + propertyKey.slice(1);
        const setterMethodName = `set${capitalizedKey}`; // 标准小驼峰契约方法名

        let evt = propertyKey;
        let forceEmit = false;
        let shouldEmitCustom: ((oldVal: any, newVal: any, ...args: any[]) => boolean) | undefined = undefined;
        let compareType: 'normal' | 'arrayAsSet' = 'normal';

        if (typeof config === 'string') {
            evt = config;
        } else if (config && typeof config === 'object') {
            evt = config.eventName || propertyKey;
            forceEmit = !!config.forceEmit;
            shouldEmitCustom = config.shouldEmit;
            if (config.compareType) { compareType = config.compareType; }
        }

        if (!target[EVENT_MAP_KEY]) {
            target[EVENT_MAP_KEY] = new Map<string, string>();
        }
        target[EVENT_MAP_KEY].set(evt, privateKey);

        /**
         * 深度内置脏检查：常规对象/数组或基础类型的深度相等判定
         */
        const checkNormalSame = (oldVal: any, newVal: any): boolean => {
            if (oldVal === newVal) return true;
            if (!oldVal || !newVal) return false;

            if (Array.isArray(oldVal) && Array.isArray(newVal)) {
                if (oldVal.length !== newVal.length) return false;
                for (let i = 0; i < oldVal.length; i++) {
                    const a = oldVal[i]; const b = newVal[i];
                    if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) {
                        const keysA = Object.keys(a); const keysB = Object.keys(b);
                        if (keysA.length !== keysB.length || keysA.some(k => a[k] !== b[k])) return false;
                    } else if (a !== b) { return false; }
                }
                return true;
            }

            if (typeof oldVal === 'object' && typeof newVal === 'object') {
                const keysA = Object.keys(oldVal); const keysB = Object.keys(newVal);
                if (keysA.length !== keysB.length) return false;
                for (let key of keysA) { if (oldVal[key] !== newVal[key]) return false; }
                return true;
            }
            return false;
        };

        /**
         * 深度内置脏检查：将数组视为无序集合（ArrayAsSet）进行高精度对齐比对（常用于无序手牌或座位变化）
         */
        const checkArrayAsSetSame = (oldVal: any, newVal: any): boolean => {
            if (!Array.isArray(oldVal) || !Array.isArray(newVal)) {
                throw new Error(`[DataBind] Property "${propertyKey}" is configured as "arrayAsSet", but the runtime value is not an array.`);
            }

            if (oldVal === newVal) return true;
            if (oldVal.length !== newVal.length) return false;
            if (oldVal.length === 0) return true;

            const visited = new Array(newVal.length).fill(false);
            const isElementEqual = (a: any, b: any): boolean => {
                if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) {
                    const keysA = Object.keys(a); const keysB = Object.keys(b);
                    if (keysA.length !== keysB.length) return false;
                    return !keysA.some(k => a[k] !== b[k]);
                }
                return a === b;
            };

            for (let i = 0; i < oldVal.length; i++) {
                const itemA = oldVal[i];
                let foundMatch = false;

                for (let j = 0; j < newVal.length; j++) {
                    if (visited[j]) continue;
                    if (isElementEqual(itemA, newVal[j])) {
                        visited[j] = true; 
                        foundMatch = true;
                        break; 
                    }
                }
                if (!foundMatch) return false;
            }
            return true;
        };

        /**
         * 统一脏检查决策器：判定当前新老数据是否完全一致从而跳过无用的 UI 事件更新
         */
        const shouldSkipEmit = (oldVal: any, newVal: any, ...args: any[]): boolean => {
            if (forceEmit) return false; 
            if (shouldEmitCustom) { return !shouldEmitCustom(oldVal, newVal, ...args); }
            if (compareType === 'arrayAsSet') { return checkArrayAsSetSame(oldVal, newVal); }
            return checkNormalSame(oldVal, newVal); 
        };

        if (!target.muteEvents) {
            target.muteEvents = function () { this._isMuted = true; };
            target.unmuteEvents = function () { this._isMuted = false; };
        }

        Object.defineProperty(target, propertyKey, {
            get: function () { return this[privateKey]; },
            set: function (newValue) {
                const oldValue = this[privateKey];
                const skipEmit = shouldSkipEmit(oldValue, newValue);
                this[privateKey] = newValue;
                if (skipEmit) return;      
                if (this._isMuted) return; 
                if (typeof this.emit === 'function') this.emit(evt, newValue); 
            },
            enumerable: true,
            configurable: true
        });

        if (!target[setterMethodName]) {
            target[setterMethodName] = function (newValue: any, ...args: any[]) {
                const oldValue = this[privateKey];
                const skipEmit = shouldSkipEmit(oldValue, newValue, ...args);
                this[privateKey] = newValue;
                if (skipEmit) return;
                if (this._isMuted) return; 
                if (typeof this.emit === 'function') this.emit(evt, newValue, ...args); 
            };
        }
    };
}


// =========================================================================
// ==================== UI 监听层与统一绑定实现 ===========================
// =========================================================================

/**
 * 【方法装饰器】@bindEvent
 * 核心职责：用于 UI 组件（cc.Component）的接收函数上方，登记当前的绑定依赖信息
 */
export function bindEvent<Args extends any[]>(eventName: string | string[], targetTag: string, ...defaultArgs: Args) {
    return function (target: any, propertyKey: string) {
        const componentInstance = target as any;
        if (!componentInstance[OBSERVER_KEY]) { componentInstance[OBSERVER_KEY] = []; }
        componentInstance[OBSERVER_KEY].push({ eventName, methodName: propertyKey, defaultArgs, targetTag });
    };
}

/**
 * 【组件流水线组装器】autoBindEvents
 * 核心职责：在 UI 组件首屏拉起时，一键自动化托管事件注册与首屏静态快照同步。
 */
export function autoBindEvents<T extends Record<string, cc.EventTarget | null | undefined>>(
    component: cc.Component & { [OBSERVER_KEY]?: BindingInfo[] },
    dataSources: T,
    shouldInitSync?: <K extends keyof T>(eventName: string, tag: K, dataSource: NonNullable<T[K]>) => boolean
) {
    if (!component[OBSERVER_KEY]) return;
    const bindings: BindingInfo[] = component[OBSERVER_KEY];
    
    for (const binder of bindings) {
        const sourceTag = binder.targetTag as keyof T; 
        const dataSource = dataSources[sourceTag];
        if (!dataSource) continue; 

        const callback = (component as any)[binder.methodName].bind(component);
        const sourceAny = dataSource as any; 
        const eventList = Array.isArray(binder.eventName) ? binder.eventName : [binder.eventName];
        
        let hasSynced = false; 

        for (const evtName of eventList) {
            dataSource.on(evtName, callback, component);
            if (!hasSynced) {
                const eventToPropertyMap: Map<string, string> = sourceAny[EVENT_MAP_KEY];
                
                if (eventToPropertyMap && eventToPropertyMap.has(evtName)) {
                    const realPrivateKey = eventToPropertyMap.get(evtName)!;
                    hasSynced = true;
                    // 核心分流点：如果是 PURE_MARK 标志，初始值直接投喂 undefined，不再读取下划线私有变量
                    const currentVal = realPrivateKey === 'PURE_MARK' ? undefined : sourceAny[realPrivateKey];

                    if (shouldInitSync && !shouldInitSync(evtName, sourceTag, dataSource as NonNullable<T[keyof T]>)) {
                        continue;
                    }
                    callback(currentVal, ...binder.defaultArgs);
                }
            }
        }
    }
}