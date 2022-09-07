//Type Gymnastics

//类里映射参数类型
export type Param<T, K, V = never> = K extends keyof T ? T[K] : V