import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

function App() {
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
          {/* PASTE YOUR TOOL CODE HERE */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
             <p>Your outreach tool will go here!</p>
          </div>
        </SignedIn>
      </div>
    </div>
  );
}

export default App;