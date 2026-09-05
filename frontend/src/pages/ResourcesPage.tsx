import { BriefcaseBusiness, Check, Code2, Palette, X } from 'lucide-react'

const dos = [
  'Use standard section headings',
  'Mirror relevant language from the job description',
  'Quantify outcomes with numbers',
  'Use a simple reading order',
  'Spell out uncommon abbreviations',
]
const donts = [
  'Put key details in headers or footers',
  'Rely on icons to communicate skills',
  'Use complex tables or text boxes',
  'Stuff repeated keywords unnaturally',
  'Submit without checking extracted text',
]

export function ResourcesPage() {
  return (
    <div className="page-container py-10 sm:py-14">
      <p className="eyebrow">Practical reference</p>
      <h1 className="page-title">Write for people. Structure for systems.</h1>
      <p className="page-subtitle">
        A concise guide to making your experience clear to recruiters and applicant tracking
        systems.
      </p>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Guide title="Do" items={dos} positive />
        <Guide title="Avoid" items={donts} />
      </div>
      <section className="mt-16">
        <p className="eyebrow">Keyword examples</p>
        <h2 className="section-title">Use the language of your field.</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <Industry
            icon={<Code2 />}
            title="Technology"
            words={['Python', 'React', 'APIs', 'CI/CD', 'Cloud', 'Agile']}
          />
          <Industry
            icon={<BriefcaseBusiness />}
            title="Business"
            words={['Stakeholders', 'Forecasting', 'Strategy', 'Operations', 'Leadership']}
          />
          <Industry
            icon={<Palette />}
            title="Creative"
            words={['User research', 'Prototyping', 'Brand systems', 'Accessibility', 'Figma']}
          />
        </div>
      </section>
      <section className="mt-16 rounded-3xl bg-slate-950 p-8 text-white sm:p-12">
        <h2 className="text-3xl font-bold">One important rule</h2>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
          Keywords help only when they truthfully describe your work. Connect every important skill
          to an outcome, responsibility or project so both the ATS and the recruiter can see the
          evidence.
        </p>
      </section>
    </div>
  )
}
function Guide({
  title,
  items,
  positive = false,
}: {
  title: string
  items: string[]
  positive?: boolean
}) {
  const Icon = positive ? Check : X
  return (
    <article className="card">
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      <ul className="mt-5 space-y-4">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
            <span
              className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${positive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}
            >
              <Icon size={14} />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </article>
  )
}
function Industry({
  icon,
  title,
  words,
}: {
  icon: React.ReactNode
  title: string
  words: string[]
}) {
  return (
    <article className="card">
      <span className="icon-box">{icon}</span>
      <h3 className="mt-5 text-lg font-bold">{title}</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {words.map((word) => (
          <span
            key={word}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
          >
            {word}
          </span>
        ))}
      </div>
    </article>
  )
}
