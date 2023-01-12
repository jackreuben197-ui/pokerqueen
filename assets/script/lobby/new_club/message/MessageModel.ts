
export default class MessageModel {
    public static get Instance(): MessageModel {
        return (this as any).__Instance ??= new MessageModel();
    }
    public Option_Text = ["系统消息", "公会消息", "联盟消息", "带入申请"];
    //序号对应请求类型 消息类型:1-bag,2-club,3-money,4-system,5-tribe
    public MessageType = [4, 2, 5];
    //消息类型对饮的选项序号
    public IndexByMessage = [0, 0, 1, 0, 0, 2];

    //玩法类型 1 NLH 2 PLO 3 6+
    public GameType = ["", "NLH", "PLO", "6+"];

    //进入消息总列表来源类型 enterType:入口类型 0:朋友桌消息入口 1:公会消息入口 2:我的消息入口
    public enterType: number = 0;

    //未读列表 0已读 1未读
    public unreadList = [0, 0, 0, 0, 0, 0];
}
