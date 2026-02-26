import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-lg w-full p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          Wedding Assistant
        </h1>
        <p className="text-gray-500 mb-8">Fitness Coach MVP</p>

        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <h2 className="font-medium text-gray-900 mb-1">Whoop Integration</h2>
            <p className="text-sm text-gray-500 mb-3">
              Connect your Whoop to enable recovery-based coaching.
            </p>
            <Link
              href="/whoop/setup"
              className="text-sm font-medium text-gray-900 hover:underline"
            >
              Setup Whoop →
            </Link>
          </div>

          <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <h2 className="font-medium text-gray-900 mb-1">Daily Coach</h2>
            <p className="text-sm text-gray-500">
              Sends a personalized fitness email every morning at 6am CST
              based on your Whoop recovery, training plan, and feedback.
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <h2 className="font-medium text-gray-900 mb-1">Coming Soon</h2>
            <ul className="text-sm text-gray-500 space-y-1 mt-1">
              <li>Wedding planning to-do tracker</li>
              <li>Beauty regimen coach</li>
              <li>Outfit shopping guide</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
