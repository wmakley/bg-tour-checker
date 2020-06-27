import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as s3 from '@aws-cdk/aws-s3';
import * as sns from '@aws-cdk/aws-sns';
import * as path from 'path';
import * as events from '@aws-cdk/aws-events';
import * as targets from '@aws-cdk/aws-events-targets';
import { SnsDestination } from '@aws-cdk/aws-lambda-destinations';

export interface SiteCheckerProps {
  url: string
  title: string
  topic: sns.ITopic
  bucket: s3.IBucket
  weekDay?: string
}

export class SiteChecker extends cdk.Construct {
  public readonly lambda: lambda.IFunction;
  public readonly bucket: s3.IBucket;
  public readonly topic: sns.ITopic;

  constructor(scope: cdk.Construct, id: string, props: SiteCheckerProps) {
    super(scope, id);

    this.topic = props.topic;
    this.bucket = props.bucket;

    this.lambda = new lambda.Function(this, 'SiteCrawler', {
      runtime: lambda.Runtime.PYTHON_3_7,
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda')),
      handler: 'crawler.main',
      environment: {
        "BUCKET": this.bucket.bucketName,
        "TOPIC": this.topic.topicArn,
      },
      timeout: cdk.Duration.seconds(10),
      onFailure: new SnsDestination(this.topic)
    });

    this.bucket.grantReadWrite(this.lambda);
    this.topic.grantPublish(this.lambda);

    const scheduledEvent = events.RuleTargetInput.fromObject({
      "url": props.url,
      "title": props.title
    });

    new events.Rule(this, 'ScheduleRule', {
      schedule: events.Schedule.cron({
        minute: '0',
        hour: '12', // ~8am EST
        month: '*',
        year: '*',
        weekDay: (props.weekDay || 'SAT')
      }),
      targets: [
        new targets.LambdaFunction(this.lambda, {
          event: scheduledEvent
        })
      ]
    });
  }
}
