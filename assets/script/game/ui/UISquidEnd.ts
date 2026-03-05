import { UIDefine } from "../../define/UIDefine";
import TimeHelper from "../../helper/TimeHelper";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import UISquidEndItem, { UISquidEndItemShowData } from "./UISquidEndItem";

export interface UISquidEndShowData {
    rows: UISquidEndItemShowData[];
}

const { ccclass } = cc._decorator;

@ccclass
export default class UISquidEnd extends UIBase {
    private content: cc.Node = null;
    private itemTemplate: cc.Node = null;

    private itemPool: cc.Node[] = [];
    private activeItems: cc.Node[] = [];
    private showToken: number = 0;

    protected lateLoad(): void {
        super.lateLoad();
        this.content = cc.find("squidEndDataList/view/content", this.node);
        this.itemTemplate = cc.find("squidEndDataList/view/content/SquidEndData", this.node);
        if (this.itemTemplate) {
            this.itemTemplate.active = false;
            this.GetItemComp(this.itemTemplate);
        }
    }

    public onShow(param?: UISquidEndShowData): void {
        super.onShow(param);
        this.StartShowRows(param?.rows || []);
        this.StartAutoCloseTimer();
    }

    public lateClose(): void {
        super.lateClose();
        this.showToken++;
        this.unscheduleAllCallbacks();
        this.RecycleActiveItems();
    }

    private async StartShowRows(rows: UISquidEndItemShowData[]): Promise<void> {
        const token = ++this.showToken;
        this.RecycleActiveItems();
        if (!this.content || !this.itemTemplate) {
            return;
        }

        for (let i = 0; i < rows.length; i++) {
            const node = this.GetItemNode();
            node.parent = this.content;
            node.active = false;
            this.GetItemComp(node).Refresh(rows[i]);
            this.activeItems.push(node);
        }

        this.content?.getComponent(cc.Layout)?.updateLayout();

        for (let i = 0; i < this.activeItems.length; i++) {
            if (token !== this.showToken || !this.node?.isValid || !this.node.activeInHierarchy) {
                return;
            }
            this.activeItems[i].active = true;
            this.content?.getComponent(cc.Layout)?.updateLayout();
            await TimeHelper.Sleep(66);
        }
    }

    private StartAutoCloseTimer(): void {
        this.unschedule(this.OnAutoClose);
        this.scheduleOnce(this.OnAutoClose, 5);
    }

    private readonly OnAutoClose = () => {
        UIComponent.close(UIDefine.UISquidEnd);
    };

    private GetItemNode(): cc.Node {
        if (this.itemPool.length > 0) {
            const node = this.itemPool.shift();
            if (node) {
                return node;
            }
        }
        if (!this.itemTemplate) {
            return new cc.Node("SquidEndData");
        }
        return cc.instantiate(this.itemTemplate);
    }

    private RecycleActiveItems(): void {
        while (this.activeItems.length > 0) {
            const node = this.activeItems.shift();
            if (!node || !node.isValid) {
                continue;
            }
            node.active = false;
            node.removeFromParent(false);
            this.itemPool.push(node);
        }
    }

    private GetItemComp(node: cc.Node): UISquidEndItem {
        let comp = node.getComponent(UISquidEndItem);
        if (!comp) {
            comp = node.addComponent(UISquidEndItem);
        }
        return comp;
    }
}
