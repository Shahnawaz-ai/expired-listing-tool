import { useState } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";

export default function App() {
  const { user } = useUser(); // Get Clerk user data
  const [form, setForm] = useState({
    agentName: "",
    propertyAddress: "",
    propertyDetails: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [usesLeft, setUsesLeft] = useState(null); // Track uses

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult("");
    setLoading(true);

    try {
      // Point to our new Vercel API route
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          email: user.primaryEmailAddress.emailAddress,
          model: "llama-3.1-8b-instant",
          max_tokens: 1024,
          messages: [
            {
              role: "user",
              content: `You are a real estate expert. Write a short, personalized outreach script for agent ${form.agentName} to send to the owner of an expired listing at ${form.propertyAddress}. Property details: ${form.propertyDetails}.`,
            },
          ],
        }),
      });

      const data = await response.json();

      // Handle trial expiration
      if (response.status === 403 || data.error === "TRIAL_EXPIRED") {
        setError("TRIAL_EXPIRED");
        setLoading(false);
        return;
      }

      if (!response.ok) throw new Error(data.error || "Something went wrong.");

      setResult(data.script);
      setUsesLeft(data.usesLeft); // Update the remaining uses
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => navigator.clipboard.writeText(result);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      {/* Header with User Profile */}
      <div className="flex justify-end mb-8">
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto text-center">
        <SignedOut>
          <div className="mt-20">
            <h1 className="text-4xl font-bold mb-4">Expired Listing Outreach Tool</h1>
            <p className="text-slate-400 mb-8">Sign in to start generating professional outreach scripts.</p>
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-full transition">
                Sign In / Sign Up
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          <h1 className="text-2xl font-bold mb-6">Welcome to your dashboard</h1>
          
          <div className="w-full max-w-2xl mx-auto bg-slate-950 border border-slate-800 rounded-2xl p-8 shadow-2xl text-left">
            
            {/* Show Uses Left */}
            {usesLeft !== null && error !== "TRIAL_EXPIRED" && (
              <p className="text-xs text-center text-slate-400 mb-4 font-semibold tracking-wide">
                {usesLeft === "unlimited"
                  ? "✅ Unlimited access"
                  : `⚡ ${usesLeft} free uses remaining`}
              </p>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                  className="px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>

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
                  className="px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>

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
                  placeholder="e.g. 3 bed / 2 bath, listed at $485,000, 90 days on market"
                  className="px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || error === "TRIAL_EXPIRED"}
                className={`mt-1 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 ${
                  loading || error === "TRIAL_EXPIRED"
                    ? "bg-amber-500/40 text-slate-600 cursor-not-allowed"
                    : "bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95 shadow-lg shadow-amber-500/20"
                }`}
              >
                {loading ? "Generating Script..." : "✨ Generate Groq Script"}
              </button>
            </form>

            {/* Trial Expired Upgrade Prompt */}
            {error === "TRIAL_EXPIRED" && (
              <div className="mt-6 p-6 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
                <p className="text-lg text-amber-400 font-bold mb-2">
                  You have used all your free trials!
                </p>
                <p className="text-sm text-slate-400 mb-6">
                  Upgrade to get unlimited access and close more deals.
                </p>
                <a
                  href="#"
                  className="inline-block px-8 py-3 bg-amber-500 text-slate-950 font-bold text-sm rounded-lg hover:bg-amber-400 transition-all shadow-lg"
                >
                  Upgrade for $15/month
                </a>
              </div>
            )}

            {/* General Error Message */}
            {error && error !== "TRIAL_EXPIRED" && (
              <div className="mt-5 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
                ⚠️ {error}
              </div>
            )}

            {/* Result Output */}
            {result && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
                    Generated Script
                  </p>
                  <button
                    onClick={handleCopy}
                    className="text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-1 rounded-md transition-all"
                  >
                    📋 Copy
                  </button>
                </div>
                <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {result}
                </div>
              </div>
            )}
          </div>
        </SignedIn>
      </div>
    </div>
  );
}