import { format, parse, startOfWeek, getDay } from "date-fns";
import { uk } from "date-fns/locale";
import { dateFnsLocalizer } from "react-big-calendar";
import { Event } from "./types";

export const locales = {
  "uk-UA": uk,
};

export const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export const toLocalISOString = (date: Date) => {
  const tzOffset = -date.getTimezoneOffset();
  const diff = tzOffset >= 0 ? "+" : "-";
  const pad = (n: number) => `${Math.floor(Math.abs(n))}`.padStart(2, "0");

  return (
    new Date(date.getTime() - tzOffset * 60000).toISOString().slice(0, -1) +
    diff +
    pad(tzOffset / 60) +
    ":" +
    pad(tzOffset % 60)
  );
};

export const parseLocalDate = (dateString: string) => {
  const date = new Date(dateString);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + tzOffset);
};

export const eventStyleGetter = (event: Event) => {
  const backgroundColor = event.color || "#4285F4";
  const style = {
    backgroundColor,
    borderRadius: "4px",
    opacity: 0.8,
    color: "white",
    border: "0px",
    display: "block",
  };
  return {
    style,
  };
};
