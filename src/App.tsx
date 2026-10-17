import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Theory from "./components/Theory";
import Classification from "./components/Classification";
import LabErrorTypes from "./components/LabErrorTypes";
import GaussSim from "./components/GaussSim";
import Calculators from "./components/Calculators";
import Instruments from "./components/Instruments";
import VirtualGauge from "./components/VirtualGauge";
import Quiz from "./components/Quiz";
import Footer from "./components/Footer";
import { Marquee } from "./components/ui";

export default function App() {
  return (
    <div className="noise relative min-h-screen bg-ink font-sans text-paper">
      <Navbar />
      <main>
        <Hero />
        <Marquee
          items={[
            "погрешность — неизбежна",
            "истинное значение непознаваемо",
            "Δ = Xизм − Xист",
            "теория первый шаг",
          ]}
        />
        <Theory />
        <Classification />
        <Marquee
          items={[
            "систематическая — устрани причину",
            "случайная — усредни",
            "промах — исключи",
            "σ правит серией",
          ]}
        />
        <LabErrorTypes />
        <GaussSim />
        <Calculators />
        <Marquee
          items={[
            "мера · преобразователь · прибор",
            "класс точности нормируется",
            "цена деления шага шкалы",
            "установка + система",
          ]}
        />
        <Instruments />
        <VirtualGauge />
        <Quiz />
      </main>
      <Footer />
    </div>
  );
}
