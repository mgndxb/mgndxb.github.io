import { AlsoBuilt } from "@/components/also-built";
import { Lab } from "@/components/lab";
import { Capabilities } from "@/components/capabilities";
import { CaseStudy } from "@/components/case-study";
import { Contact } from "@/components/contact";
import { Engine } from "@/components/engine";
import { Faq } from "@/components/faq";
import { Hero } from "@/components/hero/hero";
import { Honest } from "@/components/honest";
import { Manifesto } from "@/components/manifesto";
import { Marquee } from "@/components/marquee";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { Preloader } from "@/components/preloader";
import { Process } from "@/components/process";
import { Quotes } from "@/components/quotes";
import { Showroom } from "@/components/showroom/showroom";
import { SiteHeader } from "@/components/site-header";
import { Toolbox } from "@/components/toolbox";

export default function Home() {
  // The intro and smooth scrolling belong to the home page; other pages (the 404) load plainly.
  return (
    <>
      <Preloader />
      <SmoothScroll />
      <a href="#main" className="pill pill-solid sr-only fixed top-4 left-4 z-[300] focus:not-sr-only">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <Manifesto />
        <Showroom />
        <Quotes />
        <Lab />
        <AlsoBuilt />
        <CaseStudy />
        <Engine />
        <Marquee words={["Bookings", "Payments", "Admin apps", "Databases", "Auth", "Motion"]} />
        <Capabilities />
        <Marquee words={["TypeScript", "Next.js", "PostgreSQL", "Supabase", "Stripe", "React"]} reverse outline />
        <Toolbox />
        <Honest />
        <Process />
        <Faq />
        <Contact />
      </main>
    </>
  );
}
