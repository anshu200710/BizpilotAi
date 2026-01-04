import { useEffect, useState } from "react";
import { fetchLeads } from "../utils/leadService";
import LeadsTabs from "../components/leads/LeadsTabs";
import LeadsTable from "../components/leads/LeadsTable";
import PipelineBoard from "../components/leads/PipelineBoard";
import LeadDrawer from "../components/leads/LeadDrawer";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [source, setSource] = useState("all");
  const [view, setView] = useState("table");
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);

  const loadLeads = async () => {
    setLoading(true);
    const params = source === "all" ? {} : { source };
    const res = await fetchLeads(params);
    setLeads(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadLeads();
  }, [source]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Leads</h1>

        {/* ✅ MANUAL CREATE BUTTON */}
        <button
          onClick={() => setOpenCreate(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
        >
          + Add Lead
        </button>
      </div>

      <LeadsTabs
        source={source}
        setSource={setSource}
        view={view}
        setView={setView}
      />

      {loading ? (
        <div className="mt-10 text-center text-gray-500">
          Loading leads...
        </div>
      ) : view === "table" ? (
        <LeadsTable leads={leads} reload={loadLeads} />
      ) : (
        <PipelineBoard leads={leads} reload={loadLeads} />
      )}

      {/* ✅ CREATE DRAWER */}
      {openCreate && (
        <LeadDrawer
          lead={null}
          onClose={() => setOpenCreate(false)}
          reload={loadLeads}
        />
      )}
    </div>
  );
}
