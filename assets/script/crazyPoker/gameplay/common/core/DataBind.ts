const OBSERVER_KEY = Symbol('observer_events');

/**
 * 辅助类型：将字符串首字母大写 (如: "cards" -> "Cards")
 */
type CapitalizeString<S extends string> = S extends `${infer F}${infer R}` ? `${UpperChar<F>}${R}` : S;
type UpperChar<C extends string> = C extends infer T ? T extends string ? Uppercase<T> : never : never;

/**
 * 核心元类型：为 Data 类自动生成小驼峰格式的 Setter 函数签名
 * 它会自动把你声明的属性 `prop: T` 映射出一个 `setProp(val: T, ...args: Args): void` 的强类型函数
 */
export type ObservableClass<Class, Bindings extends Record<keyof Class, any[]>> = Class & {
    [K in keyof Bindings as `set${CapitalizeString<Extract<K, string>>}`]: (
        value: Class[K & keyof Class], // 约束索引签名，消除 ts(2536) 错误
        ...args: Bindings[K]
    ) => void;
};

interface BindingInfo {
    eventName: string;
    methodName: string;
    defaultArgs: any[];
    targetTag: string;
}

/**
 * 装饰器高级配置项接口
 */
export interface ObservableOptions {
    eventName?: string;                                               // 自定义绑定的事件名
    forceEmit?: boolean;                                              // 是否无视数据变动，强制每次都派发事件
    shouldUpdate?: (oldVal: any, newVal: any, ...args: any[]) => boolean; // 自定义拦截判定函数，返回 true 才会触发更新和派发
}

/**
 * 【数据源属性装饰器】
 * @param config 可以是普通的事件名字符串，也可以是高级配置对象 ObservableOptions
 */
export function observable(config?: string | ObservableOptions) {
    return function (target: any, propertyKey: string) {
        const privateKey = `_${propertyKey}`;
        
        //核心优化：动态生成小驼峰格式的方法名 (例如 "cards" -> "setCards")
        const capitalizedKey = propertyKey.charAt(0).toUpperCase() + propertyKey.slice(1);
        const setterMethodName = `set${capitalizedKey}`;

        // 默认配置初始化
        let evt = propertyKey;
        let forceEmit = false;
        let shouldUpdateCustom: ((oldVal: any, newVal: any, ...args: any[]) => boolean) | undefined = undefined;

        // 解析入参：判断传进来的是纯字符串还是配置对象
        if (typeof config === 'string') {
            evt = config;
        } else if (config && typeof config === 'object') {
            evt = config.eventName || propertyKey;
            forceEmit = !!config.forceEmit;
            shouldUpdateCustom = config.shouldUpdate;
        }

        // 默认的数组/纯对象深度内容判定
        const defaultCheckSame = (oldVal: any, newVal: any): boolean => {
            if (oldVal === newVal) return true;
            if (!oldVal || !newVal) return false;

            // 数组深度判定
            if (Array.isArray(oldVal) && Array.isArray(newVal)) {
                if (oldVal.length !== newVal.length) return false;
                for (let i = 0; i < oldVal.length; i++) {
                    const a = oldVal[i];
                    const b = newVal[i];
                    if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) {
                        const keysA = Object.keys(a);
                        const keysB = Object.keys(b);
                        if (keysA.length !== keysB.length || keysA.some(k => a[k] !== b[k])) return false;
                    } else if (a !== b) {
                        return false;
                    }
                }
                return true;
            }

            // 纯对象深度判定
            if (typeof oldVal === 'object' && typeof newVal === 'object') {
                const keysA = Object.keys(oldVal);
                const keysB = Object.keys(newVal);
                if (keysA.length !== keysB.length) return false;
                for (let key of keysA) {
                    if (oldVal[key] !== newVal[key]) return false;
                }
                return true;
            }

            return false;
        };

        // 核心过滤网：综合判断是否需要跳过派发
        const shouldSkip = (oldVal: any, newVal: any, ...args: any[]): boolean => {
            if (forceEmit) return false; // 开启了强制发送 -> 绝对不拦截
            
            if (shouldUpdateCustom) {
                return !shouldUpdateCustom(oldVal, newVal, ...args); 
            }
            
            return defaultCheckSame(oldVal, newVal);
        };

        // 1. 拦截基础属性的 getter/setter (支持普通的 = 赋值)
        Object.defineProperty(target, propertyKey, {
            get: function () {
                return this[privateKey];
            },
            set: function (newValue) {
                const oldValue = this[privateKey];
                if (shouldSkip(oldValue, newValue)) return;

                this[privateKey] = newValue;
                if (typeof this.emit === 'function') {
                    this.emit(evt, newValue); 
                }
            },
            enumerable: true,
            configurable: true
        });

        // 2. 动态在原型链上挂载小驼峰命名的强类型函数 (如 setCards / setRoundBet)
        if (!target[setterMethodName]) {
            target[setterMethodName] = function (newValue: any, ...args: any[]) {
                const oldValue = this[privateKey];
                if (shouldSkip(oldValue, newValue, ...args)) return;

                this[privateKey] = newValue;
                if (typeof this.emit === 'function') {
                    this.emit(evt, newValue, ...args); 
                }
            };
        }
    };
}

/**
 * 【UI层组件监听装饰器】
 */
export function bindEvent<Args extends any[]>(eventName: string, targetTag: string, ...defaultArgs: Args) {
    return function (target: any, propertyKey: string) {
        const componentInstance = target as any;
        if (!componentInstance[OBSERVER_KEY]) {
            componentInstance[OBSERVER_KEY] = [];
        }
        componentInstance[OBSERVER_KEY].push({
            eventName,
            methodName: propertyKey,
            defaultArgs,
            targetTag
        });
    };
}

/**
 * 【统一激活绑定器】
 */
export function autoBindEvents(
    component: cc.Component & { [OBSERVER_KEY]?: BindingInfo[] },
    dataSources: Record<string, cc.EventTarget | null | undefined>
) {
    if (!component[OBSERVER_KEY]) return;

    const bindings: BindingInfo[] = component[OBSERVER_KEY];
    
    for (const binder of bindings) {
        const dataSource = dataSources[binder.targetTag];
        if (!dataSource) continue; 

        const callback = (component as any)[binder.methodName].bind(component);
        dataSource.on(binder.eventName, callback, component);

        let currentVal = undefined;
        const sourceAny = dataSource as any; 
        
        if (binder.eventName in sourceAny) {
            currentVal = sourceAny[binder.eventName];
        } else {
            const propKey = binder.eventName.toLowerCase().replace(/_(\w)/g, (_, letter) => letter.toUpperCase());
            if (propKey in sourceAny) currentVal = sourceAny[propKey];
        }

        callback(currentVal, ...binder.defaultArgs);
    }
}