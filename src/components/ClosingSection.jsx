import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function ClosingSection() {
  const sectionRef = useRef(null);
  const lineTopRef = useRef(null);
  const lineBottomRef = useRef(null);
  const lineV1Ref = useRef(null);
  const lineV2Ref = useRef(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const lineEls = [
      lineTopRef.current,
      lineBottomRef.current,
      lineV1Ref.current,
      lineV2Ref.current
    ].filter(Boolean);

    if (!sectionRef.current || lineEls.length === 0) return undefined;

    const getOutState = () => ({
      topX: -window.innerWidth * 1.05,
      bottomX: window.innerWidth * 1.05,
      v1Y: -window.innerHeight * 1.1,
      v2Y: window.innerHeight * 1.1
    });

    const setOut = () => {
      const out = getOutState();
      gsap.set(lineTopRef.current, { x: out.topX, scaleX: 0.25, transformOrigin: 'left center' });
      gsap.set(lineBottomRef.current, { x: out.bottomX, scaleX: 0.25, transformOrigin: 'right center' });
      gsap.set(lineV1Ref.current, { y: out.v1Y, scaleY: 0.1, transformOrigin: 'center top' });
      gsap.set(lineV2Ref.current, { y: out.v2Y, scaleY: 0.1, transformOrigin: 'center bottom' });
    };

    const animateIn = () => {
      gsap.killTweensOf(lineEls);
      gsap.to(lineTopRef.current, { x: 0, scaleX: 1, duration: 0.5, ease: 'power2.out' });
      gsap.to(lineBottomRef.current, { x: 0, scaleX: 1, duration: 0.5, ease: 'power2.out' });
      gsap.to(lineV1Ref.current, { y: 0, scaleY: 1, duration: 0.5, ease: 'power2.out' });
      gsap.to(lineV2Ref.current, { y: 0, scaleY: 1, duration: 0.5, ease: 'power2.out' });
    };

    const animateOut = () => {
      const out = getOutState();
      gsap.killTweensOf(lineEls);
      gsap.to(lineTopRef.current, { x: out.topX, scaleX: 0.25, duration: 0.42, ease: 'power2.in' });
      gsap.to(lineBottomRef.current, { x: out.bottomX, scaleX: 0.25, duration: 0.42, ease: 'power2.in' });
      gsap.to(lineV1Ref.current, { y: out.v1Y, scaleY: 0.1, duration: 0.42, ease: 'power2.in' });
      gsap.to(lineV2Ref.current, { y: out.v2Y, scaleY: 0.1, duration: 0.42, ease: 'power2.in' });
    };

    setOut();

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 85%',
      end: 'bottom 15%',
      onEnter: animateIn,
      onEnterBack: animateIn,
      onLeave: animateOut,
      onLeaveBack: animateOut
    });

    const onResize = () => {
      if (!trigger.isActive) setOut();
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      trigger.kill();
      gsap.killTweensOf(lineEls);
    };
  }, []);

  return (
    <section className="closing-section" id="closing" ref={sectionRef}>
      <div className="closing-inner">
        <div className="closing-lines" aria-hidden="true">
          <div className="closing-line-h hori-line closing-line-top line-brush-h" ref={lineTopRef} />
          <div className="closing-line-h hori-line closing-line-bottom line-brush-h" ref={lineBottomRef} />
          <div className="closing-line-v closing-line-v1 line-brush-v" ref={lineV1Ref} />
          <div className="closing-line-v closing-line-v2 line-brush-v" ref={lineV2Ref} />
        </div>

        <div className="closing-content">
          <div className="closing-body">
            <p>
              The People's Educational Trust – Dr. Ambedkar Academy is run purely on donations from
              friends, well-wishers, and philanthropists. The Trust operates its bank account with the
              State Bank of India.
            </p>
            <p>
              The Trust is registered under Section 12AA of the Income Tax Act, and donations made to
              the Trust qualify for deduction under Section 80G(5)(vi) of the Income Tax Act, 1961.
            </p>
            <p>
              We appeal to you to lend a helping hand to The People's Educational Trust to carry out
              its activities in whatever way possible. It is a long journey. In the words of
              <strong> Dr. B. R. Ambedkar</strong>:
            </p>
          </div>

          <blockquote className="closing-quote">
            “Ours is a battle not for wealth, nor for power. Ours is a battle for freedom; for the
            reclamation of human personality.”
          </blockquote>

          <div className="closing-right">
            <div className="closing-block">
              <div className="closing-label">Contact:</div>
              <div className="closing-contacts">
                <span>admin@ambedkar-academy.in</span>
                {/* <span>+91-1234567890</span> */}
              </div>
            </div>
            <div className="closing-block closing-donate">
              <p>
                Please reach out to us if you would like to donate or volunteer. We would be happy to hear from you. 
              </p>
              {/* <div className="closing-label">Donate:</div> */}
              {/* <div className="closing-qr" aria-hidden="true" /> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
