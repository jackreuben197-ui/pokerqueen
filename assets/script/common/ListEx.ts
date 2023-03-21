import List from "./List";

export default class ListEx {
    data: any[] = null;
    offset: number = 0;
    req_ing: boolean = false;
    req_end: boolean = false;
    constructor(public param: { list: List, nullNode?: cc.Node, request?: Function, this?: any } = null) {

        this.reset();
        this.init(param);
    }
    init(param: { list: List, nullNode?: cc.Node, request?: Function, this?: any }) {
        this.param = param;
        param && (param.list.scrollingCB = this.scrolling);
    }
    reset() {
        this.offset = 0;
        this.data = [];
        this.req_ing = false;
        this.req_end = false;
        this.param?.list.scrollView.scrollToTop(0);
    }
    refresh(data: any[], total: number) {
        this.req_ing = false;
        this.data = this.data.concat(data);
        this.offset = this.data.length;
        this.param?.nullNode && (this.param.nullNode.active = this.offset == 0);
        this.param.list.numItems = this.offset;
        if (this.offset >= total) this.req_end = true;
    }
    error() {
        this.req_ing = false;
    }
    scrolling = (scrollView) => {
        if (scrollView) {
            let cur = scrollView.getScrollOffset();
            let max = scrollView.getMaxScrollOffset();
            let isDown = cur.y >= max.y;
            if (isDown) {
                //GC.data.mtt.list.dropDownReq();
                //console.log("滚动到结尾");
                if (!this.req_ing && !this.req_end) {
                    this.dropRequest();
                }
            }
        }
    }
    dropRequest() {
        this.req_ing = true;
        this.param.request?.call(this.param.this, this.offset);
    }
}
