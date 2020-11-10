#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsPipelineStack } from '../lib/aws_pipeline-stack';

const app = new cdk.App();
new AwsPipelineStack(app, 'AwsPipelineStack');
