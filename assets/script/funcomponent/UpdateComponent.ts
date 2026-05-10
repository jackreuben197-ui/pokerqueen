export interface IUpComponent {
    active: boolean;

    Awake?(param?: any): void;

    Update(dt: number): void;
}

export default class UpdateComponent {

    public static get Instance(): UpdateComponent {
        return ((this as any).__Instance ??= new UpdateComponent());
    }
    private components: IUpComponent[] = [];

    //增加子刷新器
    public AddComponent<T>(component: IUpComponent): void {
        this.components.push(component);
        component.active = true;
        component.Awake?.();
    }

    //移除子刷新器
    public RemoveComponent(component: IUpComponent): void {
        if (!component) return;
        let index = this.components.indexOf(component);
        if (index > -1) this.components.splice(index, 1);
    }

    //移除所有
    public RemoveAll(): void {
        this.components = [];
        console.log('清空所有 IUpComponent');
    }

    //轮询
    public Update(dt: number): void {
        this.components.forEach(component => {
            component.active && component.Update(dt);
        });
    }
}
