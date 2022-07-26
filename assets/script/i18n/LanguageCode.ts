
export default class LanguageCode {

    static getServerErrorCode(code: number): string {
        return `ServerErrorCode_${code}`;
    }
    static getAdaptation(code: number): string {
        return `adaptation${code}`;
    }
}
