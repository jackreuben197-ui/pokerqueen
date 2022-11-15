/**
 * 模擬數據模型
 **/
export default class MoniModel {
    public static get Instance(): MoniModel {
        return (this as any).__Instance ??= new MoniModel();
    }
}
