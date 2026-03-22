import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './Navbar.jsx';
import SceneLines from './SceneLines.jsx';
import BookHero from './BookHero.jsx';
import SectionBlock from './SectionBlock.jsx';
import { splitBodyLines, splitHeading } from '../utils/textSplit.js';

const SCROLL_THRESHOLD = 55;

export default function ScrollScene() {
  const rootRef = useRef(null);
  const navbarRef = useRef(null);
  const visionHRef = useRef(null);
  const missionHRef = useRef(null);
  const visionBRef = useRef(null);
  const missionBRef = useRef(null);
  const bookWrapperRef = useRef(null);
  const closedBookRef = useRef(null);
  const flipPanelRef = useRef(null);
  const openBookRef = useRef(null);
  const visionLinesRef = useRef([]);
  const missionLinesRef = useRef([]);
  const textTimelineRef = useRef(null);
  const bookStateRef = useRef('closed');

  const setClosedVisible = (visible) => {
    if (!closedBookRef.current) return;
    closedBookRef.current.style.opacity = visible ? '1' : '0';
    closedBookRef.current.style.pointerEvents = visible ? 'auto' : 'none';
  };

  const setOpenVisible = (visible) => {
    if (!openBookRef.current) return;
    openBookRef.current.classList.toggle('book-visible', visible);
    rootRef.current?.classList.toggle('book-open-bg', visible);
  };

  const setOpenState = (state) => {
    if (!openBookRef.current) return;
    openBookRef.current.classList.toggle('is-opening', state === 'opening');
    openBookRef.current.classList.toggle('is-closing', state === 'closing');
  };

  const setShifted = (shifted) => {
    if (!bookWrapperRef.current) return;
    bookWrapperRef.current.classList.toggle('book-shifted', shifted);
  };

  const launchFlip = (animClass, startRot, onDone) => {
    if (!flipPanelRef.current) return;
    const panel = flipPanelRef.current;
    panel.classList.remove('do-open', 'do-close');
    panel.style.animation = 'none';
    panel.style.transform = `rotateY(${startRot}deg)`;
    panel.style.display = 'block';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        panel.style.animation = '';
        panel.classList.add(animClass);
        panel.addEventListener('animationend', () => {
          panel.style.display = 'none';
          panel.classList.remove(animClass);
          onDone?.();
        }, { once: true });
      });
    });
  };

  const animateTextOut = (onDone) => {
    textTimelineRef.current?.kill();
    const visionChars = rootRef.current?.querySelectorAll('#visionHeading .char') || [];
    const missionChars = rootRef.current?.querySelectorAll('#missionHeading .char') || [];

    const tl = gsap.timeline({ onComplete: onDone });
    tl.to(visionChars, {
      y: '-186%',
      stagger: 0.022,
      ease: 'power3.inOut',
      duration: 0.42
    }, 0.04);

    tl.to(missionChars, {
      y: '-186%',
      stagger: 0.022,
      ease: 'power3.inOut',
      duration: 0.42
    }, 0.10);

    tl.to(visionLinesRef.current, {
      y: '-150%',
      stagger: 0.038,
      ease: 'power2.inOut',
      duration: 0.38
    }, 0.30);

    tl.to(missionLinesRef.current, {
      y: '-150%',
      stagger: 0.038,
      ease: 'power2.inOut',
      duration: 0.38
    }, 0.38);

    textTimelineRef.current = tl;
  };

  const animateTextIn = (onDone) => {
    textTimelineRef.current?.kill();
    const visionChars = rootRef.current?.querySelectorAll('#visionHeading .char') || [];
    const missionChars = rootRef.current?.querySelectorAll('#missionHeading .char') || [];

    const tl = gsap.timeline({ onComplete: onDone });
    tl.to(visionChars, {
      y: '0%',
      stagger: 0.02,
      ease: 'power3.inOut',
      duration: 0.32
    }, 0);

    tl.to(missionChars, {
      y: '0%',
      stagger: 0.02,
      ease: 'power3.inOut',
      duration: 0.32
    }, 0.06);

    tl.to(visionLinesRef.current, {
      y: '0%',
      stagger: 0.03,
      ease: 'power2.inOut',
      duration: 0.3
    }, 0.12);

    tl.to(missionLinesRef.current, {
      y: '0%',
      stagger: 0.03,
      ease: 'power2.inOut',
      duration: 0.3
    }, 0.18);

    textTimelineRef.current = tl;
  };

  const doOpen = () => {
    if (bookStateRef.current !== 'closed') return;
    bookStateRef.current = 'opening';
    setShifted(true);
    animateTextOut(() => {
      setClosedVisible(false);
      setOpenVisible(true);
      setOpenState('opening');
      launchFlip('do-open', 0, () => {
        setOpenState('open');
        bookStateRef.current = 'open';
      });
    });
  };

  const doClose = () => {
    if (bookStateRef.current !== 'open') return;
    bookStateRef.current = 'closing';
    setOpenState('closing');
    launchFlip('do-close', -180, () => {
      setOpenVisible(false);
      setClosedVisible(true);
      setShifted(false);
      setOpenState('closed');
      animateTextIn(() => {
        bookStateRef.current = 'closed';
      });
    });
  };

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    let ctx = null;

    const buildScene = () => {
      ctx = gsap.context(() => {
        splitHeading(visionHRef.current);
        splitHeading(missionHRef.current);
        visionLinesRef.current = splitBodyLines(visionBRef.current);
        missionLinesRef.current = splitBodyLines(missionBRef.current);

        gsap.set('#visionHeading .char', { y: '0%' });
        gsap.set('#missionHeading .char', { y: '0%' });
        gsap.set(visionLinesRef.current, { y: '0%' });
        gsap.set(missionLinesRef.current, { y: '0%' });

        if (navbarRef.current) {
          const navBottom = navbarRef.current.getBoundingClientRect().bottom;
          rootRef.current?.style.setProperty('--nav-bottom', `${navBottom}px`);
        }

        const W = () => window.innerWidth;
        const H = () => window.innerHeight;

        const lineTl = gsap.timeline({
          scrollTrigger: {
            trigger: '.scroll-container',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.1
          }
        });

        lineTl.to('#svgLineTop', {
          x: () => W() * 1.1,
          scaleX: 0.3,
          transformOrigin: 'left center',
          ease: 'none'
        }, 0);

        lineTl.to('#svgLineBottom', {
          x: () => -W() * 1.1,
          scaleX: 0.3,
          transformOrigin: 'right center',
          ease: 'none'
        }, 0);

        lineTl.to('#svgLineCenter', {
          x: () => -W() * 0.4,
          scaleX: 0.2,
          transformOrigin: 'left center',
          ease: 'none'
        }, 0);

        lineTl.to('#svgLineLeftWrap', {
          y: () => H() * 1.2,
          scaleY: 0.1,
          transformOrigin: 'center top',
          ease: 'none'
        }, 0);

        lineTl.to('#svgLineRightWrap', {
          y: () => -H() * 1.2,
          scaleY: 0.1,
          transformOrigin: 'center bottom',
          ease: 'none'
        }, 0);

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
    setClosedVisible(true);
    setOpenVisible(false);

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => rebuild());
    }

    const onResize = () => rebuild();
    window.addEventListener('resize', onResize);

    let lastY = window.scrollY;
    let acc = 0;

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;

      if (delta !== 0 && Math.sign(delta) !== Math.sign(acc)) acc = 0;
      acc += delta;

      if (acc > SCROLL_THRESHOLD && bookStateRef.current === 'closed') {
        acc = 0;
        doOpen();
      }

      if (acc < -SCROLL_THRESHOLD && bookStateRef.current === 'open') {
        acc = 0;
        doClose();
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      ctx?.revert();
    };
  }, []);

  return (
    <div className="scroll-container" ref={rootRef}>
      <div className="sticky-scene">
        <Navbar ref={navbarRef} />
        <SceneLines />
        <BookHero
          wrapperRef={bookWrapperRef}
          closedBookRef={closedBookRef}
          flipPanelRef={flipPanelRef}
          openBookRef={openBookRef}
          onClosedClick={doOpen}
          onLeftPageClick={doClose}
          onRightCoverClick={doClose}
        />
        <SectionBlock
          className="vision-block"
          headingId="visionHeading"
          headingRef={visionHRef}
          bodyId="visionBody"
          bodyRef={visionBRef}
          heading="Our Vision"
          body="To be a change agent in developing a just and compassionate Indian society in which all people have fair and equitable opportunities to achieve their optimum potential through charitable, holistic, and sustainable development work among the marginalised, downtrodden, vulnerable, and exploited."
        />
        <SectionBlock
          className="mission-block"
          headingId="missionHeading"
          headingRef={missionHRef}
          bodyId="missionBody"
          bodyRef={missionBRef}
          heading="Our Mission"
          body="To empower people through effective communication and awareness programmes, strengthen their voice, and improve their participation in promoting their socio-educational and economic status through a rationalistic and scientific approach to establish a just and democratic social order."
        />
      </div>
    </div>
  );
}
