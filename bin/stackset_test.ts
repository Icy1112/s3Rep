#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { TestStack } from '../lib/stackset';

const prefix = 'test'
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
new TestStack(app, 'test-cdk-stack', {
    stackName: `${prefix}-cdk-stack`,
    terminationProtection: false,
    ...option
  });