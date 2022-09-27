/*
 * @Author: xfj
 * @Date: 2022-09-14 19:01:53
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-27 17:44:26
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UICreatelabor.ts
 */

import { UIDefine } from "../../define/UIDefine";
import { i18nMgr } from "../../i18n/i18nMgr";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
import upLoadIcon from "../upLoadIcon";
import { UIClubModel } from "./UIClubModel";



const { ccclass, property } = cc._decorator;

@ccclass
export default class UICreatelabor extends BaseForm {
    @property(cc.EditBox)
    editName: cc.EditBox = null;

    @property(cc.EditBox)
    editjieshao: cc.EditBox = null;

    @property(cc.EditBox)
    xinxi: cc.EditBox = null;

    @property(cc.Sprite)
    camera: cc.Sprite = null;

    protected lateLoad(): void {
        super.lateLoad();
    }
    async onShow(param?: any, fromUI?: BaseForm) {
        super.onShow(param, fromUI);
        this.editName.string = ''
        this.editjieshao.string = ''
        this.xinxi.string = ''

    }
    async commitClick() {
        if (this.editName.string == '') {
            UIComponent.Instance.Toast(i18nMgr.Get('UIClub_Creat_4vH7wQnp'))
            return
        }
        if (this.editjieshao.string == '') {
            UIComponent.Instance.Toast(i18nMgr.Get('UIClub_Creat_W1qXZpQJ'))
            return
        }
        if (this.xinxi.string == '') {
            UIComponent.Instance.Toast(i18nMgr.Get('club_creat_7'))
            return
        }
        let data: any = await UIClubModel.mInstance.APIOrgClubCreate('http://static.awanptesting.com/awanptesting-dev/image-normal/20220816022147-IDFhc.jpg', this.editName.string, this.editjieshao.string, this.xinxi.string)
        if (data.code == 0 && data?.data?.club_apply) {
            console.log('data===', data);
            UIComponent.Instance.Toast(i18nMgr.Get('club_creat_8'));
            this.close();
            // UIComponent.Instance.Toast(i18nMgr.Get('club_tribe_0'));
            // await UIClubModel.mInstance.APIOrgClubGet()
            // UIComponent.open(UIDefine.UILaborPlayViewForm)
            return;
        }
        else {
            UIComponent.Instance.Toast(data.code);
        }
    }
    async uploadIcon() {
        let _data = await upLoadIcon.openFile(this.camera);
        console.log('uploadIcon_OpenImageFile===', _data);
        UIClubModel.mInstance.APIOrgClubUploadIcon(_data);
        // let _data2 = this.base64to2(_data)
        // console.log('uploadIcon_OpenImageFile===', _data2);

    }
    // base64编码表

    base64to2(base64) {
        const map = { "0": 52, "1": 53, "2": 54, "3": 55, "4": 56, "5": 57, "6": 58, "7": 59, "8": 60, "9": 61, "A": 0, "B": 1, "C": 2, "D": 3, "E": 4, "F": 5, "G": 6, "H": 7, "I": 8, "J": 9, "K": 10, "L": 11, "M": 12, "N": 13, "O": 14, "P": 15, "Q": 16, "R": 17, "S": 18, "T": 19, "U": 20, "V": 21, "W": 22, "X": 23, "Y": 24, "Z": 25, "a": 26, "b": 27, "c": 28, "d": 29, "e": 30, "f": 31, "g": 32, "h": 33, "i": 34, "j": 35, "k": 36, "l": 37, "m": 38, "n": 39, "o": 40, "p": 41, "q": 42, "r": 43, "s": 44, "t": 45, "u": 46, "v": 47, "w": 48, "x": 49, "y": 50, "z": 51, "+": 62, "/": 63 }

        let len = base64.length * .75 // 转换为int8array所需长度
        base64 = base64.replace(/=*$/, '') // 去掉=号（占位的）

        const int8 = new Int8Array(len) //设置int8array视图
        let arr1, arr2, arr3, arr4, p = 0

        for (let i = 0; i < base64.length; i += 4) {
            arr1 = map[base64[i]] // 每次循环 都将base644个字节转换为3个int8array直接
            arr2 = map[base64[i + 1]]
            arr3 = map[base64[i + 2]]
            arr4 = map[base64[i + 3]]
            // 假设数据arr 数据 00101011 00101111 00110011 00110001
            int8[p++] = arr1 << 2 | arr2 >> 4
            // 上面的操作 arr1向左边移动2位 变为10101100
            // arr2 向右移动4位：00000010
            // | 为‘与‘操作: 10101110
            int8[p++] = arr2 << 4 | arr3 >> 2
            int8[p++] = arr3 << 6 | arr4

        }
        return int8
    }

    // update (dt) {}
}
