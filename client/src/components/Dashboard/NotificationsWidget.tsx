// components/Dashboard/NotificationsWidget.tsx
type Notification = {
  id: number;
  message: string;
  createdAt: string;
};

interface Props {
  notifications: Notification[];
}

export default function NotificationsWidget({ notifications }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Сповіщення</h3>
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
          {notifications.length} нових
        </span>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500">Все прочитано</p>
          <span className="text-2xl">🥳</span>
        </div>
      ) : (
        <ul className="space-y-3">
          {notifications.map((note) => (
            <li
              key={note.id}
              className="p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <p className="text-sm text-gray-800">{note.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(note.createdAt).toLocaleDateString("uk-UA", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
