import { X } from "lucide-react";
import { updateLead, createLead } from "../../utils/leadService";
import { useState } from "react";

export default function LeadDrawer({ lead, onClose, reload }) {
  const isEdit = Boolean(lead);

  const [form, setForm] = useState(
    lead || {
      name: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
    }
  );

  const save = async () => {
    if (isEdit) {
      await updateLead(lead._id, form);
    } else {
      await createLead({
        ...form,
        source: "manual", // 🔥 REQUIRED
        status: "new",
      });
    }

    reload();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-end">
      <div className="w-full max-w-md bg-white h-full p-6 shadow-xl">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">
            {isEdit ? "Edit Lead" : "Create Lead"}
          </h2>
          <button onClick={onClose}><X /></button>
        </div>

        <div className="space-y-3">
          <input
            className="w-full border p-2 rounded"
            placeholder="Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />

          <input
            className="w-full border p-2 rounded"
            placeholder="Phone"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
          />

          <input
            className="w-full border p-2 rounded"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />

          <input
            className="w-full border p-2 rounded"
            placeholder="Address"
            value={form.address || ""}
            onChange={e => setForm({ ...form, address: e.target.value })}
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
          {isEdit ? "Save Changes" : "Create Lead"}
        </button>
      </div>
    </div>
  );
}
