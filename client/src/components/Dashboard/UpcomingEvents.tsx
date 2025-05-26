import { useRouter } from "next/navigation";

// components/Dashboard/UpcomingEvents.tsx
type Event = {
  id: number;
  title: string;
  start: string;
  type: string;
};

interface Props {
  events: Event[];
  isHideAllEventsButton?: boolean;
}

export default function UpcomingEvents({
  events,
  isHideAllEventsButton = false,
}: Props) {
  const router = useRouter();

  const handleEventsClick = () => {
    router.push("/events");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Найближчі події</h3>
        {!isHideAllEventsButton && (
          <button
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors cursor-pointer font-medium"
            onClick={handleEventsClick}
          >
            Всі події
          </button>
        )}
      </div>

      {events.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500">Немає запланованих подій</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => (
            <li
              key={event.id}
              className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div
                className={`mt-1 flex-shrink-0 w-3 h-3 rounded-full ${
                  event.type === "MEETING" ? "bg-purple-500" : "bg-blue-500"
                }`}
              ></div>
              <div>
                <h4 className="font-medium text-gray-800">{event.title}</h4>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(event.start).toLocaleString("uk-UA", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
