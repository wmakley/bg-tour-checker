import difflib
import logging
import os
import re
import urllib.request

import boto3

LOG = logging.getLogger()
LOG.setLevel(logging.INFO)

PAGE_ENCODING = 'utf-8'

# Assumes UTF-8
def main(event, context):
    url = event['url']
    title = event['title']
    bucket = os.environ['BUCKET']
    topic = os.environ['TOPIC']
    LOG.info("Title: {}, Url: {}, Bucket: {} Topic: {}".format(title, url, bucket, topic))

    resp = urllib.request.urlopen(url, timeout=5)

    status = resp.status
    LOG.info("Response status code: {}".format(resp.status))

    current_page_body_bytes = resp.read()
    current_page_body = current_page_body_bytes.decode(PAGE_ENCODING)
    # LOG.debug("Response Body: {}", current_page_body_bytes)

    s3_client = boto3.client('s3')
    # print(s3_client.exceptions.__dict__) # figure out what exception class it was
    object_key = url_to_object_key(url)
    try:
        previous_page_body_bytes = s3_client.get_object(Bucket=bucket, Key=object_key)['Body'].read()
        previous_page_body = previous_page_body_bytes.decode(PAGE_ENCODING)
        # LOG.debug("Previous Page Body: {}", previous_page_body_bytes)
    except s3_client.exceptions.NoSuchKey:
        LOG.info("No previous page content found in bucket.")
        previous_page_body = ""

    if current_page_body != previous_page_body:
        LOG.info("Page content changed! Sending alert and storing new version.")
        differ = difflib.Differ()
        delta = list(differ.compare(previous_page_body.splitlines(keepends=True), current_page_body.splitlines(keepends=True)))
        delta_str = "\r\n".join([str(l) for l in delta])
        LOG.debug("Delta: %s", delta_str)

        sns_client = boto3.client('sns')
        sns_client.publish(
            TopicArn=topic,
            Subject="{} Changed!".format(title),
            Message="Check it out at {}\r\nDelta: \r\n{}".format(url, delta_str)
        )
        s3_client.put_object(Body=current_page_body, Bucket=bucket, Key=object_key)

        return {
            "message": "{} changed! Notified subscribers and saved new version.".format(title),
            "url": url,
            "delta": delta,
            "s3_object": "{}/{}".format(bucket, object_key)
        }
    else:
        LOG.info("No change to {} content.".format(title))
        return {
            "message": "No change.",
            "url": url,
            "delta": None,
            "s3_object": "{}/{}".format(bucket, object_key)
        }


def url_to_object_key(url):
    p = re.compile('[^\\w]+')
    object_key = p.sub('-', url) + ".html"
    object_key = object_key.replace("-.html", ".html", 1)
    return object_key
