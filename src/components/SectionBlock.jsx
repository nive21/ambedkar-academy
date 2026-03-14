export default function SectionBlock({
  className,
  heading,
  headingId,
  headingRef,
  body,
  bodyId,
  bodyRef
}) {
  const formattedHeading = heading.split('\n').join('<br />');

  return (
    <section className={className}>
      <div
        className="heading-text"
        id={headingId}
        ref={headingRef}
        dangerouslySetInnerHTML={{ __html: formattedHeading }}
      />
      <div className="body-text" id={bodyId} ref={bodyRef}>
        {body}
      </div>
    </section>
  );
}
