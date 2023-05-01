import { Choice, Condition, CustomState, JsonPath, LogLevel, StateMachine, StateMachineType } from "aws-cdk-lib/aws-stepfunctions";
import { Stack, StackContext, Table, use } from "sst/constructs";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { DynamoAttributeValue, DynamoDeleteItem, DynamoGetItem, DynamoPutItem } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { SimpleTable } from "./Table";

export function StepFunction({ stack }: StackContext) {
    const table = use(SimpleTable);
    return getStateMachine(stack, table);
}

function getStateMachine(stack: Stack, table: Table) {
    const logGroup = new LogGroup(stack, 'Crud-State-Machine-Log-Group1');

    const scanStateJson = {
        "Type": "Task",
        "Parameters": {
            "TableName": table.cdk.table.tableName
        },
        "Resource": "arn:aws:states:::aws-sdk:dynamodb:scan",
    };
    const scan = new CustomState(stack, 'Scan', {
        stateJson: scanStateJson,
    });

    const createItem = new DynamoPutItem(stack, 'Create Item', {
        table: table.cdk.table,
        item: {
            pk: DynamoAttributeValue.fromString(JsonPath.stringAt('States.UUID()')),
            sk: DynamoAttributeValue.fromString('METADATA#'),
            data: DynamoAttributeValue.mapFromJsonPath('$.body'),
        },
        resultPath: JsonPath.DISCARD,
    });

    const getItem = new DynamoGetItem(stack, 'Get Item', {
        table: table.cdk.table,
        key: {
            pk: DynamoAttributeValue.fromString(JsonPath.stringAt('$.path.id')),
            sk: DynamoAttributeValue.fromString('METADATA#'),
        },
    });

    const updateItem = new DynamoPutItem(stack, 'Update Item', {
        table: table.cdk.table,
        item: {
            pk: DynamoAttributeValue.fromString(JsonPath.stringAt('$.path.id')),
            sk: DynamoAttributeValue.fromString('METADATA#'),
            data: DynamoAttributeValue.mapFromJsonPath('$.body'),
        },
        resultPath: JsonPath.DISCARD,
    });

    const deleteItem = new DynamoDeleteItem(stack, 'DynamoDB DeleteItem', {
        table: table.cdk.table,
        key: {
            pk: DynamoAttributeValue.fromString(JsonPath.stringAt('$.path.id')),
            sk: DynamoAttributeValue.fromString('METADATA#'),
        },
    });

    const checkHttpMethod = new Choice(stack, 'Check HTTP Method')
        .when(Condition.stringMatches('$.requestContext.httpMethod', 'POST'), createItem)
        .otherwise(scan);
    const checkHttpMethodWithId = new Choice(stack, 'Check HTTP Method with ID')
        .when(Condition.stringMatches('$.requestContext.httpMethod', 'PUT'), updateItem)
        .when(Condition.stringMatches('$.requestContext.httpMethod', 'DELETE'), deleteItem)
        .otherwise(getItem);
    const doesIdExist = new Choice(stack, 'Does ID exist?')
        .when(Condition.isPresent('$.path.id'), checkHttpMethodWithId)
        .otherwise(checkHttpMethod);

    const definition = doesIdExist;

    const stateMachine = new StateMachine(stack, "builtstatemachine", {
        definition,
        stateMachineType: StateMachineType.EXPRESS,
        logs: {
            destination: logGroup,
            level: LogLevel.ALL,
            includeExecutionData: true,
        },
        tracingEnabled: true,
    });
    table.cdk.table.grantReadWriteData(stateMachine);
    return stateMachine;
}