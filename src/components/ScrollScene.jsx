import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './Navbar.jsx';
import SceneLines from './SceneLines.jsx';
import BookHero from './BookHero.jsx';
import SectionBlock from './SectionBlock.jsx';
import { splitBodyLines, splitHeading } from '../utils/textSplit.js';

export default function ScrollScene() {
  const rootRef = useRef(null);
  const navbarRef = useRef(null);
  const visionHRef = useRef(null);
  const missionHRef = useRef(null);
  const visionBRef = useRef(null);
  const missionBRef = useRef(null);
  const bookRef = useRef(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    let ctx = null;

    const buildScene = () => {
      ctx = gsap.context(() => {
        splitHeading(visionHRef.current);
        splitHeading(missionHRef.current);
        const visionLines = splitBodyLines(visionBRef.current);
        const missionLines = splitBodyLines(missionBRef.current);

        gsap.set('#visionHeading .char', { y: '0%' });
        gsap.set('#missionHeading .char', { y: '0%' });
        gsap.set(visionLines, { y: '0%' });
        gsap.set(missionLines, { y: '0%' });

        if (navbarRef.current) {
          const navBottom = navbarRef.current.getBoundingClientRect().bottom;
          rootRef.current?.style.setProperty('--nav-bottom', `${navBottom}px`);
        }

        const W = () => window.innerWidth;
        const H = () => window.innerHeight;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: '.scroll-container',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.1
          }
        });

        tl.to('#svgLineTop', {
          x: () => W() * 1.1,
          scaleX: 0.3,
          transformOrigin: 'left center',
          ease: 'none'
        }, 0);

        tl.to('#svgLineBottom', {
          x: () => -W() * 1.1,
          scaleX: 0.3,
          transformOrigin: 'right center',
          ease: 'none'
        }, 0);

        tl.to('#svgLineCenter', {
          x: () => -W() * 0.4,
          scaleX: 0.2,
          transformOrigin: 'left center',
          ease: 'none'
        }, 0);

        tl.to('#svgLineLeftWrap', {
          y: () => H() * 1.2,
          scaleY: 0.1,
          transformOrigin: 'center top',
          ease: 'none'
        }, 0);

        tl.to('#svgLineRightWrap', {
          y: () => -H() * 1.2,
          scaleY: 0.1,
          transformOrigin: 'center bottom',
          ease: 'none'
        }, 0);

        tl.to(bookRef.current, { rotation: 0, ease: 'none' }, 0);

        tl.to('#visionHeading .char', {
          y: '-186%',
          stagger: 0.022,
          ease: 'power3.inOut',
          duration: 0.42
        }, 0.04);

        tl.to('#missionHeading .char', {
          y: '-186%',
          stagger: 0.022,
          ease: 'power3.inOut',
          duration: 0.42
        }, 0.10);

        tl.to(visionLines, {
          y: '-150%',
          stagger: 0.038,
          ease: 'power2.inOut',
          duration: 0.38
        }, 0.30);

        tl.to(missionLines, {
          y: '-150%',
          stagger: 0.038,
          ease: 'power2.inOut',
          duration: 0.38
        }, 0.38);

        ScrollTrigger.create({
          trigger: '.scroll-container',
          start: 'top-=1 top',
          onEnter: () => navbarRef.current?.classList.add('is-sticky'),
          onLeaveBack: () => navbarRef.current?.classList.remove('is-sticky')
        });
      }, rootRef);
    };

    const rebuild = () => {
      ctx?.revert();
      buildScene();
      ScrollTrigger.refresh();
    };

    buildScene();

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => rebuild());
    }

    const onResize = () => rebuild();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      ctx?.revert();
    };
  }, []);

  return (
    <div className="scroll-container" ref={rootRef}>
      <div className="sticky-scene">
        <Navbar ref={navbarRef} />
        <SceneLines />
        <BookHero bookRef={bookRef} />
        <SectionBlock
          className="vision-block"
          headingId="visionHeading"
          headingRef={visionHRef}
          bodyId="visionBody"
          bodyRef={visionBRef}
          heading="Our\nVision"
          body="To be a change agent in developing a just and compassionate Indian society in which all people have fair and equitable opportunities to achieve their optimum potential through charitable, holistic, and sustainable development work among the marginalised, downtrodden, vulnerable, and exploited."
        />
        <SectionBlock
          className="mission-block"
          headingId="missionHeading"
          headingRef={missionHRef}
          bodyId="missionBody"
          bodyRef={missionBRef}
          heading="Our\nMission"
          body="To empower people through effective communication and awareness programmes, strengthen their voice, and improve their participation in promoting their socio-educational and economic status through a rationalistic and scientific approach to establish a just and democratic social order."
        />
      </div>
    </div>
  );
}
