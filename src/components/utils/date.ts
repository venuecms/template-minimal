import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";

const formatDate = ({
  date,
  withTime = true,
  timeZone,
  template,
}: {
  date: string;
  withTime?: boolean;
  timeZone: string;
  template: string;
}) => {
  if (withTime) {
    return format(new TZDate(date, timeZone), `${template} • h.mmaaa`)
      .split(".00")
      .join("");
  }
  return format(new TZDate(date, timeZone), template);
};

export const formatDateRange = ({
  start,
  end,
  timeZone,
  withTime,
  template = "EEEE d MMMM yyyy",
}: {
  start: string;
  end: string;
  timeZone: string;
  withTime?: boolean;
  template?: string;
}) => {
  const startDate = new TZDate(start, timeZone);
  const endDate = new TZDate(end, timeZone);

  const isMultiDay =
    startDate.getDay() !== endDate.getDay() ||
    startDate.getMonth() !== endDate.getMonth() ||
    startDate.getFullYear() !== endDate.getFullYear();

  if (!isMultiDay) {
    return formatDate({ date: start, withTime, template, timeZone });
  }

  const isSameMonth =
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear();

  if (isSameMonth) {
    return `${format(new TZDate(start, timeZone), "d")}—${formatDate({ date: end, withTime, timeZone, template: "d MMMM yyyy" })}`;
  }

  return `${format(new TZDate(start, timeZone), "d")}—${format(new TZDate(endDate, timeZone), "d")} ${format(new TZDate(startDate, timeZone), "MMMM")}
       ${format(new TZDate(endDate, timeZone), "MMMM")} ${format(new TZDate(startDate, timeZone), "yyyy")} ${format(new TZDate(endDate, timeZone), "yyyy")}`;
};
