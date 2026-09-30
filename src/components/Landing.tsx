import { Faq } from "./Faq";
import { FinalCta } from "./FinalCta";
import { Hero } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import { LandingNav } from "./LandingNav";
import { Letter } from "./Letter";
import { Promises } from "./Promises";
import { TheHardPart } from "./TheHardPart";
import { YourPeople } from "./YourPeople";


/** The front door. One job: help a nervous person feel that taking the first step is safe. */
export function Landing({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="min-h-screen">
      <LandingNav onEnter={onEnter} />
      <main>
        <Hero onEnter={onEnter} />
        <TheHardPart />
        <HowItWorks />
        <YourPeople />
        <Promises />
        <Letter />
        <Faq />
        <FinalCta onEnter={onEnter} />
      </main>
    </div>
  )
}