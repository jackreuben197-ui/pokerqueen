/*
 * @Author: xfj
 * @Date: 2022-09-27 15:57:34
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-28 18:38:51
 * @FilePath: /pokerqueen/assets/script/lobby/upLoadIcon.ts
 */
//index.html  里边加入这个
// <input id="OpenImageFile" type="file" accept=".png, .jpg, .jpeg" style="visibility: hidden">


const { ccclass, property } = cc._decorator;

@ccclass
export default class upLoadIcon extends cc.Component {
    static openFile() {
        return new Promise((resolve, reject) => {
            let input_imageFile = document.getElementById('OpenImageFile');
            if (input_imageFile == null) return;
            // 添加需要处理的代码
            input_imageFile.onchange = (event) => {
                //@ts-ignore
                let files = event.target.files;
                resolve(files[0]);
                let upType = files[0].type;
                if (upType == 'image/gif' || upType.indexOf("image") < 0) {
                    alert('只允许上传图片文件！');
                    reject('只允许上传图片文件！')
                }
                // if (files && files.length > 0) {
                //     try {
                //         let fileReader = new FileReader();
                //         fileReader.readAsBinaryString(files[0]);
                //         fileReader.onload = (event2) => {
                //             //读取图片的操作
                //             if (fileReader.readyState == fileReader.DONE) {
                //                 let strImg = event2.target.result;
                //                 resolve(strImg);
                //             }
                //         };
                //     } catch (e) {
                //         alert('文件读取失败，请再试一次');
                //         return;
                //     }
                // }

            };
            input_imageFile.click();
        })

    }
}
