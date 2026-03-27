export default function ClosingSection() {
  return (
    <section className="closing-section" id="closing">
      <div className="closing-inner">
        <div className="closing-lines" aria-hidden="true">
          <div className="closing-line-h hori-line closing-line-top line-brush-h" />
          <div className="closing-line-h hori-line closing-line-bottom line-brush-h" />
          <div className="closing-line-v closing-line-v1 line-brush-v" />
          <div className="closing-line-v closing-line-v2 line-brush-v" />
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
                <span>+91-1234567890</span>
                <span>+91-1234567890</span>
              </div>
            </div>
            <div className="closing-block closing-donate">
              <div className="closing-label">Donate:</div>
              <div className="closing-qr" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
