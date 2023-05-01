import { APIGatewayProxyEvent, Callback, Context } from 'aws-lambda';
import axios, { AxiosRequestConfig } from 'axios';
import logger from './util/logger';

interface HttpApiEvent extends  APIGatewayProxyEvent{
	config?: AxiosRequestConfig<any>;
	enableLog?: boolean;
}

function cleanConfig(config: AxiosRequestConfig<any>) {
	if (config?.data && Object.keys(config.data).length < 1) {
		delete config.data;
	}
	return config;
}

export async function handler(event: HttpApiEvent, context: Context, callback: Callback) {
	logger.logWithTenantContext(event, context, 'Received: ', {event});
	try {
		const config = event?.config;
		if (event?.enableLog) {
			logger.debug('Making a request with config: ', {config});
		}

		if (!config) {
			throw Error('Missing HTTP request config in the input.')
		}
		const validatedConfig = cleanConfig(config);

		const response = await axios(validatedConfig);

		if (event?.enableLog) {
			logger.debug(`Received response status ${response?.status}`, response?.data)
		}

		if (!response) {
			callback('EMPTY_RESPONSE');
			return;
		}

		callback(null,{
			status: response.status,
			headers: response.headers,
			response: response.data,
		});
	} catch (error) {
		logger.error(error);
		callback(JSON.stringify({
			statusCode: error?.response?.status,
			errors: [{
				errorMessage: error.message,
				data: error?.response?.data,
			}],
		}));
		return;
	}
}