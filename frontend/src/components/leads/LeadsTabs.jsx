export default function LeadsTabs({ source, setSource, view, setView }) {
  const tabClass = (active) =>
    `px-4 py-2 rounded-lg text-sm font-semibold ${
      active ? "bg-indigo-600 text-white" : "bg-gray-100"
    }`;

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex gap-2">
        <button className={tabClass(source === "all")} onClick={() => setSource("all")}>All</button>
        <button className={tabClass(source === "scraper")} onClick={() => setSource("scraper")}>Scraper</button>
        <button className={tabClass(source === "whatsapp")} onClick={() => setSource("whatsapp")}>WhatsApp</button>
      </div>

      <div className="flex gap-2">
        <button className={tabClass(view === "table")} onClick={() => setView("table")}>
          Table
        </button>
        <button className={tabClass(view === "pipeline")} onClick={() => setView("pipeline")}>
          Pipeline
        </button>
      </div>
    </div>
  );
}
