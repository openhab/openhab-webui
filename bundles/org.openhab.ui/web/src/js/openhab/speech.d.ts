declare namespace _default {
    function isRecognitionSupported(): boolean;
    function startRecognition(lang: any, startCallback: any, errorCallback: any, activityCallback: any, resultCallback: any, endCallback: any): void;
    function stopRecognition(): void;
}
export default _default
