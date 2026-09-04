import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Fold01 from "@/components/folds/Fold01";
import Fold02 from "@/components/folds/Fold02";
import Fold03 from "@/components/folds/Fold03";
import Fold04 from "@/components/folds/Fold04";
import Fold05 from "@/components/folds/Fold05";
import Fold06 from "@/components/folds/Fold06";
import Fold07 from "@/components/folds/Fold07";
import Fold08 from "@/components/folds/Fold08";

export default function Home() {
  return (
    <>
      <Header />

      <main>
        <Fold01 /> {/* Hero */}
        <Fold02 /> {/* Impact Numbers */}
        <Fold03 /> {/* App Family */}
        <Fold04 /> {/* App Directory Heading */}
        <Fold05 /> {/* App showcase stack — all four apps */}
        <Fold06 /> {/* Our Approach */}
        <Fold07 /> {/* Testimonials */}
        <Fold08 /> {/* Leadership & Partners */}
      </main>

      <Footer />
    </>
  );
}
