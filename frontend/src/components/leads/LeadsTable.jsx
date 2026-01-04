import LeadDrawer from "./LeadDrawer";
import { useState } from "react";
import { Pencil, Trash } from "lucide-react";
import { deleteLead } from "../../utils/leadService";

export default function LeadsTable({ leads, reload }) {
    const [selected, setSelected] = useState(null);


    const handleDelete = async (id) => {
        if (!window.confirm("Delete this lead?")) return;
        await deleteLead(id);
        reload();
    };

    return (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-100 text-left text-sm">
                    <tr>
                        <th className="p-3">Name</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">Source</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {leads.map((lead) => (
                        <tr key={lead._id} className="border-t hover:bg-gray-50">
                            <td className="p-3 font-medium">{lead.name || "—"}</td>
                            <td className="p-3">{lead.phone}</td>
                            <td className="p-3 capitalize">{lead.source}</td>
                            <td className="p-3 capitalize">{lead.status}</td>
                            <td className="p-3">
                                <select
                                    value={lead.status}
                                    onChange={async (e) => {
                                        await updateLeadStatus(lead._id, {
                                            status: e.target.value,
                                            pipelineOrder: Date.now()
                                        })
                                        reload()
                                    }}
                                    className="border rounded px-2 py-1 text-sm"
                                >
                                    <option value="new">New</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="paid">Paid</option>
                                    <option value="unpaid">Unpaid</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </td>

                            <td className="p-3 flex gap-2">
                                <button className="text-indigo-600" onClick={() => setSelected(lead)}>
                                    <Pencil size={16} />
                                </button>
                                <button className="text-red-500" onClick={() => handleDelete(lead._id)}>
                                    <Trash size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {selected && (
                <LeadDrawer
                    lead={selected}
                    onClose={() => setSelected(null)}
                    reload={reload}
                />
            )}
        </div>
    );
}
