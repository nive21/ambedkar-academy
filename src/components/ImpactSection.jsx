import { useMemo, useState } from 'react';

const PAPER_COLORS = ['#D7B4A2', '#EAE3D9', '#CCCDC7', '#D5B3B2'];

const IMPACTS = [
  {
    id: 'monthly-meetings',
    title: 'Monthly Meetings',
    text:
      'Monthly meetings held regularly on the second day of every month at the Trust building, inviting eminent political leaders, serving and retired bureaucrats, distinguished social activists, and scholars to address issues concerning the welfare of SCs, STs, OBCs, women, etc., with special reference to contemporary issues.',
    hasImageSpace: true
  },
  {
    id: 'coaching',
    title: 'Free Coaching',
    text:
      'Free coaching for SC/ST candidates for competitive examinations conducted by TNPSC, Banking Service Commission, etc.',
    hasImageSpace: true
  },
  {
    id: 'cash-awards',
    title: 'Annual Cash Awards',
    text:
      'Annual cash awards to students securing the highest marks in the 10th and 12th standard examinations who studied in schools maintained by the Adi Dravidar and Tribal Welfare Department across Tamil Nadu.',
    hasImageSpace: true
  },
  {
    id: 'endowment',
    title: 'Ambedkar Endowment',
    text:
      'Institution of the Dr. Ambedkar Endowment at the University of Madras. Every year, the University conducts the Dr. Ambedkar Endowment Lecture, inviting eminent scholars to deliver lectures on the philosophy and thoughts of Dr. B. R. Ambedkar.',
    hasImageSpace: true
  },
  {
    id: 'seminars-workshops',
    title: 'Seminars And Workshops',
    text:
      'Seminars and workshops creating awareness about important government schemes and programmes such as the Special Component Plan for SCs, schemes implemented by TAHDCO, NSFDC, etc.',
    hasImageSpace: true
  },
  {
    id: 'trustee-engagement',
    title: 'Periodic Engagement',
    text:
      'Periodic engagement by the Managing Trustee and Trustees with authorities on issues affecting the socio-educational and economic development of SCs, STs, OBCs, women, etc.',
    hasImageSpace: true
  },
  {
    id: 'atrocity-cases',
    title: 'Atrocity Cases',
    text:
      'Taking up cases of atrocities perpetrated against SC/ST communities with authorities such as District Superintendents of Police, District Collectors, and other concerned officers.',
    hasImageSpace: true
  },
  {
    id: 'policy-intervention',
    title: 'Policy Intervention',
    text:
      'Raising matters requiring policy intervention with the government through prominent political leaders.',
    hasImageSpace: true
  },
  {
    id: 'remedies',
    title: 'Pursuing Remedies',
    text:
      'Addressing all issues affecting the socio-educational and economic development of Scheduled Castes and other marginalised people by pursuing suitable remedies with the concerned authorities.',
    hasImageSpace: true
  }
];

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function randomNudge() {
  return {
    x: Math.round((Math.random() * 10 - 5) * 10) / 10,
    y: Math.round((Math.random() * 8 - 4) * 10) / 10,
    r: Math.round((Math.random() * 1.8 - 0.9) * 10) / 10
  };
}

export default function ImpactSection() {
  const [deckOrder, setDeckOrder] = useState(IMPACTS.map((impact) => impact.id));
  const [nudges, setNudges] = useState({});

  const impactMap = useMemo(
    () =>
      Object.fromEntries(
        IMPACTS.map((impact) => {
          const hash = hashString(impact.id);
          return [
            impact.id,
            {
              ...impact,
              paperColor: PAPER_COLORS[hash % PAPER_COLORS.length],
              baseRotate: (hash % 7) - 3,
              baseX: (hash % 11) - 5,
              baseY: (hash % 9) - 4
            }
          ];
        })
      ),
    []
  );

  const activeImpactId = deckOrder[deckOrder.length - 1];

  const bringToFront = (impactId) => {
    setDeckOrder((previous) => {
      const without = previous.filter((id) => id !== impactId);
      return [...without, impactId];
    });
  };

  const handleNext = () => {
    setDeckOrder((previous) => {
      const [first, ...rest] = previous;
      return [...rest, first];
    });
  };

  const handlePrev = () => {
    setDeckOrder((previous) => {
      const copy = [...previous];
      const last = copy.pop();
      if (!last) return previous;
      return [last, ...copy];
    });
  };

  const sectionIntro =
    'The People’s Educational Trust – Dr. Ambedkar Academy has been rendering yeoman service to Scheduled Castes, Scheduled Tribes, women, and marginalised communities since its inception. Some of the services rendered include:';

  return (
    <section className="impact-section" id="impact">
      <div className="impact-inner">
        <div className="impact-left">
          <h2 className="impact-title">Impact</h2>
          <p className="impact-intro">{sectionIntro}</p>
          <ul className="impact-list" aria-label="Impact points">
            {IMPACTS.map((impact, index) => (
              <li key={impact.id}>
                <button
                  type="button"
                  className={`impact-list-btn ${activeImpactId === impact.id ? 'is-active' : ''}`}
                  onClick={() => bringToFront(impact.id)}
                >
                  <span className="impact-list-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="impact-list-title">{impact.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="impact-right">
          <div className="impact-stack" role="list" aria-label="Impact cards">
            {deckOrder.map((impactId, index) => {
              const impact = impactMap[impactId];
              const nudge = nudges[impactId] ?? { x: 0, y: 0, r: 0 };
              const depth = deckOrder.length - 1 - index;
              const isFront = impactId === activeImpactId;

              return (
                <article
                  key={impactId}
                  className={`impact-card ${isFront ? 'is-front' : ''}`}
                  role="listitem"
                  style={{
                    '--paper-color': impact.paperColor,
                    '--base-x': `${impact.baseX + depth * 1.2}px`,
                    '--base-y': `${impact.baseY + depth * 1.8}px`,
                    '--base-r': `${impact.baseRotate - depth * 0.45}deg`,
                    '--nudge-x': `${nudge.x}px`,
                    '--nudge-y': `${nudge.y}px`,
                    '--nudge-r': `${nudge.r}deg`,
                    zIndex: index + 1
                  }}
                  onClick={() => bringToFront(impactId)}
                  onMouseEnter={() => {
                    setNudges((previous) => ({ ...previous, [impactId]: randomNudge() }));
                  }}
                  onMouseLeave={() => {
                    setNudges((previous) => ({ ...previous, [impactId]: { x: 0, y: 0, r: 0 } }));
                  }}
                >
                  <div className="impact-card-content">
                    <h3>{impact.title}</h3>
                    <p>{impact.text}</p>
                  </div>
                  {impact.hasImageSpace ? <div className="impact-card-image-space" aria-hidden="true" /> : null}
                </article>
              );
            })}
          </div>
          <div className="impact-controls" aria-label="Cycle impact cards">
            <button type="button" className="impact-control-btn" onClick={handlePrev} aria-label="Previous impact">
              <svg viewBox="0 0 24 24" fill="none" stroke="#4c2c1b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 5 5 12 12 19" />
              </svg>
            </button>
            <button type="button" className="impact-control-btn" onClick={handleNext} aria-label="Next impact">
              <svg viewBox="0 0 24 24" fill="none" stroke="#4c2c1b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
          
        </div>
      </div>
    </section>
  );
}
