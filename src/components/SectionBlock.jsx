export default function SectionBlock({
  className,
  heading,
  headingId,
  headingRef,
  body,
  bodyId,
  bodyRef,
  dividerId,
  dividerClassName
}) {
  return (
    <section className={className}>
      <div className="heading-text" id={headingId} ref={headingRef}>
        {heading}
      </div>
      {dividerId ? <div id={dividerId} className={dividerClassName} aria-hidden="true" /> : null}
      <div className="body-text" id={bodyId} ref={bodyRef}>
        {body}
      </div>
    </section>
  );
}
