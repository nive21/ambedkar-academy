export default function SectionBlock({
  className,
  heading,
  headingId,
  headingRef,
  body,
  bodyId,
  bodyRef
}) {
  return (
    <section className={className}>
      <div className="heading-text" id={headingId} ref={headingRef}>
        {heading}
      </div>
      <div className="body-text" id={bodyId} ref={bodyRef}>
        {body}
      </div>
    </section>
  );
}
