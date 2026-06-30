export abstract class StateHandler {
    public Name: string = 'StateHandler';
    public SourceData: any = null;

    public Enter(entity?: any) {
    }

    public Execute(entity?: any, dt?: number) {}

    public Exit(entity?: any) {
        this.SourceData = null; // 解除对源数据的引用
    }
}
