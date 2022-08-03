import { i18nMgr } from "./i18nMgr";

export default class LanguageCode {

    
    // static LanguageDescription(code: number): string {
    //     return `adaptation${code}`;
    // }

    public static ServerErrorDescription(errorCode: number): string {
        let errDes = i18nMgr.getLabelFromLO(`ServerErrorCode_${errorCode}`);
        if (errDes == null) {
            errDes = `${i18nMgr.getLabelFromLO("errorDefault")}(${errorCode})`
        }
        return errDes;
    }
    public static LanguageDescription(LanguageCode:number, strParams = null):string
        {
            let errDes = i18nMgr.getLabelFromLO(`adaptation${LanguageCode}`);
            //LanguageManager.Get($"adaptation{LanguageCode}");

            if (errDes == null)
            {
                errDes = `LanguageCodeIsNull(${LanguageCode})`;
            }

            if (null == strParams) return errDes;
           

            // if (strParams.Count == 1)
            // {
            //     errDes = errDes.Replace("##", strParams[0].ToString());
            //     return errDes;
            // }

            // if (strParams.Count > 1)
            // {

            //     string[] sl = errDes.Split(new string[] { "##" }, StringSplitOptions.None);//把多语言配置的长字符分割
            //     if (null == sBuilder)
            //         sBuilder = new StringBuilder();
            //     if (sBuilder.Length > 0)
            //         sBuilder.Clear();
            //     // string newStr = "";
            //     for (int i = 0; i < sl.Length; i++)
            //     {
            //         sBuilder.Append(sl[i]);
            //         if (i < strParams.Count)
            //             sBuilder.Append(strParams[i]);

            //     }

            //     return sBuilder.ToString();
            // }

            return errDes;

        }
}
