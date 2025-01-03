import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";

export const formatDate = (isoDate: string, timeZone: string) =>
  format(new TZDate(isoDate, timeZone), "EEEE d MMMM yyyy • h.mmaaa")
    .split(".00")
    .join("");
