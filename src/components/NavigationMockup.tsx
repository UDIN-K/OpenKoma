export function NavigationMockup() {
  return (
    <div className="hidden sm:flex h-6 bg-black items-center justify-center gap-12 mt-auto w-full absolute bottom-0 z-20">
      <div className="w-3 h-3 bg-white/50 rounded-sm" />
      <div className="w-8 h-3 bg-white/50 rounded-full" />
      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-white/50 rotate-90" />
    </div>
  );
}
