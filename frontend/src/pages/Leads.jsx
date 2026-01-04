import { useEffect, useState } from "react";
import { fetchLeads } from "../utils/leadService";
import LeadsTabs from "../components/leads/LeadsTabs";
import LeadsTable from "../components/leads/LeadsTable";
import PipelineBoard from "../components/leads/PipelineBoard";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [source, setSource] = useState("all");
  const [view, setView] = useState("table"); // table | pipeline
  const [loading, setLoading] = useState(true);

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
      <h1 className="text-3xl font-bold mb-6">Leads</h1>

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
    </div>
  );
}
