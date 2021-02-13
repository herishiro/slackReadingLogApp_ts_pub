"use strict";
import { DynamoDB } from 'aws-sdk';

const db = new DynamoDB.DocumentClient();
type Record = {
  applicantId: string,
  timeStamp: number,
  status: string,
  otherInfoObj: {
    [k: string]: any,
  }
}
type Setting = {
  settingName: string,
  settingInfoObj: {
    [k: string]: any,
  }
}
type SettingKey = { hashValue: string, sortValue: null }
type RecordKey = { hashValue: string, sortValue: number }
type PrimaryKey = SettingKey | RecordKey

const keyHandler = {
  [process.env.RECORD_TABLE]: {
    hashKey: "applicantId",
    sortKey: "timeStamp",
    typeName: "Record"
  },
  [process.env.SETTING_TABLE]: {
    hashKey: "settingName",
    sortKey: null,
    typeName: "Setting"
  },
}

export const dynamoDB = {
  create: async (record: Record, tableName: string): Promise<void> => {
    const params = {
      TableName: tableName,
      Item: record,
    };
    try {
      const res = await db.put(params).promise();
      if (!res) {
        throw Error(`There was an error inserting timeStamp of ${record.timeStamp} in table ${tableName}`);
      }
    } catch (error) {
      throw Error(`There was an error while inserting a record in table ${tableName}`);
    }
  },
  delete: async (record: Record, tableName: string) => {
    if (!keyHandler[tableName]) console.log(`${tableName} doesn't exist in keyHandler`)
    const Key = getKeyParam(tableName, record, null)
    const params = {
      TableName: tableName,
      Key: Key,
      ReturnValues: 'ALL_OLD',
    };
    try {
      const res = await db.delete(params).promise();
      if (!res.Attributes) {
        throw new Error('Cannot delete item that does not exist')
      }
      console.log(`Record deleted successfully \n deleted Record: ${JSON.stringify(res)}`)
    } catch (err) {
      throw Error(`There was an error while deletting the record having timeStamp of ${record.timeStamp} in table ${tableName}`);
    }
  },
  get: async<T extends PrimaryKey>({ hashValue, sortValue }: T, tableName: string)
    : Promise<T extends RecordKey ? Record : Setting> => {
    if (!keyHandler[tableName]) console.log(`${tableName} doesn't exist in keyHandler`)
    const Key = getKeyParam(tableName, null, { hashValue, sortValue })
    const params = {
      TableName: tableName,
      Key: Key
    };
    try {
      const res = await db.get(params).promise();
      if (!res.Item) {
        console.log(`There is no record having ${hashValue} & ${sortValue} in the table ${tableName}`)
        return null
      }
      let item
      if (res.Item.applicantId) {
        item = res.Item as Record
      } else if (res.Item.settingName) {
        item = res.Item as Setting
      }
      return item
    } catch (error) {
      throw Error(`There was an error while getting a record having ${hashValue} & ${sortValue} in table ${tableName}`);
    }
  },
  queryHandler: async (tableName: string): Promise<{ [k: string]: Function }> => {
    if (!keyHandler[tableName]) console.log(`${tableName} doesn't exist in keyHandler`)

    async function queryItems(params, funcName) {
      try {
        const res = await db.query(params).promise();
        if (res.Items === []) {
          console.log(`There is no record matching function ${funcName} in the table ${tableName}`)
          return []
        }
        let items = res.Items as Record[]
        return items
      } catch (error) {
        throw Error(`There was an error matching function ${funcName} in table ${tableName} \n ${error}`);
      }
    }
    return {
      sameSecondaryIndex: async (queryValue: string) => {
        const params = {
          TableName: tableName,
          IndexName: "status-index",
          KeyConditionExpression: `#queryKey = :queryValue`,
          ExpressionAttributeNames: {
            "#queryKey": "status",
          },
          ExpressionAttributeValues: {
            ':queryValue': queryValue,
          },
        };
        return await queryItems(params, "sameSecondaryIndex")
      },
      betweenPeriod: async ({ hashValue }, startTime: number, endTime: number) => {
        const dynamo = new DynamoDB()
        console.log("dynamo.endpoint", JSON.stringify(dynamo.endpoint))
        console.log("dynamo.config ", dynamo.config)
        const params = {
          TableName: tableName,
          KeyConditionExpression: `#hashKey = :hashValue and #sortKey between :startTime and :endTime`,
          ExpressionAttributeNames: {
            "#hashKey": keyHandler[tableName].hashKey,
            "#sortKey": keyHandler[tableName].sortKey
          },
          ExpressionAttributeValues: {
            ':hashValue': hashValue,
            ':startTime': startTime,
            ':endTime': endTime,
          },
        };
        return await queryItems(params, "betweenPeriod")
      },
    }
  },
  scan: async (tableName: string) => {
    const params = {
      TableName: tableName,
    };
    try {
      const res = await db.scan(params).promise();
      if (!res.Items) {
        console.log(`There was record in table ${tableName}`);
        return []
      }
      return res.Items
    } catch (error) {
      throw Error(`There was an error while scanning in table ${tableName}`);
    }
  },
};

function getKeyParam(tableName: string, record: Record = null, primaryKey: PrimaryKey = null) {
  const { hashKey, sortKey } = keyHandler[tableName]
  let key
  if (record) {
    key = { [hashKey]: record[hashKey] }
    if (sortKey) key[sortKey] = record[sortKey]
  } else {
    key = { [hashKey]: primaryKey.hashValue }
    if (sortKey) key[sortKey] = primaryKey.sortValue
  }
  return key
}

