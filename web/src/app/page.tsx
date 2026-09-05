import Nav from '@/components/layout/Nav'
import Hero from '@/components/sections/Hero'
import HowItWorks from '@/components/sections/HowItWorks'
import SampleVerdict from '@/components/sections/SampleVerdict'
import WhyVerid from '@/components/sections/WhyVerid'
import FinalCta from '@/components/sections/FinalCta'
import Footer from '@/components/sections/Footer'

/**
 * The Verid landing page and live tool, assembled in the section order
 * given by FRONTEND_SPEC.md.
 * @returns the single public page
 */
export default function Page() {
  return (
    <main className="snap-y snap-proximity overflow-y-auto h-[100dvh]">
      <Nav />
      <Hero />
      <HowItWorks />
      <SampleVerdict />
      <WhyVerid />
      <FinalCta />
      <Footer />
    </main>
  )
}
