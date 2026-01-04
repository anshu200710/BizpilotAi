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
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Leads</h1>
          <p className="text-sm text-gray-500">
            Manage and track your customer leads
          </p>
        </div>

        <button
          onClick={() => setOpenCreate(true)}
          className="inline-flex items-center justify-center
          bg-indigo-600 hover:bg-indigo-700
          text-white px-4 py-2 rounded-lg text-sm font-medium
          transition shadow-sm"
        >
          + Add Lead
        </button>
      </div>

      {/* FILTER / VIEW TABS */}
      <LeadsTabs
        source={source}
        setSource={setSource}
        view={view}
        setView={setView}
      />

      {/* CONTENT */}
      <div className="mt-6">
        {loading ? (
          <div className="py-20 text-center text-gray-500 animate-pulse">
            Loading leads…
          </div>
        ) : view === "table" ? (
          <LeadsTable leads={leads} reload={loadLeads} />
        ) : (
          <PipelineBoard leads={leads} reload={loadLeads} />
        )}
      </div>

      {/* CREATE DRAWER */}
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
