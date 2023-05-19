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
export default class upLoadIcon {

    static get Instance(): upLoadIcon {
        return (<any>this).instance ??= new upLoadIcon();
    }

    public get drawImg(): any {
        return this._drawImg ??= new Image();
    }

    private _drawImg: any;
    //画布大小
    private map_w = 200;
    private map_h = 200;

    //private img: HTMLImageElement = new Image();

    public openFile() {
        return new Promise((resolve, reject) => {
            let input_imageFile = document.getElementById('OpenImageFile');
            if (input_imageFile == null) return;
            let _this = this;
            let img = this.drawImg;
            // 添加需要处理的代码
            input_imageFile.onchange = (event) => {
                //@ts-ignore
                let files = event.target.files;
                //resolve(files[0]);
                let upType = files[0].type;
                if (upType == 'image/gif' || upType.indexOf("image") < 0) {
                    alert('只允许上传图片文件！');
                    reject('只允许上传图片文件！');
                }
                else {
                    var reader = new FileReader();
                    //reader.readAsBinaryString(files[0]);
                    reader.readAsDataURL(files[0]);
                    reader.onload = function () {
                        img.src = this.result; //在这里获取base64码
                        img.onload = function () {
                            console.log("图片 onload");
                            let w = _this.map_w;
                            let h = _this.map_h;
                            let rect = [0, 0, w, h];
                            //如果宽度大于高度，按照高度等比缩放
                            if (img.width > img.height) {
                                rect[2] = h / img.height * img.width;
                                rect[3] = h;
                                rect[0] = -(rect[2] - h) / 2;
                            } else {
                                rect[3] = w / img.width * img.height;
                                rect[2] = w;
                                rect[1] = -(rect[3] - w) / 2;
                            }
                            console.log("最后图片尺寸", rect)
                            ////////////////////////
                            let canvas: any = document.getElementById('drawCanvas');
                            let context = canvas.getContext('2d');
                            canvas.width = w;
                            canvas.height = h;
                            context.drawImage(img, rect[0], rect[1], rect[2], rect[3]);
                            //缩小画布，毕竟手机拍下来的图片都是几千像素乘几千像素的大小
                            let base64Img = canvas.toDataURL(upType, 0.92);     //canvas生成后通过toDataURL获取canvas 处理后的其base64码，并自定义其画质，此处是0.5
                            let PicBlob = _this.getBlobBydataURI(base64Img, upType); //转成文件流方便上传服务器
                            resolve(PicBlob);
                        }
                    }
                }
            };
            input_imageFile.click();
        })
    }
    private getBlobBydataURI(dataURI, type) {
        var binary = atob(dataURI.split(',')[1]);
        var array = [];
        for (var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        return new Blob([new Uint8Array(array)], { type: type });
    }

}
