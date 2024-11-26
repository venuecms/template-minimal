import { format } from "date-fns";

export const formatDate = (isoDate: string) =>
  format(new Date(isoDate), "EEEE d MMMM yyyy • h.mmaaa").split(".00").join("");
