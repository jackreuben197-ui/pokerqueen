/**
 * https 请求的数据模型
 */

const { ccclass, property } = cc._decorator;

@ccclass
export class WebRequestDataBase {

    Request(data: WebRequestDataBase) {
        return "";
    }
}

export class Web_Login extends WebRequestDataBase {

    phone       : string;       // 手机号
    password    : string;       // 密码MD5

    constructor() {
        super();
        for (let i in Web_Login.prototype) {
            cc.log(">>>>>>", i);
        }
        cc.log(this);
    }

}
