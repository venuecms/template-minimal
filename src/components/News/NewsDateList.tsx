import { format } from "date-fns";

import { cachedGetNewsDates } from "@/lib/utils";

export const NewsDateList = async () => {
  const { data } = await cachedGetNewsDates({ interval: "day" });
  const dates = data?.dates ?? [];

  if (!dates.length) return null;

  const grouped = dates.reduce<Record<string, string[]>>((acc, date) => {
    const year = date.slice(0, 4);
    acc[year] = acc[year] ?? [];
    acc[year].push(date);
    return acc;
  }, {});

  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

  return (
    <nav className="flex flex-col gap-6 text-sm">
      {years.map((year) => (
        <div key={year} className="flex flex-col gap-2">
          <div className="text-primary">{year}</div>
          <ul className="flex flex-col gap-1 text-secondary">
            {grouped[year].map((date) => (
              <li key={date}>{format(new Date(date), "d MMMM")}</li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
};
