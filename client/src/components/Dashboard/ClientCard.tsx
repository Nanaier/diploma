// components/Dashboard/ClientCard.tsx
import { useRouter } from "next/navigation";

type Client = {
  id: string;

  displayName: string;
  email: string;

  status?: string;
  avatarUrl?: string;
};

export default function ClientCard({ client }: { client: Client }) {
  const router = useRouter();
  const handleViewClientClick = () => {
    router.push(`/clients/${client.id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {client.avatarUrl ? (
            <img
              src={client.avatarUrl}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
              alt="Avatar"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center text-lg font-bold text-green-800">
              {client.displayName.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-800">{client.displayName}</h4>
          <p className="text-xs text-gray-600">{client.email}</p>
          {client.status && (
            <span
              className={`text-xs px-2 py-1 rounded-full mt-1 ${
                client.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {client.status === "approved" ? "Активний" : "Неактивний"}
            </span>
          )}
        </div>
        <button
          className="text-xs text-blue-600 cursor-pointer hover:text-blue-800"
          onClick={handleViewClientClick}
        >
          Переглянути
        </button>
      </div>
    </div>
  );
}
