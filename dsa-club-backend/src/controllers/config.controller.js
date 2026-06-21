import catchAsync from '../utils/catchAsync.js';
import config from '../config/config.js';
import axios from 'axios';
import AppError from '../utils/AppError.js';

export const getSpeechToken = catchAsync(async (req, res) => {
    try {
        const response = await axios.post(
            `https://${config.azure.speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
            null,
            {
                headers: {
                    'Ocp-Apim-Subscription-Key': config.azure.speechKey,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        res.status(200).json({
            success: true,
            data: {
                token: response.data,
                region: config.azure.speechRegion
            }
        });
    } catch (err) {
        throw new AppError(
            503,
            'AI_SERVICE_UNAVAILABLE',
            'Could not fetch speech token'
        );
    }
});