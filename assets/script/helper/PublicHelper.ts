
export default class PublicHelper {

    static InitSprite(sprite: cc.Sprite, spriteFrame?: cc.SpriteFrame) {
        sprite.node.color = cc.Color.WHITE;
        sprite.spriteFrame = spriteFrame;
    }
    static InitNode(node: cc.Node, position?: cc.Vec3, active: boolean = true) {
        node.setPosition(position);
        node.setScale(1, 1);
        node.active = active;
    }
}
