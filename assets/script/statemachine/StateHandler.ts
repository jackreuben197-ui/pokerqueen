
export abstract class StateHandler {

    public Name: string = "StateHandler";

    public SourceData: any;

    public Enter(param?: any) {
        console.log(`>>> StateHandler->${this.Name} is Enter`);
    }

    public Execute(param?: any) {
    }

    public Exit(param?: any) {
        console.log(`>>> StateHandler->${this.Name} is Exit`);
        this.SourceData = null; // 解除对源数据的引用
    }
}
