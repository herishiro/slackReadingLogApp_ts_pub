import { app } from "../index";
const BOT_TOKEN = process.env.SLACK_BOT_TOKEN

function slackErrorHandling(response) {
  var resLog = JSON.stringify(response, null, '\t');
  console.log("resLog", resLog);
  if (response.ok === false) {
    throw new Error("Slack API error");
  }
}

export const slackMethodHandler = {
  /*
  チャンネルとメッセージ（テキストとブロック両方可）を渡すとメッセージを送信する
  optionにはオブジェクト形式で追加プロパティを渡す、ない場合はnullで
  */
  chatPostMessage: async (channel: string, message, option: object = {}) => {
    let payload = {
      token: BOT_TOKEN,
      channel,
      text: "Botからの通知です"
    };
    if (Array.isArray(message)) {
      Object.assign(payload, { blocks: JSON.stringify(message) });
    } else {
      Object.assign(payload, { text: message });
    }
    if (option) {
      if ("thread_ts" in option) {
        option["thread_ts"] = JSON.parse(option["thread_ts"]);
      }
      Object.assign(payload, option);
    }
    const response = await app.client.chat.postMessage(payload);
    await slackErrorHandling(response)
    return response
  },

  viewsOpen: async (trigger_id: string, view: any) => {
    let payload = {
      token: BOT_TOKEN,
      trigger_id,
      view: view
    };
    const response = await app.client.views.open(payload);
    await slackErrorHandling(response)
    return response
  },
  chatUpdate: async (channel, message, ts) => {
    let payload = {
      token: BOT_TOKEN,
      channel,
      ts,
      text: "Botからの通知です"
    };
    if (Array.isArray(message)) {
      Object.assign(payload, { blocks: JSON.stringify(message) });
    } else {
      Object.assign(payload, { text: message });
    }
    const response = await app.client.chat.update(payload);
    await slackErrorHandling(response)
    return response
  },
  viewsPublish: async (userId, view) => {
    let payload = {
      token: BOT_TOKEN,
      user_id: userId,
      view,
    };
    const response = await app.client.views.publish(payload);
    await slackErrorHandling(response)
    return response
  },
  conversationsOpen: async (users: string) => {
    // BOTと申請者のDMのチャンネルIDを返す/カンマ繋ぎの文字列でグループDM取得可能
    let payload = {
      token: BOT_TOKEN,
      users
    };
    const response = await app.client.conversations.open(payload);
    await slackErrorHandling(response)
    return response.channel.id;
  }
};


