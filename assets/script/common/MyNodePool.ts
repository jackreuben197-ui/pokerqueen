/**
 * 简陋节电池
 */
export default class SimpleNodePool {
    private pool: cc.Node[] = [];
    //模板节点
    constructor(public tempNode) {
    }
    GetNode(): cc.Node {
        if (this.pool.length) return this.pool.shift();
        return cc.instantiate(this.tempNode);
    }
    BackNode(node: cc.Node): void {
        this.pool.push(node);
        node.parent = null;
    }

}
