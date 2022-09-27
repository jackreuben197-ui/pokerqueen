/*
 * @Author: xfj
 * @Date: 2022-09-27 15:57:34
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-27 16:30:49
 * @FilePath: /pokerqueen/assets/script/lobby/upLoadIcon.ts
 */


const { ccclass, property } = cc._decorator;

@ccclass
export default class upLoadIcon extends cc.Component {
    static openFile(sp) {
        return new Promise((resolve, reject) => {
            let input_imageFile = document.getElementById('OpenImageFile');
            if (input_imageFile == null) return;
            // 添加需要处理的代码
            input_imageFile.onchange = (event) => {
                let files = event.target.files;
                let upType = files[0].type;
                if (upType == 'image/gif' || upType.indexOf("image") < 0) {
                    alert('只允许上传图片文件！');
                    reject('只允许上传图片文件！')
                }
                if (files && files.length > 0) {
                    try {
                        let fileReader = new FileReader();
                        fileReader.readAsDataURL(files[0]);
                        //限制允许上传的图片最大为5m
                        if (files[0].size > (1024 * 1024 * 5)) {
                            alert("文件过大，请重新选择");
                            reject('文件过大，请重新选择')
                            return;
                        }
                        fileReader.onload = (event2) => {
                            //读取图片的操作
                            if (fileReader.readyState == fileReader.DONE) {
                                // OpenImageFile.canRepeatUpload();
                                let strImg = event2.target.result;
                                let img = new Image();
                                img.src = strImg;

                                img.onload = () => {
                                    //将读取到图片生成一个可以给sprite使用的texture
                                    let texture = new cc.Texture2D();
                                    texture.initWithElement(img);
                                    sp.spriteFrame = new cc.SpriteFrame(texture);
                                    resolve(strImg);
                                }
                            }
                        };
                    } catch (e) {
                        alert('文件读取失败，请再试一次');
                        return;
                    }
                }

            };
            input_imageFile.click();
        })

    }
}
