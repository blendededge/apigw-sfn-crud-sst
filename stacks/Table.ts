import { RemovalPolicy } from "aws-cdk-lib";
import { StackContext, Table } from "sst/constructs";

export function SimpleTable({ stack }: StackContext) {
    const table = new Table(stack, "tablestore", {
        fields: {
            pk: 'string',
            sk: 'string',
        },
        primaryIndex: {
            partitionKey: "pk",
            sortKey: "sk",
        },
        cdk: {
            table: {
                // This is only for demo purposes. Do not use this in production.
                removalPolicy: RemovalPolicy.DESTROY,
            }
        }
    });
    stack.addOutputs({
        TableName: table.tableName,
    });
    return table;
}
