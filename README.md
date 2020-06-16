# CDK Page Monitor Project

This is a simple test of using CDK to build a "site pinger" that examines a web page once a week to see if it has changed. My personal use case for this is to check if my favorite band is touring (not that that seems likely for a very long time now).

What's interesting is that this example would be trivial to implement using cron and a single python script on an instance or a laptop, but it requires a lot more wiring using AWS serverless technology. The advantage of this approach is easy deployments and scalability, as well as being a trivial example to learn how to build something more complex.

## Lessons Learned

* Abstraction using Constructs is easy and awesome.
* I never want to write a CF template again.
* I had to waste a lot of time googling Python logger errors just to find out that it doesn't support {} format placeholder syntax. Python logger documentation needs more real world usage examples.
* In general Python documentation tends to omit usage examples and not have clickable links for a function's return type. Very frustrating.
* I did not enjoy figuring out how to work with binary data and unicode strings in Python 3, and read an http response. The documentation of urllib is really lacking in examples and clear documentation of the return types.
* I still enjoy the simplicity and clarity of Python compared to Ruby, but it requires more time to become proficient in again than I expected, and I will stick with Ruby when I need to be productive for now.
* I do not like Python's global functions. Who knew that I had to call `list(delta)` to make my delta into a list, even though the difflib documentation claimed it should already be a list? This is just less discoverable than providing a decent `toString()`, `toArray()`, `to_s` or `to_a` implementation.

## Unit Tests

The example unit test seems silly - why would I write out all the CloudFormation template code that I expect the CDK to generate? That's just a unit test of the CDK, not my stack. Maybe I am missing something.

## Commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
