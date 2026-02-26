"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SetupContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Connect Whoop
        </h1>
        <p className="text-gray-600 mb-6">
          Connect your Whoop account to enable daily recovery-based coaching.
        </p>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 font-medium">
              Whoop connected successfully.
            </p>
            <p className="text-green-700 text-sm mt-1">
              Your daily coaching emails will now include recovery data.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 font-medium">Connection failed.</p>
            <p className="text-red-700 text-sm mt-1">
              {error === "token_exchange_failed"
                ? "Could not exchange authorization code. Please try again."
                : "An unexpected error occurred."}
            </p>
          </div>
        )}

        <a
          href="/api/whoop/connect"
          className="block w-full text-center px-4 py-3 bg-gray-900 text-white rounded-md font-medium hover:bg-gray-800 transition-colors"
        >
          {success ? "Reconnect Whoop" : "Connect Whoop Account"}
        </a>
      </div>
    </div>
  );
}

export default function WhoopSetupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <SetupContent />
    </Suspense>
  );
}
