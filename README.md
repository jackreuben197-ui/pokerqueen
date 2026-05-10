# pokerqueen

## 子模块更新 

git submodule update --init --recursive --remote

## 同步Hybrid代码

```shell
# h5 code sync
npm run sync:h5-game #pnpm run sync:h5-game
# protocol sync (pb)
npm run sync:proto
```

## 格式化代码

```shell
#可能缺失pretty，需要 npm install
node ./fmt-blanklines.js
```

## SSH密匙使用方法
1.
```
ssh-keygen -t rsa -C "你在gitee/github/gitlab上注册帐号时填写的邮箱"
```
SSH密匙生成命令,一路回车  

2.
```
C:\Users\Admin\.ssh\id_rsa.pub
```
打开文件 -> 拷贝内容至gitlab/github 网站上添加SSH   

3.clone库代码，私钥指向 C:\Users\Admin\.ssh\id_rsa 文件   

4.完成

## 开发工具
cocoscreator 2.4.8
## 设计分辨率
1125x2436

## protobuf 安装和使用（备忘）

1.安装protobufjs到全局   

npm install -g protobufjs   

将模块安装到全局方便全局使用protobufjs提供的pbjs命令行工具。   

pbjs可以将proto原文件转换成json、js   

pbts，用来将转化后的js文件转为ts   

2.把下载好的protobuf中这个文件夹下的protobuf.js文件 把这个文件拖到Creator工程中并且导入为插件   

3.创建.proto消息文件
```
package ntesgame;

message ClientRegister {
    required string userId = 1;
    repeated string deviceId = 2;
    option string userToken = 3;
}
```
ntesgame 是包名，转换成js 或ts 后就是 命名空间   

ClientRegister 是 消息结构   

required 是 必须有的变量   

4.
在保存proto文件的目录下打开命令行执行如下命令   

将文件中所有的.proto文件转化为一个proto.js文件）   

pbjs -t static-module -w commonjs -o proto.js *.proto   

将proto.js文件 转为 proto.d.t文件   
pbts -o proto.d.ts proto.js   

5.protobuf设置为插件后 修改proto.js中protobuf的引用   
```
var $protobuf = protobuf
```
6.然后把proto.js 或 proto.d.ts文件放入项目代码目录中 即可   

7.测试
```
@ccclass
export default class NewClass extends cc.Component {


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        let msg = ntesgame.ClientRegister.create({userId:"123",deviceId:"22",userToken:"ff"})
        let encode = ntesgame.ClientRegister.encode(msg).finish();
        console.log("编码:",JSON.stringify(encode))
        this.scheduleOnce(()=>{
            let decode = ntesgame.ClientRegister.decode(encode)
            console.log("解码：",JSON.stringify(decode))

        },3)
    }

    // update (dt) {}
}

```

8. Md5库安装

npm install ts-md5 --save  

```

9. 其它内容: