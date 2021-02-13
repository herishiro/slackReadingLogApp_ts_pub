import { invokeBackend } from "../invokeBackend"
import { slackMethodHandler } from "../../../common/slackMethod";

export const button = {
  deleteReadingLog: async ({ ack, body, action, payload }) => {
    await invokeBackend("deleteReadingLog", { ack, body, action, payload })
  },
  openModal: async ({ body, ack }) => {
    ack();
    await slackMethodHandler.viewsOpen(body.trigger_id, await modalView())
  },
};
export default button


const modalView = () => {
  return {
    "callback_id": "readinglog",
    "private_metadata": "C01E1NAJ63Y",
    "type": "modal",
    "submit": {
      "type": "plain_text",
      "text": "Submit",
      "emoji": true
    },
    "close": {
      "type": "plain_text",
      "text": "Cancel",
      "emoji": true
    },
    "title": {
      "type": "plain_text",
      "text": "読書記録",
      "emoji": true
    },
    "blocks": [
      {
        "type": "input",
        "label": {
          "type": "plain_text",
          "text": "本のタイトル",
          "emoji": true
        },
        "element": {
          "type": "plain_text_input"
        }
      },
      {
        "type": "input",
        "label": {
          "type": "plain_text",
          "text": "読んだページ",
          "emoji": true
        },
        "element": {
          "type": "plain_text_input"
        }
      },
      {
        "type": "input",
        "label": {
          "type": "plain_text",
          "text": "感想",
          "emoji": true
        },
        "element": {
          "type": "plain_text_input",
          "multiline": true
        }
      }
    ]
  }
}