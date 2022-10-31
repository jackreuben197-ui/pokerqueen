import { GameConfig } from "../../config/GameConfig";
import CCTools from "../../tools/CCTools";
import GC from "../GameControl";
import FaceBookApi from "../sdk/FaceBookApi";
import GoogleApi from "../sdk/GoogleApi";
import InstagramApi from "../sdk/InstagramApi";

export default class SDKManager {
    private static _instance: SDKManager = null;
    static get instance() {
        if (!SDKManager._instance) {
            SDKManager._instance = new SDKManager();
        }
        return SDKManager._instance;
    }

    init() {
        GoogleApi.init();
    }

    googleRenderBtn() {
        GoogleApi.renderBtn();
    }

    googleLogin() {
        GoogleApi.prompt();
    }

    faceBookLogin() {
        FaceBookApi.login();
    }

    instagramLogin() {
        InstagramApi.login();
    }

}