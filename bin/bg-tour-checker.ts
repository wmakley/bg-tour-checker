#!/usr/bin/env node
import 'source-map-support/register';
require('dotenv').config();
import * as cdk from '@aws-cdk/core';
import { BgTourCheckerStack } from '../lib/bg-tour-checker-stack';

const env: cdk.Environment = {
  account: assertEnv('AWS_ACCOUNT'),
  region: assertEnv('AWS_REGION')
};

const app = new cdk.App();
new BgTourCheckerStack(app, 'BgTourCheckerStack', {
  alertEmail: assertEnv('ALERT_EMAIL'),
  env: env
});

function assertEnv(key: string): string {
  const value = process.env[key];
  if (typeof value !== 'string') {
    throw new Error(`Expected ${key} to be present in Environment, but wasn't`);
  }
  return value as string;
}
