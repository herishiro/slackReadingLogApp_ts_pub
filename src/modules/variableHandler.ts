export const variableHandler = {
  typeOf(variable) {
    let typeOfStr = Object.prototype.toString.call(variable); // [object 何らかの型名]で返ってくる
    typeOfStr = typeOfStr.slice(8, -1).toLowerCase();
    return typeOfStr;
  },
  isString(variable) {
    return this.typeOf(variable) === "string"
  },
  isNumStr(variable) {
    const numReg = /^[0-9]+$/
    return numReg.test(variable)
  },

  isObject(variable) {
    return this.typeOf(variable) === "object"
  },
  any(value) {
    if (value) {
      return true
    } else {
      return false
    }
  },
  logJSON(logName, variable) {
    var resLog = JSON.stringify(variable, null, '\t');
    console.log(`${logName} ：${resLog}`)
  }
}