//avatar:http://static.awanptesting.com/image-normal/20220310094704-gzJFs.png
const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMine extends cc.Component {
    public view = {};
    private pageData: any = null;
    onLoad() {
        this.load_all_object(this.node);
        this.setMine(null);
        cc.log(this.view);
    }
    setMine(param: any): void {
        let testData =
        {
            "code": 0,
            "message": "",
            "data":
            {
                "user":
                {
                    "user_id": 3733, "area": "886", "phone": "18601113024", "status": 1
                    , "forbid": 1, "lc": 13, "lt": "2022-07-04T02:13:55Z", "ut": 1,
                    "forbid_bring_in": 2, "forbid_withdraw_gold": 2, "description": "",
                    "ub_operator_id": 0, "w_u_id": 3733, "gold": 0, "gold_lock": 0,
                    "wallet_status": 1, "p_u_id": 3733, "un_id": 93323898, "nickname": "Player",
                    "avatar": "http://static.awanptesting.com/image-normal/20220310094704-gzJFs.png",
                    "sex": 2, "birthday": null, "country": "", "city": "", "province": "",
                    "platform": 2, "mnt": 0, "mat": 0, "operator_id": 0
                }
            }
        }
        this.pageData = testData.data.user;
        //设置用户的头像 nickname id  
        this.loadRawImage(this.pageData.avatar).then((frame: cc.SpriteFrame) => {
            this.view["img_head"].getComponent(cc.Sprite).spriteFrame = frame;
        })
        this.view["text_name"].getComponent(cc.Label).string = this.pageData.nickname;
        this.view["text_userID"].getComponent(cc.Label).string = "ID:" + this.pageData.user_id;
        let listArr = ["我的钱包", "我的背包", "我的消息", "设置", "设置", "设置"];
        for (let i = 0; i < listArr.length; i++) {
            let key = listArr[i];
            let item: cc.Node = cc.instantiate(this.view["item"]);
            let text: cc.Label = item.getChildByName("item_text").getComponent(cc.Label);
            text.string = key;
            item.active = true;
            this.view["content"].addChild(item);
        }
        // console.log(this.view["bg"].$Sprite)
    }
    /**
   * @description: 
   * @param {string} img:远程图片url地址
   * @return {*}
   */
    private loadRawImage(img: string): Promise<cc.SpriteFrame> {
        //异步的写一个promise
        return new Promise(function (resolve, reject) {
            cc.assetManager.loadRemote(img, { ext: '.png' }, function (err, texture: cc.Texture2D) {
                if (err) {
                    reject(img + " load error")
                } else {
                    texture.packable = false;
                    let frame = new cc.SpriteFrame(texture);
                    resolve(frame);
                }
            });
        })
    }
    load_all_object(root: cc.Node): void {
        for (let i = 0; i < root.childrenCount; i++) {
            let child: cc.Node = root.children[i];
            this.view[root.children[i].name] = child;
            this.load_all_object(root.children[i]);
        }
    }
}
