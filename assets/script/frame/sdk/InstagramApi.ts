import { TSendInfo } from "../../config/TTypeConfig";
import { HttpLink } from "../../net/https/HttpLink";



export default class InstagramApi {
    static login() {
        console.log("==========> Instagram login : ")
        let sendInfo: TSendInfo = {
            cuscomHost: "https://api.instagram.com",
            api: "/oauth/authorize",
            isGet: true,
            body: {
                client_id: 684477648739411,
                redirect_uri: "http://localhost:7456/build/",
                scope: "user_profile, user_media",
                response_type: "code",
            }
        }
        HttpLink.instance.reqServe(sendInfo);
    }

}