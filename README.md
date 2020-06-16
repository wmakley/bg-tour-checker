# CDK Page Monitor Project

This is a simple test of using CDK to build a "site pinger" that examines a web page once a week to see if it has changed. My personal use case for this is to check if my favorite band is touring (not that that seems likely for a very long time now).

What's interesting is that this example would be trivial to implement using cron and a single python script on an instance or a laptop, but it requires a lot more wiring using AWS serverless technology. The advantage of this approach is easy deployments and scalability, as well as being a trivial example to learn how to build something more complex.

## Commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
