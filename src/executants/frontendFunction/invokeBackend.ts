import { Lambda } from 'aws-sdk';
import { backendFuncHandler } from "../backendFunction/handler"


/**
 * backendFunction内の関数をinvoke関数で呼び出す
 * @param {string} invokedFuncName invokeで呼び出す関数の名前
 * @param {object} req 
 */
export const invokeBackend = async (invokedFuncName: string, req) => {
  if (process.env.IS_OFFLINE === "true") {
    if (req.hasOwnProperty("ack")) { req.ack(); }
    mainLogic(invokedFuncName, req)
  } else {
    const lambda = new Lambda();
    let invokedBody = await getInvokedEventBody(invokedFuncName, req)
    const params: AWS.Lambda.InvocationRequest = {
      InvocationType: "Event", // async invocation
      FunctionName: process.env.INVOKE_FUNCTION!,
      Payload: JSON.stringify(invokedBody),
    };
    const lambdaInvocation = await lambda.invoke(params).promise();
    await checkResponse(lambdaInvocation)
    if (req.hasOwnProperty("ack")) { req.ack(); }
  }
}

const mainLogic = (invokedFuncName, req) => {
  backendFuncHandler[invokedFuncName]({ payload: req })
}

function getInvokedEventBody(functionName, payload) {
  let body = {}
  return Object.assign(body, { functionName, payload });
}

function checkResponse(response) {
  if ((response.StatusCode = 202)) {
    console.log("lambdaInvocation was successed!!!!");
  } else {
    console.log("error occurred: " + JSON.stringify(response));
  }
}

