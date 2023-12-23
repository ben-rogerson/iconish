import { intlFormatDistance } from "date-fns";

export const relativeTime = (date: number) =>
  intlFormatDistance(date, new Date());
