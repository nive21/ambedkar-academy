export default function ApplyClosedPage() {
  return (
    <main className="book-hall-page apply-page apply-page--closed">
      <div className="book-hall-page__line" />
      <section className="book-hall-shell">
        <header className="book-hall-header apply-page__header">
          <a className="book-hall-back" href="/">
            Back to home
          </a>
        </header>

        <section className="book-hall-form-wrap apply-page__form-wrap apply-page__closed-wrap" aria-label="TNPSC Group IV coaching applications closed">
          <p className="apply-page__eyebrow">Application Update</p>
          <h1 className="book-hall-form-title apply-page__closed-title">
            TNPSC Group IV Coaching - Applications Closed.
          </h1>

          <div className="apply-page__closed-notice">
            <p>
              Dr. Ambedkar Academy - The People&apos;s Educational Trust has received
              sufficient number of applications for the limited number of seats
              available for TNPSC Gr IV coaching. Therefore, the receipt of further
              applications has been closed.
            </p>
            <p>Thank you for your interest.</p>
            <p>Any inconvenience caused is regretted.</p>
          </div>
        </section>
      </section>
    </main>
  );
}
