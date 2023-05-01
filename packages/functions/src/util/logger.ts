import { Logger } from '@aws-lambda-powertools/logger/lib/Logger';
import { LogItemExtraInput, LogItemMessage } from '@aws-lambda-powertools/logger/lib/types';
import { Context, DynamoDBStreamEvent, EventBridgeEvent, SNSEvent, SQSEvent } from 'aws-lambda';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';
const logger = new Logger();

/** Log debug messages
*/
function debug(logMessage: LogItemMessage, ...extraInput: LogItemExtraInput) {
    //logger.structure_logs(append=True, tenant_id=tenant_id)
	if (extraInput) {
		logger.debug(logMessage, {extraInput});
	} else {
		logger.debug(logMessage);
	}
}
/** Log info messages
*/
function info(logMessage: LogItemMessage, ...extraInput: LogItemExtraInput) {
    //logger.structure_logs(append=True, tenant_id=tenant_id)
	if (extraInput) {
		logger.info(logMessage, {extraInput});
	} else {
		logger.info(logMessage);
	}
}
/** Log warn messages
*/
function warn(logMessage: LogItemMessage, ...extraInput: LogItemExtraInput) {
    //logger.structure_logs(append=True, tenant_id=tenant_id)
	if (extraInput) {
		logger.warn(logMessage, {extraInput});
	} else {
		logger.warn(logMessage);
	}
}
/** Log error messages
*/
function error(logMessage: LogItemMessage, ...extraInput: LogItemExtraInput) {
	//logger.structure_logs(append=True, tenant_id=tenant_id)
	if (extraInput) {
		logger.error(logMessage, {extraInput});
	} else {
		logger.error(logMessage)
	}
}
/** Log with tenant context. Extracts tenant context from the lambda events
*/
function log_with_tenant_context(event: APIGatewayProxyEvent | SNSEvent | SQSEvent | DynamoDBStreamEvent | EventBridgeEvent<any, any>, context: Context, logMessage: LogItemMessage, ...extraInput: LogItemExtraInput) {
	addContext(context);
	appendKeys(event);
	if (extraInput) {
		logger.info(logMessage, {extraInput});
	} else {
		logger.info(logMessage);
	}
}

function addContext(context: Context) {
	if (context) {
		logger.addContext(context);
	}
}

function appendKeys(event: APIGatewayProxyEvent | SNSEvent | SQSEvent | DynamoDBStreamEvent | EventBridgeEvent<any, any>) {
	if (event && isAPIGatewayProxyEvent(event) && event.requestContext && event.requestContext.authorizer) {
		logger.appendKeys({
			accountId: event?.requestContext?.authorizer?.tenantId,
			apiKeyId: event?.requestContext?.identity?.apiKeyId,
			requestId: event?.requestContext?.requestId,
			path: event?.requestContext?.path,
			httpMethod: event?.requestContext?.httpMethod,
			userName: event?.requestContext?.authorizer?.userName,
			userRole: event?.requestContext?.authorizer?.userRole,
			pathParameters: event?.pathParameters? JSON.stringify(event?.pathParameters) : '',
		});
	}
}

function isAPIGatewayProxyEvent(event: any): event is APIGatewayProxyEvent {
	return (event as APIGatewayProxyEvent).requestContext !== undefined;
}

export default {
	debug,
	info,
	warn,
	error,
	logWithTenantContext: log_with_tenant_context,
	addContext,
}