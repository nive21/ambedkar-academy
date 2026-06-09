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
    id: 'about',
    label: 'About',
    pages: [
      {
        left: {
          title: 'About<br />Dr.&nbsp;Ambedkar<br />Academy',
          body: ''
        },
        right: {
          yearTitle: "'70s",
          body:
            "The People's Educational Trust – Dr. Ambedkar Academy is a unique organisation with the privilege of serving marginalised people for over 45 years. It blossomed from informal monthly gatherings of socially conscious intellectuals way back in the 1970s to discuss and deliberate on issues concerning the development of marginalised people."
        }
      },
      {
        left: {
          yearTitle: '1976',
          body: 'These monthly meetings stirred the conscience of people with social concerns, culminating in the formation of a formal society, namely the People’s Educational, Social and Cultural Society, registered in 1976 under the Societies Registration Act.'
        },
        right: {
          yearTitle: '1996',
          imageSrc: 'placeholder',
          imageAlt: 'A Dr. Ambedkar Academy gathering (Nov 2018)',
          body: 'In 1996, the Society was converted into The People’s Educational Trust as a public charitable trust, broadening its activities.'
        }
      }
    ]
  },
  {
    id: 'gallery',
    label: 'Gallery',
    pages: [
      {
        left: {
          title: 'Gallery',
          body: 'Moments from the Academy’s continuous public service and outreach.'
        },
        right: {
          layout: 'image',
          body: 'Academy gatherings focused on education, rights, and social progress.',
          imageSrc: 'placeholder',
          imageAlt: 'Dr. Ambedkar Academy gallery photograph 1'
        }
      },
      {
        left: {
          layout: 'image',
          body: 'Monthly forums where scholars, officers, and activists share insights.',
          imageSrc: 'placeholder',
          imageAlt: 'Dr. Ambedkar Academy gallery photograph 2'
        },
        right: {
          layout: 'image',
          body: 'Monthly forums where scholars, officers, and activists share insights.',
          imageSrc: 'placeholder',
          imageAlt: 'Dr. Ambedkar Academy gallery photograph 3'
        }
      },
      {
        left: {
          layout: 'image',
          body: 'Monthly forums where scholars, officers, and activists share insights.',
          imageSrc: 'placeholder',
          imageAlt: 'Dr. Ambedkar Academy gallery photograph 4'
        },
        right: {
          layout: 'image',
          body: 'Program snapshots from awareness seminars and social initiatives.',
          imageSrc: 'placeholder',
          imageAlt: 'Dr. Ambedkar Academy gallery photograph 5'
        }
      }
    ]
  },
  {
    id: 'management',
    label: 'Management',
    pages: [
      {
        left: {
          title: 'Management',
          body:
            'The Trust is managed by people of eminence commanding high respect in society. The management comprises the Managing Trustee and 24 Trustees drawn from diverse fields.'
        },
        right: {
          layout: 'image',
          imageSrc: 'placeholder',
          imageAlt: 'Thiru C. Chellappan, IAS Retired photograph',
          subTitle: 'Thiru C. Chellappan, IAS (Retd.)',
          body:
            'Former Secretary to the Government of Tamil Nadu, former Member of TNPSC, and former Member of the National Commission for Scheduled Castes & Scheduled Tribes, serves as the Managing Trustee.'
        }
      },
      {
        left: {
          layout: 'image',
          imageSrc: 'placeholder',
          imageAlt: 'Thiru J. Ramalinga photograph',
          subTitle: 'Thiru J. Ramalingam',
          body:
            'Thiru J. Ramalingam, former Member of TNPSC and former expert with the United Nations (FAO), is the Secretary-General of Dr. Ambedkar Academy.',
        },
        right: {
          layout: 'image',
          imageSrc: 'placeholder',
          imageAlt: 'Dr. A. Padmanaban, IAS (Retd.) photograph',
          subTitle: 'Dr. A. Padmanaban, IAS (Retd.)',
          body: 'Dr. A. Padmanaban, IAS (Retd.) is the chief architect of the Trust. He has served as Governor of Mizoram, Chief Secretary to the Government of Tamil Nadu, Adviser to the Governor of Tamil Nadu, Member of UPSC, and President of the World Poet Organisation.',
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
  const academyNavTimeoutRef = useRef(null);
  const ignoreScrollUntilRef = useRef(0);
  const bookStateRef = useRef('closed');
  const [activeTab, setActiveTab] = useState('about');
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
      if (Date.now() < ignoreScrollUntilRef.current) {
        lastY = window.scrollY;
        return;
      }

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
      if (academyNavTimeoutRef.current) {
        window.clearTimeout(academyNavTimeoutRef.current);
      }
      cancelCloseTimer();
      ctx?.revert();
    };
  }, []);

  const activeTabConfig = TAB_CONFIG.find((tab) => tab.id === activeTab) ?? TAB_CONFIG[0];
  const activePages = activeTabConfig.pages;
  const lastTabId = TAB_CONFIG[TAB_CONFIG.length - 1]?.id;
  const currentPage = activePages[pageIndex] ?? activePages[0];
  const showPrev = !(activeTab === 'about' && pageIndex === 0);
  const showNext = pageIndex < activePages.length - 1 || activeTab !== lastTabId;

  const handleNext = (event) => {
    event?.stopPropagation?.();
    if (pageIndex < activePages.length - 1) {
      setPageIndex((prev) => prev + 1);
      return;
    }

    if (activeTab === 'about') {
      setActiveTab('gallery');
      setPageIndex(0);
    } else if (activeTab === 'gallery') {
      setActiveTab('management');
      setPageIndex(0);
    }
  };

  const handlePrev = (event) => {
    event?.stopPropagation?.();
    if (pageIndex > 0) {
      setPageIndex((prev) => prev - 1);
      return;
    }

    if (activeTab === 'gallery') {
      setActiveTab('about');
      setPageIndex(TAB_CONFIG[0].pages.length - 1);
    } else if (activeTab === 'management') {
      setActiveTab('gallery');
      setPageIndex(TAB_CONFIG[1].pages.length - 1);
    }
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setPageIndex(0);
  };

  const allowCloseOnLeft = activeTab === 'about' && pageIndex === 0;

  const handleAcademyClick = (event) => {
    event.preventDefault();
    ignoreScrollUntilRef.current = Date.now() + 1200;
    rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveTab('about');
    setPageIndex(0);
    if (academyNavTimeoutRef.current) {
      window.clearTimeout(academyNavTimeoutRef.current);
    }
    academyNavTimeoutRef.current = window.setTimeout(() => {
      if (bookStateRef.current === 'closed') {
        doOpen();
      }
    }, 420);
  };

  const handleContinueClick = () => {
    ignoreScrollUntilRef.current = Date.now() + 800;
    rootRef.current?.nextElementSibling?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="scroll-container" id="academy" ref={rootRef}>
      <div className="sticky-scene">
        <Navbar ref={navbarRef} onAcademyClick={handleAcademyClick} />
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
          onContinueClick={handleContinueClick}
        />
        <SectionBlock
          className="vision-block"
          headingId="visionHeading"
          headingRef={visionHRef}
          bodyId="visionBody"
          bodyRef={visionBRef}
          dividerId="svgLineCenter"
          dividerClassName="section-divider line-svg-h line-brush-h"
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
