import { table } from "console";
import BaseFormPlus from "../../ui/form/BaseFormPlus";
import UITableTemplate from "./UITableTemplate";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIPokerListItem extends cc.Component {

    @property(cc.Prefab)
    pokerTablePrefab : cc.Prefab = null;

    //
    // 界面细节信息：
    @property(cc.Label)
    protected cc_Label$gametype : cc.Label = null;
    @property(cc.Label)
    protected cc_Label$sbinfo : cc.Label = null;
    @property(cc.Label)
    protected cc_Label$tablenum : cc.Label = null;
    @property(cc.Label)
    protected cc_Label$usernum : cc.Label = null;

    @property(cc.Node)
    protected $dropdownBtn: cc.Node = null;

    @property(cc.Node)
    protected $tableLayout: cc.Node = null;

    protected onLoad(): void {

        if (this.$dropdownBtn)
            this.$dropdownBtn.on(cc.Node.EventType.TOUCH_END, this.onDropDownBtn, this);
    }

    protected onDropDownBtn() {
        if( this.$tableLayout ){
            this.$tableLayout.active = !this.$tableLayout.active;
        }
    }

    protected getGTypeStr( type : number ) : string{
        switch( type ){
            case 0:
                return "德州";
            case 1:
                return "奥马哈四张";
            case 2:
                return "奥马哈五张";
            case 6:
                return "6+";
            default:
                return type.toString();
        }
    }

    /**
     * 设置当前List需要的数据
     * @param data
     */
    public setListData(data: Array<any>): void {
        if (data&&data.length>0) {
            let tblNum : number = data.length;
            let userNum : number = 0;
            for( let ti : number = 0;ti<data.length;ti ++ ){
                userNum += data[ti].users.length;
            }

            this.cc_Label$gametype.string = this.getGTypeStr( data[0].game_type ) + "_" + data[0].poker_type;
            this.cc_Label$sbinfo.string = data[0].sb + "/" + data[0].sb*2;
            this.cc_Label$tablenum.string = tblNum + "桌";
            this.cc_Label$usernum.string = userNum + "人";

            //
            // 给桌子加数据：
            for( let tblidx : number = 0;tblidx<tblNum;tblidx ++ ){
                let table : cc.Node = cc.instantiate( this.pokerTablePrefab );
                let script : UITableTemplate = table.getComponent( UITableTemplate );
                debugger;
                script.setTableData( data[tblidx] );

                this.$tableLayout.addChild(table);
            }
        }
    }


}
