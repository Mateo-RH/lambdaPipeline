#!/usr/bin/env node
import { App } from '@aws-cdk/core';
import { LambdaStack } from '../lib/lambda-stack';
import { PipelineStack } from '../lib/pipeline-stack';

const app = new App();

const lambdaStack = new LambdaStack(app, 'LambdaStack', {
  env: {
    region: 'us-west-1',
  },
});
new PipelineStack(app, 'PipelineStack', {
  lambdaCode: lambdaStack.lambdaCode,
  githubToken: 'awsPipeline',
  prod_cognito_id: 'prod',
  dev_cognito_id: 'dev',
  env: {
    region: 'us-west-1',
  },
});

app.synth();
