import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import { api } from './api';

export const createRecognizer = async (cachedToken = null, cachedRegion = null) => {
    let token = cachedToken;
    let region = cachedRegion;

    if (!token || !region) {
        const data = await api.get('/config/speech-token');
        token = data.token;
        region = data.region;
    }

    const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(token, region);
    speechConfig.speechRecognitionLanguage = 'en-US';

    // auto end after 3 seconds of silence
    speechConfig.setProperty(
        SpeechSDK.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs,
        '10000'
    );
    // give up if no speech detected within 15 seconds
    speechConfig.setProperty(
        SpeechSDK.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs,
        '15000'
    );

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

    return recognizer;
};