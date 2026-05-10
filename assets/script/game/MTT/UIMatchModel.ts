import HttpRequest from '../../net/https/HttpRequest';
import { WebRoomCenterMttList } from '../../net/https/WebRequest';

export default class UIMatchModel {

    static get Instance(): UIMatchModel {
        return ((this as any).instance ??= new UIMatchModel());
    }

    //MTT官方赛列表
    public APIMTTRoomList(param: typeof WebRoomCenterMttList.RequestParams) {
        // var requestData = new WebRoomCenterMttList.RequestData()
        // {
        //     offset = offset,
        //         limit = limit,
        //         status = new List < int > { 0, 1},
        //         order = new List < string > { MTTListOrderTypeString.start_asc.ToString() },
        // };
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebRoomCenterMttList,
                body: WebRoomCenterMttList.Request(param),
                onSuccess: function () {
                    resolve(WebRoomCenterMttList.Response);
                }.bind(this),
                onFailure: function (content: any) {
                    reject(content);
                }.bind(this)
            });
        });
    }
}
