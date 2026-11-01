// app/movies/loading.jsx
export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Şık bir spinner veya mini card */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white font-medium text-sm tracking-wider">YÜKLENİYOR...</p>
      </div>
    </div>
  );
}