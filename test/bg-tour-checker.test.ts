import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as BgTourChecker from '../lib/bg-tour-checker-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new BgTourChecker.BgTourCheckerStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
