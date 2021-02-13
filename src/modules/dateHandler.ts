

import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import ja from 'dayjs/locale/ja';
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale(ja);

export const dateHandler = {
  formatDataFromTs: (ts: number, format: string, isSlackTs: boolean = false) => {
    ts = isSlackTs ? ts * 1000 : ts
    return dayjs(ts).tz('Asia/Tokyo').format(format)
  },
  formatDataFromfFormat: (beforeFormat: string, afterFormat: string) => {
    return dayjs(beforeFormat).tz('Asia/Tokyo').format(afterFormat)
  },
  getTsOfMonthStart: (date: Date = new Date(), isSlackTs: boolean = null) => {
    const epochTs = dayjs(date).tz('Asia/Tokyo').startOf('month').valueOf()
    const ts = isSlackTs ? epochTs / 1000 : epochTs
    return ts
  },
  getTsOfMonthEnd: (date: Date = new Date(), isSlackTs: boolean = false) => {
    const epochTs = dayjs(date).tz('Asia/Tokyo').endOf('month').valueOf()
    const ts = isSlackTs ? epochTs / 1000 : epochTs
    return ts
  }
}