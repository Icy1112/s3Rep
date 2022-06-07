#!/usr/bin/env node
// import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';import { LucilaStack } from '../lib/s3_rep-stack';

const prefix = 'lilag'
const option = {
  prefix,
  env: {
    region: process.env.CDK_DEFAULT_REGION,
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
  replications: [
    'us-west-2',
    'us-east-2'
  ]
}


const app = new cdk.App();
new LucilaStack(app, 'lila-cdk-stack', {
  stackName: `${prefix}-cdk-stack`,
  terminationProtection: false,
  ...option
});