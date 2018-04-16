"use strict";

const uuid = require("uuid");
const AWS = require("aws-sdk"); // eslint-disable-line import/no-extraneous-dependencies
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const SLACK_TARGET = "https://hooks.slack.com/services/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";

// Const Variables
const CRAWAL_START_YEAR = 2008;
const CRAWAL_END_YEAR = new Date().getFullYear;

module.exports.notify = (event, context, callback) => {
  // 모든 키워드 가져와서 키워드대로 분류
  let keywordObj = {};

  var params = {
    TableName: process.env.DYNAMODB_TABLE
  };

  // write the todo to the database
  dynamoDb
    .scan(params, (error, data) => {
      if (error) {
        console.error(error);
        callback(null, {
          statusCode: error.statusCode || 501,
          headers: { "Content-Type": "text/plain" },
          body: "Couldn't Scan the table"
        });
        return;
      }

      let items = body["Items"];

      // data 분류
      items.forEach(item => {
        let keyword = item.keyword; // 김치
        if (!keywordObj.hasOwnProperty(keyword)) {
          // key 없으면 만들고
          keywordObj[keyword] = [receiptHandle];
        } else {
          // key 있으면 추가
          keywordObj[keyword].push(receiptHandle);
        }
      });
      console.log("keywordObj is", keywordObj);

      // Delete Item
      let removeQueryPromiseArr = Object.keys(keywordObj).map(keyword => {
        let handleArr = keywordObj[keyword];
        let handleArrLength = handleArr.length || 0;
        if (handleArrLength >= CRAWAL_END_YEAR - CRAWAL_START_YEAR + 1) {
          // currently 2008 ~ 2018 => 11 year
          // Slack to Dev Chanel
          slack_noti(keyword);
          const params = {
            Key: {
              keyword: {
                S: keyword
              },
              TableName: process.env.DYNAMODB_TABLE
            }
          };
          return dynamoDb.deleteItem(params).promise();
        }
      });

      return Promise.all(removeQueryPromiseArr);
    })
    .then(() => {
      callback(null, "success!!");
    });
};

function slack_noti(keyword) {
  var options = {
    method: "POST",
    url: SLACK_TARGET,
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "application/json"
    },
    body: {
      text: "Image Crawl " + keyword + " Finished",
      icon_emoji: ":robot_face:"
    },
    json: true
  };
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    console.log(body);
  });
}