import { TicketOnEvent } from "@venuecms/sdk";
import { useFormatter } from "next-intl";

import { Link } from "@/lib/i18n";

export const TicketList = ({ tickets }: { tickets: Array<TicketOnEvent> }) => {
  const format = useFormatter();

  return (
    <div className="flex gap-8">
      {tickets.map((ticket) => {
        const ticketText =
          ticket.price > 0
            ? format.number(ticket.price, {
                style: "currency",
                currency: ticket.currency!,
              })
            : "free";

        return ticket.externalLink ? (
          <Link key={ticket.name} href={ticket.externalLink}>
            {ticketText}
          </Link>
        ) : (
          <div>{ticketText}</div>
        );
      })}
    </div>
  );
};
