import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";

export const formatDate = ({
  date,
  withTime = true,
  timeZone,
}: {
  date: string;
  withTime?: boolean;
  timeZone: string;
}) => {
  if (withTime) {
    return format(new TZDate(date, timeZone), "EEEE d MMMM yyyy • h.mmaaa")
      .split(".00")
      .join("");
  }
  return format(new TZDate(date, timeZone), "EEEE d MMMM yyyy");
};
