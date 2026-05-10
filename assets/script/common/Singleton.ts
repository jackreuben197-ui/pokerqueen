// const { ccclass, property } = cc._decorator;
// @ccclass
// export default class Singleton extends cc.Component {
//     onLoad() {
//         let name = (this.constructor as any)?.Name;
//         if (!Singleton[name]) {
//             Singleton[name] = true;
//             this.constructor["ins"] = this;
//             this.lateLoad();
//         } else {
//             this.destroy();
//             cc.log("重复创建单例:", this.name);
//             return;
//         }
//     }
//     protected lateLoad() {
//     }
// }
class Singleton {

    //this: new () => T

    static __Instance<T>(this: new () => T): T {
        return ((<any>this).instance ??= new this());
    }

    static get Instance(): Singleton {
        return ((<any>this).instance ??= new Singleton());
    }

    a() {}
}

class Bar extends Singleton {
    desc: string;

    public print() {
        cc.log(this.desc);
    }
}

export class A extends Singleton {

    constructor() {
        super();
    }

    a() {}
}

export class B {

    constructor() {
        //Bar.Instance<Bar>.
        Singleton.Instance.a;
    }
}
