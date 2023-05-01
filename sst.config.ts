import { SSTConfig } from "sst";
import { API } from "./stacks/API";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { SimpleTable } from "./stacks/Table";
import { StepFunction } from "./stacks/StepFunction";

export default {
  config(_input) {
    return {
      name: "apigw-sfn-transformation",
      region: "us-east-2",
    };
  },
  stacks(app) {
    app.stack(SimpleTable)
    .stack(StepFunction)
    .stack(API);
  }
} satisfies SSTConfig;
