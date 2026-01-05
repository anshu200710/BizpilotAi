import { useState } from "react";
import API from "../../utils/axios";

export default function ColdOutreachModal({ leadIds, onClose }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    setLoading(true);
    await API.post("/api/cold-outreach/send", {
      leadIds,
      prompt
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-3">Cold Outreach Message</h2>

        <textarea
          className="w-full border p-3 rounded mb-4"
          rows={5}
          placeholder="Write instruction for AI (eg. Introduce my digital marketing services politely)"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>
          <button
            disabled={loading}
            onClick={send}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </div>
      </div>
    </div>
  );
}
