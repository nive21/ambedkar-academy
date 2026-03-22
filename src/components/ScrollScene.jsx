import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './Navbar.jsx';
import SceneLines from './SceneLines.jsx';
import BookHero from './BookHero.jsx';
import SectionBlock from './SectionBlock.jsx';
import { splitBodyLines, splitHeading } from '../utils/textSplit.js';

const SCROLL_THRESHOLD = 55;
const ANIM_SPEED = 1.5;
const TIMING = {
  textMissionOut: 0.24 * ANIM_SPEED,
  textMissionLinesOut: 0.22 * ANIM_SPEED,
  textVisionOut: 0.34 * ANIM_SPEED,
  textVisionLinesOut: 0.3 * ANIM_SPEED,
  textIn: 0.32 * ANIM_SPEED,
  textLinesIn: 0.3 * ANIM_SPEED,
  tabs: 0.2 * ANIM_SPEED
};

const TAB_CONFIG = [
  {
    id: 'history',
    label: 'History',
    pages: [
      {
        left: {
          title: 'About<br />Dr.&nbsp;Ambedkar<br />Academy',
          body: ''
        },
        right: {
          title: "'70s",
          body:
            "The People's Educational Trust – Dr. Ambedkar Academy is a unique organisation with the privilege of serving marginalised people for over 45 years. It blossomed from informal monthly gatherings of socially conscious intellectuals way back in the 1970s to discuss and deliberate on issues concerning the development of marginalised people."
        }
      },
      {
        left: {
          title: 'Feb 1976',
          body: 'A turning point that established a lasting commitment to inclusive education.'
        },
        right: {
          title: 'Jan 1996',
          body: 'A decade of community programs expanded access and deepened impact across the region.'
        }
      }
    ]
  },
  {
    id: 'impact',
    label: 'Impact',
    pages: [
      {
        left: {
          title: 'Impact 1',
          body: 'Scholarships, mentorship, and support programs that opened doors.'
        },
        right: {
          title: 'Impact 2',
          body: 'Grassroots initiatives that strengthened families and local economies.'
        }
      }
    ]
  },
  {
    id: 'members',
    label: 'Members',
    pages: [
      {
        left: {
          title: 'Members',
          body: 'A community of educators, advocates, and volunteers.'
        },
        right: {
          title: 'Join Us',
          body: 'Contribute your time, expertise, or support to extend our mission.'
        }
      }
    ]
  }
];

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
  const leftHalfRef = useRef(null);
  const visionLinesRef = useRef([]);
  const missionLinesRef = useRef([]);
  const textTimelineRef = useRef(null);
  const lineTweenRef = useRef(null);
  const closeTimeoutRef = useRef(null);
  const bookStateRef = useRef('closed');
  const [activeTab, setActiveTab] = useState('history');
  const [pageIndex, setPageIndex] = useState(0);
  const [isLeftHalfVisible, setIsLeftHalfVisible] = useState(false);

  const setClosedVisible = (visible) => {
    if (!closedBookRef.current) return;
    closedBookRef.current.style.opacity = visible ? '1' : '0';
    closedBookRef.current.style.pointerEvents = visible ? 'auto' : 'none';
  };

  const setOpenVisible = (visible) => {
    if (!openBookRef.current) return;

    openBookRef.current.style.display = visible ? 'block' : 'none';
    openBookRef.current.classList.toggle('book-visible', visible);
    document.body.classList.toggle('book-open-bg', visible);
  };

  const setLeftHalfVisible = (visible) => {
    setIsLeftHalfVisible(visible);
  };

  const setOpenState = (state) => {
    if (!openBookRef.current) return;
    openBookRef.current.classList.toggle('is-opening', state === 'opening');
    openBookRef.current.classList.toggle('is-closing', state === 'closing');
  };

  const setTabsVisible = (visible) => {
    if (!openBookRef.current) return;
    openBookRef.current.classList.toggle('tabs-visible', visible);
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
        panel.addEventListener(
          'animationend',
          () => {
            panel.style.display = 'none';
            panel.classList.remove(animClass);
            onDone?.();
          },
          { once: true }
        );
      });
    });
  };

  const animateLinesOut = (onDone) => {
    lineTweenRef.current?.kill();
    const W = () => window.innerWidth;
    const H = () => window.innerHeight;
    const tl = gsap.timeline({ onComplete: onDone });

    tl.to('#svgLineTop', {
      x: () => W() * 1.1,
      scaleX: 0.3,
      transformOrigin: 'left center',
      ease: 'power2.in',
      duration: 0.28 * ANIM_SPEED
    }, 0);

    tl.to('#svgLineBottom', {
      x: () => -W() * 1.1,
      scaleX: 0.3,
      transformOrigin: 'right center',
      ease: 'power2.in',
      duration: 0.28 * ANIM_SPEED
    }, 0);

    tl.to('#svgLineCenter', {
      x: () => -W() * 0.4,
      scaleX: 0.2,
      transformOrigin: 'left center',
      ease: 'power2.in',
      duration: 0.28 * ANIM_SPEED
    }, 0);

    tl.to('#svgLineLeftWrap', {
      y: () => H() * 1.2,
      scaleY: 0.1,
      transformOrigin: 'center top',
      ease: 'power2.in',
      duration: 0.28 * ANIM_SPEED
    }, 0);

    tl.to('#svgLineRightWrap', {
      y: () => -H() * 1.2,
      scaleY: 0.1,
      transformOrigin: 'center bottom',
      ease: 'power2.in',
      duration: 0.28 * ANIM_SPEED
    }, 0);

    lineTweenRef.current = tl;
  };

  const animateLinesIn = (onDone) => {
    lineTweenRef.current?.kill();
    const tl = gsap.timeline({ onComplete: onDone });

    tl.to('#svgLineTop', {
      x: 0,
      scaleX: 1,
      transformOrigin: 'left center',
      ease: 'power2.out',
      duration: 0.32 * ANIM_SPEED
    }, 0);

    tl.to('#svgLineBottom', {
      x: 0,
      scaleX: 1,
      transformOrigin: 'right center',
      ease: 'power2.out',
      duration: 0.32 * ANIM_SPEED
    }, 0);

    tl.to('#svgLineCenter', {
      x: 0,
      scaleX: 1,
      transformOrigin: 'left center',
      ease: 'power2.out',
      duration: 0.32 * ANIM_SPEED
    }, 0);

    tl.to('#svgLineLeftWrap', {
      y: 0,
      scaleY: 1,
      transformOrigin: 'center top',
      ease: 'power2.out',
      duration: 0.32 * ANIM_SPEED
    }, 0);

    tl.to('#svgLineRightWrap', {
      y: 0,
      scaleY: 1,
      transformOrigin: 'center bottom',
      ease: 'power2.out',
      duration: 0.32 * ANIM_SPEED
    }, 0);

    lineTweenRef.current = tl;
  };

  const animateTextOut = (onDone) => {
    textTimelineRef.current?.kill();
    const visionChars = rootRef.current?.querySelectorAll('#visionHeading .char') || [];
    const missionChars = rootRef.current?.querySelectorAll('#missionHeading .char') || [];

    const tl = gsap.timeline({ onComplete: onDone });
    tl.to(missionChars, {
      y: '-186%',
      stagger: 0.02,
      ease: 'power2.in',
      duration: TIMING.textMissionOut
    }, 0.02);

    tl.to(missionLinesRef.current, {
      y: '-150%',
      stagger: 0.03,
      ease: 'power2.in',
      duration: TIMING.textMissionLinesOut
    }, 0.08);

    tl.call(() => setShifted(true), null, 0.26);

    tl.to(visionChars, {
      y: '-186%',
      stagger: 0.02,
      ease: 'power2.in',
      duration: TIMING.textVisionOut
    }, 0.14);

    tl.to(visionLinesRef.current, {
      y: '-150%',
      stagger: 0.03,
      ease: 'power2.in',
      duration: TIMING.textVisionLinesOut
    }, 0.22);

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
      ease: 'power2.out',
      duration: TIMING.textIn
    }, 0);

    tl.to(missionChars, {
      y: '0%',
      stagger: 0.02,
      ease: 'power2.out',
      duration: TIMING.textIn
    }, 0.06);

    tl.to(visionLinesRef.current, {
      y: '0%',
      stagger: 0.03,
      ease: 'power2.out',
      duration: TIMING.textLinesIn
    }, 0.12);

    tl.to(missionLinesRef.current, {
      y: '0%',
      stagger: 0.03,
      ease: 'power2.out',
      duration: TIMING.textLinesIn
    }, 0.18);

    textTimelineRef.current = tl;
  };

  const cancelCloseTimer = () => {
    if (closeTimeoutRef.current) {
      closeTimeoutRef.current.kill();
      closeTimeoutRef.current = null;
    }
  };

  const doOpen = () => {
    if (bookStateRef.current !== 'closed') return;
    bookStateRef.current = 'opening';
    cancelCloseTimer();
    let linesDone = false;
    let textDone = false;

    const maybeStart = () => {
      if (!linesDone || !textDone) return;
      setClosedVisible(false);
      setOpenVisible(true);
      setLeftHalfVisible(true);
      setOpenState('opening');
      launchFlip('do-open', 0, () => {
        setOpenState('open');
        setTabsVisible(true);
        setLeftHalfVisible(true);
        bookStateRef.current = 'open';
      });
    };

    animateLinesOut(() => {
      linesDone = true;
      maybeStart();
    });

    animateTextOut(() => {
      textDone = true;
      maybeStart();
    });
  };

  const doClose = () => {
    if (bookStateRef.current !== 'open') return;
    bookStateRef.current = 'closing';
    setOpenState('closing');
    setTabsVisible(false);
    cancelCloseTimer();
    closeTimeoutRef.current = gsap.delayedCall(TIMING.tabs, () => {
      setLeftHalfVisible(false);
      launchFlip('do-close', -180, () => {
        setOpenVisible(false);
        setClosedVisible(true);
        setShifted(false);
        setOpenState('closed');
        animateLinesIn();
        animateTextIn(() => {
          bookStateRef.current = 'closed';
        });
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

        gsap.set('#svgLineTop', { x: 0, scaleX: 1, transformOrigin: 'left center' });
        gsap.set('#svgLineBottom', { x: 0, scaleX: 1, transformOrigin: 'right center' });
        gsap.set('#svgLineCenter', { x: 0, scaleX: 1, transformOrigin: 'left center' });
        gsap.set('#svgLineLeftWrap', { y: 0, scaleY: 1, transformOrigin: 'center top' });
        gsap.set('#svgLineRightWrap', { y: 0, scaleY: 1, transformOrigin: 'center bottom' });

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
      cancelCloseTimer();
      ctx?.revert();
    };
  }, []);

  const activeTabConfig = TAB_CONFIG.find((tab) => tab.id === activeTab) ?? TAB_CONFIG[0];
  const activePages = activeTabConfig.pages;
  const currentPage = activePages[pageIndex] ?? activePages[0];
  const showPrev = !(activeTab === 'history' && pageIndex === 0);
  const showNext =
    pageIndex < activePages.length - 1 ||
    (activeTab === 'history' && pageIndex === activePages.length - 1) ||
    (activeTab === 'impact' && pageIndex === activePages.length - 1) ||
    (activeTab === 'members' && pageIndex === activePages.length - 1);

  const handleNext = (event) => {
    event?.stopPropagation?.();
    if (pageIndex < activePages.length - 1) {
      setPageIndex((prev) => prev + 1);
      return;
    }

    if (activeTab === 'history') {
      setActiveTab('impact');
      setPageIndex(0);
    } else if (activeTab === 'impact') {
      setActiveTab('members');
      setPageIndex(0);
    }
  };

  const handlePrev = (event) => {
    event?.stopPropagation?.();
    if (pageIndex > 0) {
      setPageIndex((prev) => prev - 1);
      return;
    }

    if (activeTab === 'impact') {
      setActiveTab('history');
      setPageIndex(TAB_CONFIG[0].pages.length - 1);
    } else if (activeTab === 'members') {
      setActiveTab('impact');
      setPageIndex(TAB_CONFIG[1].pages.length - 1);
    }
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setPageIndex(0);
  };

  const allowCloseOnLeft = activeTab === 'history' && pageIndex === 0;

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
          leftHalfRef={leftHalfRef}
          leftHalfVisible={isLeftHalfVisible}
          onClosedClick={doOpen}
          onCloseClick={doClose}
          onLeftPageClick={doClose}
          onRightCoverClick={doClose}
          leftPage={currentPage.left}
          rightPage={currentPage.right}
          showPrev={showPrev}
          showNext={showNext}
          onPrev={handlePrev}
          onNext={handleNext}
          tabs={TAB_CONFIG}
          activeTab={activeTab}
          onTabClick={handleTabClick}
          allowCloseOnLeft={allowCloseOnLeft}
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
