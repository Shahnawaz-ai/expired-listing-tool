import { useState } from "react";

const WEBHOOK_URL =
  "https://shahai.app.n8n.cloud/webhook/1ca413d6-679b-40d3-9736-8a08ea30e7bd";

export default function App() {
  const [form, setForm] = useState({
    agentName: "",
    propertyAddress: "",
    propertyDetails: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState("");
  const [error, setError]     = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult("");
    setLoading(true);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "model": "llama-3.1-8b-instant",
          max_tokens: 1024,
          messages: [
            {
              role: "user",
              content: `You are a real estate expert. Write a short, personalized outreach script for agent ${form.agentName} to send to the owner of an expired listing at ${form.propertyAddress}. Property details: ${form.propertyDetails}.`,
            },
          ],
        }),
      });

      if (!response.ok)
        throw new Error(`Server returned ${response.status}. Check your n8n workflow.`);

      const data = await response.json();

      // n8n can return an array or plain object — handle both
      const d      = Array.isArray(data) ? data[0] : data;
      const script = d?.output ?? d?.text ?? d?.script ?? d?.message ?? "";

      if (!script)
        throw new Error("n8n returned an empty response. Check your workflow output node.");

      setResult(script);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => navigator.clipboard.writeText(result);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-16 px-4">

      {/* ── Header ── */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-2xl mb-4">
          🏠
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Expired Listing Outreach Tool
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Generate a personalised outreach script in seconds
        </p>
      </div>

      {/* ── Card ── */}
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Agent Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Agent Name <span className="text-amber-400">*</span>
            </label>
            <input
              name="agentName"
              value={form.agentName}
              onChange={handleChange}
              required
              placeholder="e.g. Sarah Mitchell"
              className="px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-sm
                         placeholder-slate-600 focus:outline-none focus:border-amber-500
                         focus:ring-1 focus:ring-amber-500/30 transition-all"
            />
          </div>

          {/* Property Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Property Address <span className="text-amber-400">*</span>
            </label>
            <input
              name="propertyAddress"
              value={form.propertyAddress}
              onChange={handleChange}
              required
              placeholder="e.g. 2847 Maplewood Drive, Austin TX 78701"
              className="px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-sm
                         placeholder-slate-600 focus:outline-none focus:border-amber-500
                         focus:ring-1 focus:ring-amber-500/30 transition-all"
            />
          </div>

          {/* Property Details */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Property Details <span className="text-amber-400">*</span>
            </label>
            <textarea
              name="propertyDetails"
              value={form.propertyDetails}
              onChange={handleChange}
              required
              rows={4}
              placeholder="e.g. 3 bed / 2 bath, listed at $485,000, 90 days on market, price likely too high"
              className="px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-sm
                         placeholder-slate-600 focus:outline-none focus:border-amber-500
                         focus:ring-1 focus:ring-amber-500/30 transition-all resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`mt-1 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all
              flex items-center justify-center gap-2
              ${loading
                ? "bg-amber-500/40 text-slate-600 cursor-not-allowed"
                : "bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95 shadow-lg shadow-amber-500/20"
              }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Generating Script…
              </>
            ) : (
              "✨  Generate Groq Script"
            )}
          </button>
        </form>

        {/* ── Error ── */}
        {error && (
          <div className="mt-5 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
            ⚠️ {error}
          </div>
        )}

        {/* ── Result ── */}
        {result && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Generated Script
              </p>
              <button
                onClick={handleCopy}
                className="text-xs text-slate-400 hover:text-white border border-slate-700
                           hover:border-slate-500 px-3 py-1 rounded-md transition-all"
              >
                📋 Copy
              </button>
            </div>
            <div
              className="p-5 rounded-xl bg-slate-950 border border-slate-800
                         text-sm text-slate-200 leading-relaxed whitespace-pre-wrap"
            >
              {result}
            </div>
          </div>
        )}
      </div>

      <p className="mt-8 text-xs text-slate-700">
        Powered by Claude AI · Built for real estate professionals
      </p>
    </div>
  );
}