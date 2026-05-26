export default class UIViewUtil {

    // caculatePostion 计算任意一个节点TargetNode, 针对当前节点的坐标
    public static caculatePostion(originalNode: cc.Node, targetNode: cc.Node): cc.Vec2 {
        // 世界坐标
        const worldPos = targetNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
        // 转化为本地的
        const localPos = originalNode.parent.convertToNodeSpaceAR(worldPos);
        return localPos;
    }
}
