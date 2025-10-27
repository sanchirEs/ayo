"use client";

const accordionData = [
  {
    id: 1,
    heading: "Bring of had which their whose you're it own?",
    body: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    expanded: true,
  },
  {
    id: 2,
    heading: "Over shall air can't subdue fly divide him?",
    body: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    expanded: false,
  },
  {
    id: 3,
    heading: "Waters one you'll creeping?",
    body: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    expanded: false,
  },
];

export default function Faq() {
  return (
    <section className="container mw-930 lh-30">
      <h2 className="section-title text-uppercase fw-bold mb-5">
        FREQUENTLY ASKED QUESTIONS
      </h2>
      <h3 className="mb-4">Orders</h3>
      <div id="faq_accordion" className="faq-accordion accordion mb-5">
        {accordionData.map((item) => (
          <div key={item.id} className="accordion-item">
            <h5 className="accordion-header" id={`faq-accordion-heading-${item.id}`}>
              <button
                className={`accordion-button ${!item.expanded ? "collapsed" : ""}`}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#faq-accordion-collapse-${item.id}`}
                aria-expanded={item.expanded}
                aria-controls={`faq-accordion-collapse-${item.id}`}
              >
                {item.heading}
              </button>
            </h5>
            <div
              id={`faq-accordion-collapse-${item.id}`}
              className={`accordion-collapse collapse ${item.expanded ? "show" : ""}`}
              aria-labelledby={`faq-accordion-heading-${item.id}`}
              data-bs-parent="#faq_accordion"
            >
              <div className="accordion-body">
                <p>{item.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

