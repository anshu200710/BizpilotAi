import { X } from "lucide-react";
import { updateLead } from "../../utils/leadService";
import { useState } from "react";

export default function LeadDrawer({ lead, onClose, reload }) {
  const [form, setForm] = useState(lead);

  const save = async () => {
    await updateLead(lead._id, form);
    reload();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-end">
      <div className="w-full max-w-md bg-white h-full p-6 shadow-xl">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Edit Lead</h2>
          <button onClick={onClose}><X /></button>
        </div>

        <div className="space-y-3">
          <input
            className="w-full border p-2 rounded"
            placeholder="Name"
            value={form.name || ""}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />

          <input
            className="w-full border p-2 rounded"
            placeholder="Phone"
            value={form.phone || ""}
            onChange={e => setForm({ ...form, phone: e.target.value })}
          />

          <input
            className="w-full border p-2 rounded"
            placeholder="Email"
            value={form.email || ""}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />

          <textarea
            className="w-full border p-2 rounded"
            placeholder="Notes"
            value={form.notes || ""}
            onChange={e => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <button
          onClick={save}
          className="mt-6 w-full bg-indigo-600 text-white py-2 rounded"
        >
          Save Lead
        </button>
      </div>
    </div>
  );
}
