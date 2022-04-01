import { openDayTypeList } from 'src/enums/OpenDayType.enum';

const moment = require('moment').default || require('moment');

export const timeFormatterToLT = (time: string): string => {
  const timeLT = moment(time, 'h:mm a').format('LT');
  return timeLT;
};

export const getRestaurantOpenDays = (csvString: string) => {
  const openDayList = openDayTypeList;
  for (let i = 0; i < openDayList.length; i++) {
    const match = csvString.match(openDayList[i]);
    return match;
  }
  return null;
};

export const getDaysInBetween = (start: string, end: string) => {
  const startIndex = openDayTypeList.indexOf(dayMapper(start));
  const endIndex = openDayTypeList.indexOf(dayMapper(end)) + 1;
  const daysInBetween = openDayTypeList.slice(startIndex, endIndex);
  return daysInBetween;
};

export const hasNumber = (stringValue: string) => {
  return /\d/.test(stringValue);
};

export const dayMapper = (day: string) => {
  switch (day) {
    case 'Wed':
      return 'Weds';
    case 'Weds':
      return 'Weds';
    case 'Thurs':
      return 'Thurs';
    case 'Thu':
      return 'Thurs';
    case 'Tue':
      return 'Tues';
    default:
      return day;
  }
};
