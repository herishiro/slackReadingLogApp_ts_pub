import { dynamoDB } from "../../../resource/dynamo";
import { slackMethodHandler } from "../../../common/slackMethod";
import { dateHandler } from "../../../modules/dateHandler";

type Payload = {
  payload: {
    userId: string,
    [k: string]: any
  }
}

export default async function createAppHome({ payload }: Payload) {
  const logs = await getLogsInThisMonth(payload.userId)
  const view = await createView(logs)
  await slackMethodHandler.viewsPublish(payload.userId, view)
}

async function getLogsInThisMonth(userId: string) {
  const tableName = process.env.RECORD_TABLE
  const startTime = dateHandler.getTsOfMonthStart(undefined, true)
  const endTime = dateHandler.getTsOfMonthEnd(undefined, true)
  const records = await (await dynamoDB.queryHandler(tableName)).betweenPeriod({ hashValue: userId }, startTime, endTime)
  return records
}

function createView(logs) {
  return {
    "type": "home",
    "blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": ":books:*今日の読書内容を記録しましょう*"
        }
      },
      ...blocks.inputForm(),
      {
        "type": "header",
        "text": {
          "type": "plain_text",
          "text": ":book: 今月の読書記録"
        }
      },
      {
        "type": "divider"
      },
      ...blocks.logList(logs),
    ]
  }
}

const blocks = {
  inputForm: () => {
    return [
      {
        "type": "actions",
        "elements": [
          {
            "type": "button",
            "action_id": "new_reading_log",
            "text": {
              "type": "plain_text",
              "text": "新しい読書記録を入力",
              "emoji": true
            },
            "style": "primary",
            "value": "new_reading_log"
          }
        ]
      },

    ]
  },
  logList: (logs) => {
    let logList: object[] = [];

    if (!logs.length) {
      logList.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: "今月の読書記録はまだありません"
        }
      })
    }
    logs.forEach(log => {
      logList.push(
        {
          "type": "context",
          "elements": [
            {
              "type": "mrkdwn",
              "text": `記録日：${dateHandler.formatDataFromTs(log.timeStamp, 'YYYY-MM-DD HH:mm', true)}`
            }
          ]
        },
        {
          type: "section",
          "block_id": log.timeStamp.toString(),
          "fields": {
            ...createListSection(log),
          },
          "accessory": {
            "type": "button",
            "action_id": "delete_log",
            "text": {
              "type": "plain_text",
              "emoji": true,
              "text": "ログ削除"
            },
            "value": "delete_log"
          }
        },
        {
          "type": "divider"
        },
      )
    })
    return logList
  }
}

function createListSection(log) {
  const fields = log.otherInfoObj.submittedAnswers.map((ans) => {
    let fieldItem = {
      "type": "mrkdwn",
      "text": `*${ans.label} ：* ${ans.inputValue}`
    }
    return fieldItem
  })
  return fields
}