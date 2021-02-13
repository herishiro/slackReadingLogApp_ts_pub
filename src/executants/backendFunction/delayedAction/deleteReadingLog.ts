import { dynamoDB } from "../../../resource/dynamo";
import createAppHome from "./createAppHome";
import { slackMethodHandler } from "../../../common/slackMethod";


export default async function deleteReadingLog({ payload }) {
  const { body, action } = payload
  const tableName = process.env.RECORD_TABLE
  const fromFirstMsgBtn = body.message
  const timeStamp = fromFirstMsgBtn ? body.message?.ts : action.block_id
  const record = await dynamoDB.get({ hashValue: body.user.id, sortValue: Number(timeStamp) }, tableName)
  if (record) await dynamoDB.delete(record, tableName)
  const msgBlock = setUpdatedMsgBlockKit()
  const msgChannel = await slackMethodHandler.conversationsOpen(body.user.id)
  const msgTs = record.otherInfoObj.recordId.split("|")[1]
  await slackMethodHandler.chatUpdate(msgChannel, msgBlock, msgTs)
  await createAppHome({ payload: { userId: body.user.id } })
}

function setUpdatedMsgBlockKit() {
  const block = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `今日の読書内容。`
      }
    },
    {
      type: "divider"
    },
    {
      type: "section",
      block_id: "answerBody",
      text: {
        type: "mrkdwn",
        text: "`このログは削除されました`"
      },
    },
  ];
  return block;
}