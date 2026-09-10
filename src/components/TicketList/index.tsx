import { TicketOnEvent } from "@venuecms/sdk-next";
import { useFormatter, useTranslations } from "next-intl";

import { Link } from "@/lib/i18n";

export const TicketList = ({ tickets }: { tickets: Array<TicketOnEvent> }) => {
  const t = useTranslations("tickets");

  return (
    <div className="flex flex-wrap gap-8">
      {tickets.map((ticket) => {
        // Tracked as a flag rather than compared against the rendered text: the
        // free label is translated, so `ticketText === "free"` only held in
        // English.
        const isFree = ticket.price <= 0;
        const ticketText = isFree
          ? t("free")
          : formatCurrency(ticket.price, ticket.currency!);

        return ticket.externalLink ? (
          <Link
            className="text-nowrap underline underline-offset-8 hover:text-secondary"
            key={ticket.name}
            href={ticket.externalLink}
          >
            {ticketText} {ticket.name.toLowerCase()}
          </Link>
        ) : (
          <div key={ticket.name}>
            {ticketText}{" "}
            {ticket.name.toLowerCase() !== "regular" &&
            !(isFree && tickets.length === 1)
              ? ticket.name.toLowerCase()
              : ""}
          </div>
        );
      })}
    </div>
  );
};

const formatCurrency = (price: number, currency: string) => {
  const format = useFormatter();
  const formattedPrice = format.number(price, {
    style: "currency",
    currency: currency,
  });

  return formattedPrice.replaceAll(".00", "");
};
