import { AccessLogFormat, LogGroupLogDestination, RestApi, StepFunctionsIntegration, StepFunctionsRestApi, StepFunctionsRestApiProps } from "aws-cdk-lib/aws-apigateway";
import { Api, ApiGatewayV1Api, StackContext, use } from "sst/constructs";
import { StepFunction } from "./StepFunction";
import { StateMachine } from "aws-cdk-lib/aws-stepfunctions";
import { Fn } from "aws-cdk-lib";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { Grant } from "aws-cdk-lib/aws-iam";

export function API({ stack }: StackContext) {
  const cfnStateMachine = use(StepFunction);
  // const stateMachine = StateMachine.fromStateMachineName(stack, "CrudStateMachine1", cfnStateMachine.ref);
  // const stateMachineArn = Fn.importValue("CrudStateMachineArn");
  // const stateMachine = StateMachine.fromStateMachineArn(stack, "CrudStateMachine", stateMachineArn);
  const stateMachine = cfnStateMachine;
  const apiLogGroup = new LogGroup(stack, 'Api-Gateway-Log-Group');

  const apiProps: StepFunctionsRestApiProps = {
    restApiName: "sfnAPI",
    stateMachine,
    querystring: true,
    path: true,
    headers: true,
    requestContext: {
      httpMethod: true,
    },
    deployOptions: {
      accessLogDestination: new LogGroupLogDestination(apiLogGroup),
      accessLogFormat: AccessLogFormat.jsonWithStandardFields(),
    },
  }

  const defaultIntegration = StepFunctionsIntegration.startExecution(stateMachine, {
    credentialsRole: apiProps.role,
    requestContext: apiProps.requestContext,
    path: apiProps.path ?? true,
    querystring: apiProps.querystring ?? true,
    headers: apiProps.headers,
    authorizer: apiProps.authorizer,
  });
  const restApi = new RestApi(stack, "restApi", {
    defaultIntegration,
    deployOptions: {
      accessLogDestination: new LogGroupLogDestination(apiLogGroup),
      accessLogFormat: AccessLogFormat.jsonWithStandardFields(),
    },
  });
  const envRes = restApi.root.addResource('environment');
  envRes.addMethod('ANY');
  envRes.addResource('{id}').addMethod('ANY');

  stack.addOutputs({
    ApiEndpoint: restApi.url,
  });
  return restApi;
}
