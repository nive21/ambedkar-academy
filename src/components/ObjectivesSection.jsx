export default function ObjectivesSection() {
  const objectives = [
    {
      num: '1',
      category: 'Educational institutions',
      desc: 'To run, develop, or improve Dr. Ambedkar Academy, any school, college, or educational institution, or to adopt, assist, or help any educational institution for the benefit of the public in general and Scheduled Castes and Scheduled Tribes in particular.'
    },
    {
      num: '2',
      category: 'Coaching',
      desc: 'To organise, start, or assist any organisation providing coaching, guidance, etc., for those appearing for competitive examinations such as UPSC, TNPSC, Banking recruitment, etc.'
    },
    {
      num: '3',
      category: 'Legal',
      desc: 'To provide legal assistance and awareness to SC, ST, BC, women, children, and others.'
    },
    {
      num: '4',
      category: 'Workshops',
      desc: 'To organise workshops, seminars, etc., for educated unemployed rural youth.'
    },
    {
      num: '5',
      category: 'Research',
      desc: "To encourage research on Dr. Ambedkar's thoughts and philosophy."
    },
    {
      num: '6',
      category: 'Scholarships',
      desc: 'To institute scholarships for poor and deserving students to enable them to continue their studies and to give grants for fees, books, instruments, and other educational aids.'
    },
    {
      num: '7',
      category: 'Awards',
      desc: 'To award prizes for outstanding achievements of students in education, sports, etc.'
    },
    {
      num: '8',
      category: 'Accommodation',
      desc: 'To assist poor and deserving students in finding inexpensive living accommodation to enable them to pursue their studies.'
    }
  ];

  return (
    <section className="objectives-section">
      <div className="objectives-inner">
        <h2 className="objectives-title">Objectives</h2>
        <div className="objectives-table">
          {objectives.map((item) => (
            <div className="objectives-row" key={item.num}>
              <span className="objectives-num">{item.num}</span>
              <span className="objectives-category">{item.category}</span>
              <p className="objectives-desc">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="objectives-rule" />
      </div>
    </section>
  );
}
