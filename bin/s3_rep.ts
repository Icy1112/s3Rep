#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LucilaStack } from '../lib/s3_rep-stack';

const prefix = 'Lila'
const app = new cdk.App();
new LucilaStack(app, 'Lila-cdk-stack', {
  stackName: `${prefix}-cdk-stack`,
  prefix,
  env: {
    region: process.env.CDK_DEFAULT_REGION,
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
  replications: [
      'us-west-2',
      'us-east-2'
  ],
});