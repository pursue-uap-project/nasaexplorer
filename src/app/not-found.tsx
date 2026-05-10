import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50/60 flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">

      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%]  w-[500px] h-[500px] bg-blue-100/60  rounded-full blur-3xl" />
        <div className="absolute bottom-[-5%] right-[-8%] w-[400px] h-[400px] bg-indigo-100/50 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-5 max-w-md">
        <img
          src="/nasaexplorer/nasa-logo.png"
          alt="NASA"
          className="h-16 w-auto opacity-35"
        />

        <p className="text-xs font-mono tracking-[0.3em] text-foreground/30 uppercase">
          Error 404
        </p>

        <h1 className="text-4xl sm:text-5xl font-bold text-primary leading-tight">
          Houston, we have a problem.
        </h1>

        <p className="text-foreground/50 leading-relaxed">
          This page drifted out of orbit. Let&apos;s get you back on course.
        </p>

        <Link
          href="/en/"
          className="mt-2 bg-primary text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200"
        >
          Back to Mission Control
        </Link>
      </div>
    </main>
  );
}
