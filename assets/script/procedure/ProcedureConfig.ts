import { GameConfig } from "../config/GameConfig";
import { NetWorkBase } from "../config/NetWorkBase";
import { UIDefine } from "../define/UIDefine";
import SceneManager from "../manager/SceneManager";
import ProcedureBase from "./ProcedureBase";


const { ccclass, property } = cc._decorator;

@ccclass
export default class ProcedureConfig extends ProcedureBase {

    async Enter(param: any) {
        super.Enter(param);
        //设置 GlobalProto 配置
        GameConfig.C_GlobalProto = await this.getGlobalProto();

        this.initNetwork();

        SceneManager.ins.switchScene(UIDefine.LoginScene);
    }
    Leave() {
        super.Leave();
    }

    //初始化网络配置
    private initNetwork() {
        switch (GameConfig.Server_Type) {
            case 1://测试服
                GameConfig.Network.HTTP = cc.sys.localStorage.getItem("");
                //PlayerPrefsMgr.mInstance.GetString(httpKey, networkConf.WebHostIP);
                GameConfig.Network.WebHost = `http://${GameConfig.Network.HTTP}`;
                GameConfig.Network.LoginHost = cc.sys.localStorage.getItem("");
                [
                    "APIPort",
                    "PayPort",
                    "LoginPort",
                    "HeadPort",
                    "PaipuPort",
                    "UploadPort",
                    "UseDNS",
                    "AboutWeURL",
                    "UserAgentURL",
                    "DataAnalysisURL"
                ].forEach(item => {
                    GameConfig.Network[item] = NetWorkBase[item];
                })
                break;
            case 2://正式服
                break;
        }
    }

    private getGlobalProto() {
        return new Promise((resolve, reject) => {
            cc.resources.load("config/GlobalProto", cc.TextAsset, (err, asset: cc.TextAsset) => {
                if (err) {
                    cc.log("资源缺失:", err);
                    return;
                }
                return resolve(JSON.parse(asset.text));
            })
        });
    }
}
