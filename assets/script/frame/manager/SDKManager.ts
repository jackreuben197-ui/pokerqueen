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
        if (!GameConfig.debug) {
            GoogleApi.init();
        }
    }

    googleRenderBtn() {
        if (!GameConfig.debug) {

            GoogleApi.renderBtn();
        }
    }

    googleLogin() {
        if (!GameConfig.debug) {

            GoogleApi.prompt();
        }
    }

    faceBookLogin() {
        if (!GameConfig.debug) {
            FaceBookApi.login();
        }
    }

    instagramLogin() {
        if (!GameConfig.debug) {
            InstagramApi.login();
        }
    }

}