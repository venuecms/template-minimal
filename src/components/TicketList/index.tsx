import { TicketOnEvent } from "@venuecms/sdk";
import { useFormatter } from "next-intl";

import { Link } from "@/lib/i18n";

export const TicketList = ({ tickets }: { tickets: Array<TicketOnEvent> }) => {
  return (
    <div className="flex gap-8">
      {tickets.map((ticket) => {
        const ticketText =
          ticket.price > 0
            ? formatCurrency(ticket.price, ticket.currency!)
            : "free";

        return ticket.externalLink ? (
          <Link
            className="border-b"
            key={ticket.name}
            href={ticket.externalLink}
          >
            {ticketText} {ticket.name.toLowerCase()}
          </Link>
        ) : (
          <div key={ticket.name}>
            {ticketText}{" "}
            {ticket.name.toLowerCase() !== "regular"
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
