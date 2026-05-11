'use client';
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <button onClick={reset} className="px-4 py-2 bg-[#0081FB] rounded-lg hover:brightness-110">Try again</button>
      </div>
    </div>
  );
}
