import { slackMethodHandler } from "../../../common/slackMethod";

const command = {
  async openModal({ command, ack }) {
    ack();
    await slackMethodHandler.viewsOpen(command.trigger_id, await modalView(command))
  }
};
export default command

const modalView = (payload) => {
  return {
    "callback_id": "readinglog",
    "private_metadata": payload.channel_id,
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