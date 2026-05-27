
export default abstract class UIComponentBase<T> extends cc.Component {
    public abstract initialize(param: T):void;
    public abstract onClose<K>(param:K): void;
}