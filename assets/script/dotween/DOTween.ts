export class DOTween {

    static Sequence(node: cc.Node): Tweener {
        return new Tweener(node);
    }
}
export class Tweener {

    private _tween: cc.Tween = null;

    constructor(node: cc.Node) {

    }

}

