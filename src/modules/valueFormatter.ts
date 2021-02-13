import { dateHandler } from "./dateHandler";

export function valueFormatter(value) {
  const dateReg = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/
  const isDate = Date.prototype.isPrototypeOf(value)
  if (dateReg.test(value) || isDate) {
    value = dateHandler.formatDataFromfFormat(value, "YYYY/MM/DD (ddd)")
  } else if (isNumStr(value) && !isDate) {
    value = Number(value).toLocaleString()
  }
  return value
}

function isNumStr(variable) {
  const numReg = /^[0-9]+$/
  return numReg.test(variable)
}