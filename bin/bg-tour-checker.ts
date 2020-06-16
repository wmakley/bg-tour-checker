#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { BgTourCheckerStack } from '../lib/bg-tour-checker-stack';

const env: cdk.Environment = { account: '***REMOVED***', region: '***REMOVED***' };

const app = new cdk.App();
new BgTourCheckerStack(app, 'BgTourCheckerStack', {
  alertEmail: '***REMOVED***',
  crawlUrl: "https://www.blind-guardian.com/tour/",
  env: env
});
