import { Phone } from "lucide-react";

export default function LeadCard({ lead }) {
  const initials = lead.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="bg-white p-4 rounded-xl shadow border flex items-center gap-4">
      <div className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center rounded-full">
        {initials}
      </div>

      <div className="flex-1">
        <p className="font-semibold">{lead.name}</p>
        <p className="text-sm text-gray-500">{lead.location}</p>
      </div>

      <a href={`tel:${lead.phone}`}>
        <Phone size={18} />
      </a>
    </div>
  );
}
