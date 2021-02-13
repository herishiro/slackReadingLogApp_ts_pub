"use strict";
import { APIGatewayProxyHandler } from 'aws-lambda';
const { App, ExpressReceiver, LogLevel } = require('@slack/bolt');
import 'source-map-support/register';

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  processBeforeResponse: true,
});
export const app = new App({
  receiver,
  token: process.env.SLACK_BOT_TOKEN,
  processBeforeResponse: true,
  logLevel: LogLevel.INFO,
});

app.message('hello', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  console.log(`${JSON.stringify(message)}`)
  await say(`Hey there!! <@${message.user}>!`);
});

import { slackEventHandler } from "./executants/frontendFunction/eventHandler";
app.event('app_home_opened', async (req) => {
  await slackEventHandler["appHome"].create(req)
});

app.command("/start-process", async ({ command, ack }) => {
  await slackEventHandler["command"].openModal({ command, ack })
});

app.action('new_reading_log', async (req) => {
  await slackEventHandler["button"].openModal(req)
});
app.view('readinglog', async (req) => {
  await slackEventHandler["viewSubmission"].handleViewSubmission(req)
});

app.action('delete_log', async (req) => {
  await slackEventHandler["button"].deleteReadingLog(req)
});

// frontend: internet-facing function handling requests from Slack
const awsServerlessExpress = require('aws-serverless-express');
const server = awsServerlessExpress.createServer(receiver.app);
export const frontend: APIGatewayProxyHandler = (event, context) => {
  awsServerlessExpress.proxy(server, event, context);
}

// backend: internal function for anything apart from acknowledging requests from Slack
import { backendFuncHandler } from "./executants/backendFunction/handler"
export const backend = async function (event, _context) {
  // if you reuse this function for other patterns, need to dispatch the events
  await backendFuncHandler[event.functionName](event)
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'done' }),
  };
};

import { init } from "./spreadsheetApi/authorizer";
import { addData } from "./spreadsheetApi/handler";
export const exportDBToSheet: APIGatewayProxyHandler = async (event, _context) => {
  const oAuth2Client = await init();
  await addData(oAuth2Client);
  return {
    statusCode: 200,
    body: JSON.stringify({ message: event }),
  };
}