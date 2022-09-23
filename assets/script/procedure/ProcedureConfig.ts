
import { GameConfig, NetWorkBase } from "../config/GameConfig";
import { ProcedureEnum } from "../define/EIDefine";
import { i18nMgr } from "../i18n/i18nMgr";

import Main from "../Main";
import ProcedureManager from "../manager/ProcedureManager";
import { Pre_Config_Define } from "../manager/ResManager";
import LoginSession from "../session/LoginSession";
import UIComponent from "../ui/UIComponent";
import ProcedureBase from "./ProcedureBase";


const { ccclass, property } = cc._decorator;

@ccclass
export default class ProcedureConfig extends ProcedureBase {

    Name: string = "ProcedureConfig";

    async lateEnter(param?: any) {
        super.lateEnter(param);

        UIComponent.Instance.ShowNoAnimation(Main.UIPreloading, {
            pre_define: Pre_Config_Define, complete: () => {
                console.log("Config Set");
                GameConfig.GlobalProto = this.getGlobalProto();
                console.log("config :: GameConfig.GlobalProto : ", GameConfig.GlobalProto);
                //解析 语言配置
                i18nMgr.praseConfig();
                i18nMgr.initLanguage();
                console.log("config :: i18nMgr praseConfig");
                //设置网络配置
                GameConfig.Network = this.getNetwork();
                console.log("config :: GameConfig.Network : ", GameConfig.Network);
                let skipLogin: boolean = LoginSession.IsTokenVaild();
                ProcedureManager.StartProcedure(ProcedureEnum.Login, { skipLogin: skipLogin });
            }
        })
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
                if (GameConfig.IsNewArea) {
                    network.HTTP = "dev1.awanptesting.com";
                    network.LoginHost = "dev1.awanptesting.com";
                    network.WebHost = `http://${network.HTTP}`;
                } else {
                    network.HTTP = "dev.k8s.awanptesting.com";
                    network.LoginHost = "dev.k8s.awanptesting.com";
                    network.WebHost = `http://${network.HTTP}`;
                }

                keys.forEach(item => {
                    network[item] = NetWorkBase[item];
                })
                network.APIPort = "80";
                break;
        }
        network.WebURL = `${network.WebHost}`//:${network.APIPort}`;
        network.PayURL = `${network.WebHost}:${network.PayPort}`;
        network.HeadUrl = `${network.WebHost}:${network.HeadPort}`;
        network.BannerImageUrl = `${network.WebHost}:${network.HeadPort}`;
        network.UploadURL = `${network.WebHost}:${network.UploadPort}`;
        network.PaipuBaseUrl = `${network.WebHost}:${network.PaipuPort}?lan=zh&info_id=`;
        return network;
    }

    private getGlobalProto() {
        let GlobalProto: cc.TextAsset = cc.resources.get("config/GlobalProto", cc.TextAsset);
        if (GlobalProto && GlobalProto.text) {
            return JSON.parse(GlobalProto.text)
        }
        return null;
    }
}
