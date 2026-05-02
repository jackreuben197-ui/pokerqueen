/**
 * vconsole 开启判断，点击标题次数
 */

const { ccclass, property } = cc._decorator;

@ccclass
export default class VConsoleComponent {

    public static get Instance(): VConsoleComponent {

        return (this as any).__Instance ??= new VConsoleComponent();

    }
    vconsole_click_time = 0;
    timeRun = false;
    timePass = 0;
    vconsole_is_show: boolean = false;
    count = 8;

    Click() {
        if (this.vconsole_is_show == true) return;
        if (this.timeRun == false) {
            this.timeRun = true;
            this.vconsole_click_time = 0;
        }
        this.vconsole_click_time++;
    }
    Update(dt:number) {
        if (this.timeRun) {
            this.timePass += dt;
            if (this.timePass > 2) {
                //判断次数
                if (this.vconsole_click_time > this.count) {
                    //显示vconsole
                    this.vconsole_is_show = true;
                    (window as any).createVconsole?.();
                    cc.log("显示console");
                }
                //cc.log("失败", this.vconsole_click_time);
                this.timeRun = false;
                this.timePass = 0;
            }
        }
    }
}
