const fs = require("fs");
const readline = require("readline");
const { google } = require('googleapis')

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

const CREDENTIALS_PATH = "./src/spreadsheetApi/credentials.json"; // アプリ側の認証情報
const TOKEN_PATH = "./src/spreadsheetApi/token.json";

let oAuth2Client = null; // API実行に必要な認証情報

export const init = async () => {
  let credentialContent = fs.readFileSync(CREDENTIALS_PATH);
  let credentials = JSON.parse(credentialContent);
  oAuth2Client = new google.auth.OAuth2(
    credentials.web.client_id,
    credentials.web.client_secret,
    credentials.web.redirect_uris[0]
  );
  if (!fs.existsSync(TOKEN_PATH)) {
    await getNewToken();
  }

  const tokenContent = fs.readFileSync(TOKEN_PATH);
  let token = JSON.parse(tokenContent);

  oAuth2Client.setCredentials({
    refresh_token: token.refresh_token
  });
  return oAuth2Client;
};

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
async function getNewToken() {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(() => {
    rl.question("Enter the code from that page here: ", async (code) => {
      rl.close();
      let { tokens } = await oAuth2Client.getToken(code);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
      console.log("トークンを以下のファイルへ保存しました。", TOKEN_PATH);
    });
  });
}


