
export abstract class StateHandler {

    public Name: string = "StateHandler";

    public SourceData: any = null;

    public Enter(entity?: any) {
        console.log("entity", entity);
        console.log(`>>> StateHandler->${this.Name}:${entity.id} is Enter`);
    }
    public Execute(entity?: any, dt?: number) {
    }

    public Exit(entity?: any) {
        console.log(`>>> StateHandler->${this.Name}:${entity.id} is Exit`);
        this.SourceData = null; // 解除对源数据的引用
    }
}
