import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Crosshair, Menu, X } from "lucide-react";
import { cn } from "../utils/cn";

const LINKS = [
  { id: "theory", n: "01", label: "Теория" },
  { id: "types", n: "02", label: "Классификация" },
  { id: "lab", n: "03", label: "Лаборатория" },
  { id: "calc", n: "04", label: "Калькулятор" },
  { id: "instruments", n: "05", label: "Средства измерений" },
  { id: "gauge", n: "06", label: "Прибор" },
  { id: "quiz", n: "07", label: "Тест" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 });

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-all duration-500",
        scrolled ? "border-line bg-ink/85 backdrop-blur-xl" : "border-transparent bg-transparent",
      )}
    >
      <motion.div className="absolute inset-x-0 top-0 h-[2px] origin-left bg-gradient-to-r from-amber to-cyanx" style={{ scaleX: progress }} />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="group flex items-center gap-3">
          <span className="grid size-9 place-items-center border border-amber/60 bg-amber/10 text-amber transition-colors group-hover:bg-amber group-hover:text-ink">
            <Crosshair size={17} strokeWidth={1.8} />
          </span>
          <span className="font-display text-sm font-semibold tracking-[0.18em] uppercase">
            Метро<span className="text-amber">стенд</span>
          </span>
        </a>

        <nav className="hidden items-center gap-6 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className="group font-mono text-[11px] tracking-[0.2em] uppercase text-fog transition-colors hover:text-paper"
            >
              <span className="mr-1.5 text-amber/70">{l.n}</span>
              {l.label}
              <span className="block h-px max-w-0 bg-amber transition-all duration-300 group-hover:max-w-full" />
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 font-mono text-[10px] tracking-[0.25em] uppercase text-fog lg:flex">
          <span className="size-1.5 animate-pulse rounded-full bg-mint" />
          лаб. режим активен
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="grid size-10 place-items-center border border-line text-paper lg:hidden"
          aria-label="Меню"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-line bg-ink/95 px-5 py-4 backdrop-blur-xl lg:hidden">
          {LINKS.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              onClick={() => setOpen(false)}
              className="flex items-baseline gap-3 border-b border-line/50 py-3 font-mono text-xs tracking-[0.2em] uppercase text-fog last:border-0 hover:text-paper"
            >
              <span className="text-amber">{l.n}</span> {l.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
