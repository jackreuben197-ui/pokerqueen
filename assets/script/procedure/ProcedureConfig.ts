
import { GameConfig, NetWorkBase } from "../config/GameConfig";
import { ProcedureEnum } from "../define/EIDefine";
import { i18nMgr } from "../i18n/i18nMgr";
import ProcedureManager from "../manager/ProcedureManager";
import ProcedureBase from "./ProcedureBase";


const { ccclass, property } = cc._decorator;

@ccclass
export default class ProcedureConfig extends ProcedureBase {

    Name: string = "ProcedureConfig";

    async lateEnter(param?: any) {
        super.lateEnter(param);
        //设置 GlobalProto 配置
        GameConfig.GlobalProto = await this.getGlobalProto();
        console.log("config :: GameConfig.GlobalProto : ", GameConfig.GlobalProto);
        //读取 语言配置
        await i18nMgr.loadLanguage_csv();
        i18nMgr.initLanguage();
        console.log("config :: i18nMgr initLanguage");
        //设置网络配置
        GameConfig.Network = this.getNetwork();
        console.log("config :: GameConfig.Network : ", GameConfig.Network);

        ProcedureManager.StartProcedure(ProcedureEnum.Login);
    }
    Leave() {
        super.Leave();
    }

    //初始化网络配置
    private getNetwork() {
        let keys =
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
            ];
        let network: any = {};
        switch (GameConfig.Server_Type) {
            case 1://测试服
                network.HTTP = cc.sys.localStorage.getItem("");
                //PlayerPrefsMgr.mInstance.GetString(httpKey, networkConf.WebHostIP);
                network.WebHost = `http://${network.HTTP}`;
                network.LoginHost = cc.sys.localStorage.getItem("");
                keys.forEach(item => {
                    network[item] = NetWorkBase[item];
                })
                break;
            case 2://开发服
                network.HTTP = "dev.k8s.awanptesting.com";////PlayerPrefsMgr.mInstance.GetString(httpKey, networkConf.WebHostIP);
                network.WebHost = `http://${network.HTTP}`;
                //network.LoginHost = "52.221.136.216"; 
                network.LoginHost = "13.214.62.42";

                //Dns.GetHostEntry("dev.k8s.awanptesting.com").AddressList[0].ToString(); //PlayerPrefsMgr.mInstance.GetString(sckKey, networkConf.LoginHostIP);
                keys.forEach(item => {
                    network[item] = NetWorkBase[item];
                })
                network.APIPort = "80";
                break;
        }
        network.WebURL = `${network.WebHost}:${network.APIPort}`;
        network.PayURL = `${network.WebHost}:${network.PayPort}`;
        network.HeadUrl = `${network.WebHost}:${network.HeadPort}`;
        network.BannerImageUrl = `${network.WebHost}:${network.HeadPort}`;
        network.UploadURL = `${network.WebHost}:${network.UploadPort}`;
        network.PaipuBaseUrl = `${network.WebHost}:${network.PaipuPort}?lan=zh&info_id=`;
        return network;
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
