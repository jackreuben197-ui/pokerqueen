import * as i18nLabel from "./i18nLabel";
import * as i18nSprite from "./i18nSprite";
import UIMatchBanner from "../UIMatchBanner"
var CSV = require("CSV");
//上来先处理数据 当前的语言 0简中 1繁中 2英文 3葡语  let type = ["cn","zh","en","pt"]
var LanguageAllObject = {
    cn: {},
    zh: {},
    en: {},
    pt: {}
};
//补充一些表格内缺失的,优先判断
var excelAdd = {
    en: {
        UILogin_USER101: "Read and agree to<color = #DCBA82>《User Agreement》</color>",
    }
}
cc.resources.load("i18n/Language", (err, data: cc.TextAsset) => {
    var _csv = new CSV(data.text, { header: true });
    var _con = _csv.parse();
    for (let i = 0; i < _con.length; i++) {
        let val = _con[i];
        if (val.key) {
            LanguageAllObject.cn[val.key] = val.cn;
            LanguageAllObject.zh[val.key] = val.zh;
            LanguageAllObject.en[val.key] = val.en;
            LanguageAllObject.pt[val.key] = val.pt;
        }
    }
    // cc.log("LanguageAllObject----",LanguageAllObject);
});
export class i18nMgr {
    private static language = "";     // 当前语言
    private static labelArr: i18nLabel.i18nLabel[] = [];        // i18nLabel 列表
    private static LanguageObject: { [key: string]: string } = {};   // 文字配置
    private static spriteArr: i18nSprite.i18nSprite[] = [];       // i18nSprite 列表

    private static checkInit() {
        this.language = cc.sys.localStorage.getItem("language");
        if (!this.language) {
            this.setLanguage("en");
        }
        this.LanguageObject = LanguageAllObject[this.language];
    }

    /**
     * 设置语言
     */
    public static setLanguage(language: string) {
        if (this.language === language) {
            return;
        }
        this.language = language;
        cc.sys.localStorage.setItem("language", this.language);
        this.reloadLabel();
        this.reloadSprite();
        this.resetRemoteSprite();
    }

    // 观察所有与多语言有关的图片 重新调用服务器接口
    public static resetRemoteSprite() {
        // zh_CN:简体中文,zh_HK:繁体中文,en_US:英文，pt_BR：葡萄牙语
        let changeObj = {
            cn: "zh_CN",
            zh: "zh_HK",
            en: "en_US",
            pt: "pt_BR"
        }
        if (UIMatchBanner.instance) {
            UIMatchBanner.instance.initBannerList(changeObj[this.language]);
        }
    }
    /**
     * 添加或移除 i18nLabel
     */
    public static _addOrDelLabel(label: i18nLabel.i18nLabel, isAdd: boolean) {
        if (isAdd) {
            this.labelArr.push(label);
        } else {
            let index = this.labelArr.indexOf(label);
            if (index !== -1) {
                this.labelArr.splice(index, 1);
            }
        }
    }

    public static _getLabel(opt: string): string {
        this.checkInit();
        if (excelAdd[this.language]?.[opt]) return excelAdd[this.language][opt];
        if (this.LanguageObject) {
            if (this.LanguageObject[opt]) {
                return this.LanguageObject[opt] || opt;
            }
            return opt;
        } else {
            return opt;
        }
    }


    /**
     * 添加或移除 i18nSprite
     */
    public static _addOrDelSprite(sprite: i18nSprite.i18nSprite, isAdd: boolean) {
        if (isAdd) {
            this.spriteArr.push(sprite);
        } else {
            let index = this.spriteArr.indexOf(sprite);
            if (index !== -1) {
                this.spriteArr.splice(index, 1);
            }
        }
    }

    public static _getSprite(path: string, cb: (spriteFrame: cc.SpriteFrame) => void) {
        this.checkInit();
        cc.resources.load("i18n/sprite/" + this.language + "/" + path, cc.SpriteFrame, (err, spriteFrame: cc.SpriteFrame) => {
            if (err) {
                return cb(null);
            }
            cb(spriteFrame);
        });
    }

    /**
     * @description: 此方法读取Language里面的数据 再根据语言类型分配相应的字符串
     * @return {*}
     */
    private static reloadLabel() {
        for (let one of this.labelArr) {
            one._resetValue();
        }
    }
    private static reloadSprite() {
        for (let one of this.spriteArr) {
            one._resetValue();
        }
    }

}
//@ts-ignore
window.i18nMgr = i18nMgr;