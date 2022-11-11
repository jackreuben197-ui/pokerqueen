import { IUpdate } from "../define/EIDefine";


export interface IUComponent {
    Update(dt);
}

export default class UpdateComponent {

    //public static _updates: IUpdate[] = [];

    public static get Instance(): UpdateComponent {

        return (this as any).instance ??= new UpdateComponent();

    }
    private components: IUComponent[] = [];

    //增加子刷新器
    public AddComponent(component: IUComponent): void {
        this.components.push(component);
    }
    //移除子刷新器
    public RemoveComponent(component: IUComponent): void {
        let index = this.components.indexOf(component);
        if (index > -1) this.components.splice(index, 1);
    }
    //移除所有
    public RemoveAll() {
        this.components = [];
    }
    //轮询 
    public Update() {
        
    }


    // public static Add(update: IUpdate, awake_param?: any) {
    //     this._updates.push(update);
    //     update.awake && update.awake(awake_param);
    // }

    // public static Remove(update: IUpdate) {
    //     for (let i = this._updates.length - 1; i >= 0; i--) {
    //         let item = this._updates[i];
    //         if (item == update) {
    //             this._updates.splice(i, 1);
    //             break;
    //         }
    //     }
    // }
    // public static RemoveAll() {
    //     while (UpdateComponent._updates.length) {
    //         let update_item = this._updates.pop();
    //         update_item.stop();
    //     }
    //     cc.log("UpdateComponent RemoveAll", this._updates.length);
    // }
    // Update(dt) {
    //     for (let update of UpdateComponent._updates) {
    //         update.allowUpdate && update.update(dt);
    //     }
    // }
}