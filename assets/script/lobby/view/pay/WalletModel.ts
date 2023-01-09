//钱包数据
export default class WalletModel {
    public static get Instance(): WalletModel {
        return (this as any).__Instance ??= new WalletModel();
    }
    public Gold: string = "0";
    public USDT: string = "0";
}
