const { google } = require('googleapis')
import { dynamoDB } from "../resource/dynamo";
import { dateHandler } from "../modules/dateHandler";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

const SPREADSHEET_ID = "16i6wW3G5ulhRgJ6PzyTvIpk9oDraC3e1dpyrgRcA9Jw";
const SHEET = "シート1"
/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
export const getSheetTable = async function getSheetTable(auth) {
  try {
    const sheets = await google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET,
    });
    const rows = res.data.values;
    console.log(JSON.stringify(rows));
  } catch (error) {
    console.log("The API returned an error: " + error);
  }
};

export const addData = async function (auth) {
  const tableName = process.env.RECORD_TABLE
  const records = await (await dynamoDB.queryHandler(tableName)).sameSecondaryIndex("承認待ち")
  const sheetData = db2sheetData(records)
  console.log(`sheetData ：${JSON.stringify(sheetData)}`)
  try {
    const sheets = google.sheets({ version: "v4" });
    const param = {
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET}!A1`,
      valueInputOption: "USER_ENTERED",
      auth: auth,
      resource: {
        values: sheetData,
      },
    };
    await sheets.spreadsheets.values.update(param);
  } catch (error) {
    console.log("The API returned an error: " + error);
  }
};

function db2sheetData(records: DocumentClient.ItemList) {
  let header = []
  let sheetData = records.map(record => {
    const requiredData = {
      "記入日": dateHandler.formatDataFromTs(record.otherInfoObj.createdAt, 'YYYY-MM-DD HH:mm'),
      "記入者": record.otherInfoObj.appricant.name,
      "状態": record.status,
      "本のタイトル": record.otherInfoObj.submittedAnswers[0].inputValue,
      "読んだページ": record.otherInfoObj.submittedAnswers[1].inputValue,
      "感想": record.otherInfoObj.submittedAnswers[2].inputValue,
      "recordId": record.otherInfoObj.recordId
    }
    header = Object.keys(requiredData)
    return header.map(label => requiredData[label])
  })
  sheetData.unshift(header)
  return sheetData
}