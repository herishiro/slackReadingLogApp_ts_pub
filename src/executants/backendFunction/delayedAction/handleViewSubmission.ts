import { slackMethodHandler } from "../../../common/slackMethod";
import { valueFormatter } from "../../../modules/valueFormatter";
import { dynamoDB } from "../../../resource/dynamo";
import createAppHome from "./createAppHome";

export default async function handleViewSubmission({ payload }) {
  const { view, body } = payload
  const submittedAnswers = await getFieldLabelAndInputValueObj(view.blocks, view.state.values);
  const formattedAnswer = await formatQandAasText(submittedAnswers);
  const msgBlock = await setConfirmMsgBlockKit(formattedAnswer);
  let applyMsgTs = await postConfirmationForApplicant(body, msgBlock);
  const record = await makeReadingLogRecord(submittedAnswers, applyMsgTs, body)
  const tableName = process.env.RECORD_TABLE
  await dynamoDB.create(record, tableName)
  await createAppHome({ payload: { userId: body.user.id } })
}

function makeReadingLogRecord(submittedAnswers, msgTs, body) {
  const otherInfo = {
    createdAt: (new Date()).getTime(),
    appricant: body.user,
    recordId: body.user.id + "|" + msgTs,
    submittedAnswers: submittedAnswers
  }
  const record = {
    applicantId: body.user.id as string,
    timeStamp: Number(msgTs),
    status: "承認待ち",
    otherInfoObj: otherInfo
  }
  return record
}

function getFieldLabelAndInputValueObj(blocks, values) {
  let submittedAnswers: object[] = [];
  blocks.forEach(obj => {
    let { block_id: blockID_inBlo, element, label } = obj;
    if (!label) { return }
    let label_inBlo = label.text;
    let actionID_inBlo = element.action_id;
    for (let blockID_inVal in values) {
      let hasSameBlockID_inBlockAndValuesObj = blockID_inBlo === blockID_inVal
      if (hasSameBlockID_inBlockAndValuesObj) {
        let blockID_ObjinVal = values[blockID_inBlo];
        let actionID_ObjinVal = blockID_ObjinVal[actionID_inBlo];
        let inputValue = getInputValueInValuesObj(actionID_ObjinVal);
        let inputOptAsText = getSelectedOptionAsText(actionID_ObjinVal);

        submittedAnswers.push({
          label: label_inBlo,
          inputType: actionID_ObjinVal.type,
          blockID: blockID_inVal,
          inputOptAsText,
          inputValue
        })
      }
    }
  });
  return submittedAnswers
}
/* 
各values内の{block_id{action_id{""ココ""}}}オブジェクトを渡すとモーダルに入力された値を返す
現在input要素のplain_text_input/datepicker/static_select/selected_user/multi_users_selectに対応
*/
function getInputValueInValuesObj(action_id_Obj) {
  let inputValue = "";
  if (action_id_Obj.value) {
    inputValue = action_id_Obj.value;
  } else if ("selected_option" in action_id_Obj) {
    inputValue = action_id_Obj.selected_option.value;
  } else if ("selected_date" in action_id_Obj) {
    inputValue = action_id_Obj.selected_date;
  } else if ("selected_user" in action_id_Obj) {
    inputValue = action_id_Obj.selected_user;
  } else if ("selected_users" in action_id_Obj) {
    inputValue = action_id_Obj.selected_users;
    //ここだけuserIDの配列を返す
  }
  return inputValue;
}

function getSelectedOptionAsText(action_id_Obj) {
  let inputValText = undefined;
  if ("selected_option" in action_id_Obj) {
    inputValText = action_id_Obj.selected_option.text.text
  }
  return inputValText
}


function formatQandAasText(submittedAnswers) {
  let QandAMsg = submittedAnswers.reduce((str, ans) => {
    // let label = key.replace(/[\s　]※必須/, "");
    const value = valueFormatter(ans.inputValue)
    return str + `\n＊${ans.label}＊ ： ${value}`;
  }, "");
  return QandAMsg
}

async function postConfirmationForApplicant(body, msgBlock) {
  console.log(`body.user.id ：${body.user.id}`)
  const postedChannel = await slackMethodHandler.conversationsOpen(body.user.id)
  const msgResponse = await slackMethodHandler.chatPostMessage(postedChannel, msgBlock)
  let { ts: applyTs } = msgResponse
  return applyTs
}

function setConfirmMsgBlockKit(prettifiedAnswer) {
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
        text: prettifiedAnswer
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
  ];
  return block;
}
