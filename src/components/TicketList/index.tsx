import { TicketOnEvent } from "@venuecms/sdk";

import { Link } from "@/lib/i18n";

export const TicketList = ({ tickets }: { tickets: Array<TicketOnEvent> }) => {
  return (
    <div className="flex gap-8">
      {tickets.map((ticket) => {
        const ticketText = `${ticket.price} ${ticket.currency}`;
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
