import HttpRequest from "../../net/https/HttpRequest";
import { Web_Room_Center_Mtt_list } from "../../net/https/WebRequest";

export default class UIMatchModel {
    static get Instance(): UIMatchModel {
        return (this as any).instance ??= new UIMatchModel;
    }

    //MTT官方赛列表         
    public APIMTTRoomList(param: typeof Web_Room_Center_Mtt_list.RequestParams) {
        // var requestData = new Web_Room_Center_Mtt_list.RequestData()
        // {
        //     offset = offset,
        //         limit = limit,
        //         status = new List < int > { 0, 1},
        //         order = new List < string > { MTTListOrderTypeString.start_asc.ToString() },
        // };
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Room_Center_Mtt_list,
                body: Web_Room_Center_Mtt_list.Request(param),
                onSuccess: function () {
                    resolve(Web_Room_Center_Mtt_list.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
}
