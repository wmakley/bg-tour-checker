import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as s3 from '@aws-cdk/aws-s3';
import * as sns from '@aws-cdk/aws-sns';
import { EmailSubscription } from '@aws-cdk/aws-sns-subscriptions';
import * as path from 'path';
import * as events from '@aws-cdk/aws-events';
import * as targets from '@aws-cdk/aws-events-targets';
import { SnsDestination } from '@aws-cdk/aws-lambda-destinations';

export interface BgTourCheckerStackProps extends cdk.StackProps {
  alertEmail: string
  crawlUrl: string
}

export class BgTourCheckerStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: BgTourCheckerStackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'CrawlerStash', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      lifecycleRules: [
        { id: 'OneZoneIAAfter30Days',
          noncurrentVersionExpiration: cdk.Duration.days(360),
          noncurrentVersionTransitions: [
            {
              storageClass: s3.StorageClass.ONE_ZONE_INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(30)
            }
          ]
        }
      ]
    });
    const topic = new sns.Topic(this, 'BlindGuardianTourAlerts');
    topic.addSubscription(new EmailSubscription(props.alertEmail));

    const fn = new lambda.Function(this, 'SiteCrawler', {
      runtime: lambda.Runtime.PYTHON_3_7,
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda')),
      handler: 'crawler.main',
      environment: {
        "BUCKET": bucket.bucketName,
        "TOPIC": topic.topicArn
      },
      timeout: cdk.Duration.seconds(10),
      onSuccess: new SnsDestination(topic), // temporary until I know it works
      onFailure: new SnsDestination(topic)
    });

    bucket.grantReadWrite(fn);
    topic.grantPublish(fn);

    const scheduledEvent = events.RuleTargetInput.fromObject({
      "url": props.crawlUrl
    });

    new events.Rule(this, 'ScheduleRule', {
      schedule: events.Schedule.cron({
        minute: '0',
        hour: '12', // ~8am EST
        month: '*',
        year: '*',
        weekDay: 'SAT'
      }),
      targets: [
        new targets.LambdaFunction(fn, {
          event: scheduledEvent
        })
      ]
    });
  }
}
