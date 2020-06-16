import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as sns from '@aws-cdk/aws-sns';
import { EmailSubscription } from '@aws-cdk/aws-sns-subscriptions';
import { SiteChecker } from './site-checker';

export interface BgTourCheckerStackProps extends cdk.StackProps {
  alertEmail: string
}

export class BgTourCheckerStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: BgTourCheckerStackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'CrawlerStash', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      lifecycleRules: [
        { id: 'OneZoneIAAfter30Days',
          noncurrentVersionTransitions: [
            {
              storageClass: s3.StorageClass.ONE_ZONE_INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(30)
            }
          ],
          noncurrentVersionExpiration: cdk.Duration.days(360),
        }
      ]
    });

    const topic = new sns.Topic(this, 'BlindGuardianTourAlerts');
    topic.addSubscription(new EmailSubscription(props.alertEmail));

    new SiteChecker(this, 'BlindGuardianTourChecker', {
      title: "Blind Guardian Tour Page",
      url: "https://www.blind-guardian.com/tour/",
      bucket: bucket,
      topic: topic,
    });
  }
}
