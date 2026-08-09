import ScrollScene from './ScrollScene.jsx';
import MobileAcademyIntro from './MobileAcademyIntro.jsx';
import ImpactSection from './ImpactSection.jsx';
import ObjectivesSection from './ObjectivesSection.jsx';
import EventsSection from './EventsSection.jsx';
import ClosingSection from './ClosingSection.jsx';

export default function HomePage() {
  return (
    <>
      <ScrollScene />
      <MobileAcademyIntro />
      <ImpactSection />
      <ObjectivesSection />
      <EventsSection />
      <ClosingSection />
    </>
  );
}
