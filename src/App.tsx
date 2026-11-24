import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Brain, Check, CheckCircle2,
  ChevronDown, ChevronRight, CircleHelp, Clipboard, Compass, Download,
  ExternalLink, FileText, FlaskConical, GraduationCap, Lightbulb, ListFilter, LockKeyhole,
  Menu, MessageSquareText, NotebookPen, Plus, Search, ShieldCheck, Sparkles, Target,
  Trash2, X, type LucideIcon,
} from 'lucide-react'
import {
  catalogServices, formulaParts, guideSteps, lessonScenarios, navigation, safetyCases,
  serviceFamilies, type SectionId,
} from './data'
import { loadAppData, storageKey, type AppData, type LabEntry, type SavedPrompt } from './store'

const sectionIcons: Record<SectionId, LucideIcon> = {
  overview: Compass,
  fundamentals: Brain,
  catalog: Search,
  workflow: ListFilter,
  prompts: MessageSquareText,
  scenarios: BookOpen,
  safety: ShieldCheck,
  lab: FlaskConical,
}

const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, ease: 'easeOut' as const },
}

function App() {
  const [data, setData] = useState<AppData>(() => loadAppData())
  const [activeSection, setActiveSection] = useState<SectionId>('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(data))
  }, [data])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  const navigate = (section: SectionId) => {
    setActiveSection(section)
    setMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleGuide = (id: string) => {
    setData(current => ({
      ...current,
      guideCompleted: current.guideCompleted.includes(id)
        ? current.guideCompleted.filter(step => step !== id)
        : [...current.guideCompleted, id],
    }))
  }

  const progressCount = Math.min(15, data.guideCompleted.length + data.scenarioCompleted.length + Object.keys(data.safetyAnswers).length + Math.min(1, data.savedPrompts.length) + Math.min(1, data.labEntries.length))
  const progress = Math.round(progressCount / 15 * 100)
  const currentLabel = navigation.find(item => item.id === activeSection)?.label ?? 'Обзор'

  return (
    <div className="min-h-screen bg-paper text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[258px] flex-col bg-ink px-5 pb-5 pt-6 text-white lg:flex">
        <Brand onClick={() => navigate('overview')} />
        <div className="mt-9 flex-1 overflow-y-auto pr-1 quiet-scrollbar">
          {['КУРС', 'ПРАКТИКА', 'ПРИМЕНЕНИЕ', 'МОЁ'].map(group => (
            <div className="mb-6" key={group}>
              <div className="mb-2 px-3 text-[10px] font-bold tracking-[.2em] text-slate-400">{group}</div>
              <div className="space-y-1">
                {navigation.filter(item => item.group === group).map(item => {
                  const Icon = sectionIcons[item.id]
                  const selected = activeSection === item.id
                  return <button key={item.id} onClick={() => navigate(item.id)} className={`focus-ring group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition ${selected ? 'bg-white text-ink shadow-sm' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`} aria-current={selected ? 'page' : undefined}>
                    <Icon size={17} strokeWidth={selected ? 2.2 : 1.8} className={selected ? 'text-[#358759]' : 'text-slate-400 group-hover:text-mint'} />
                    <span className="flex-1">{item.label}</span>
                    {item.id === 'lab' && data.labEntries.length > 0 && <span className="rounded-full bg-[#d9f2e5] px-1.5 py-0.5 text-[10px] font-bold text-ink">{data.labEntries.length}</span>}
                  </button>
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[.06] p-4">
          <div className="flex items-center justify-between text-xs"><span className="text-slate-300">Мой маршрут</span><span className="font-bold text-mint">{progress}%</span></div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#82c69c] transition-all duration-500" style={{ width: `${progress}%` }} /></div>
          <p className="mb-0 mt-3 text-[11px] leading-relaxed text-slate-400">Ваш прогресс сохраняется на этом устройстве.</p>
        </div>
      </aside>

      <div className="lg:pl-[258px]">
        <header className="sticky top-0 z-20 border-b border-[#e7e6df] bg-paper/90 backdrop-blur-xl">
          <div className="mx-auto flex h-[66px] max-w-[1440px] items-center justify-between px-4 sm:px-7 xl:px-10">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileMenuOpen(true)} className="focus-ring grid h-10 w-10 place-items-center rounded-xl border border-[#e0e2dc] bg-white lg:hidden" aria-label="Открыть меню"><Menu size={19} /></button>
              <div className="lg:hidden"><Brand compact onClick={() => navigate('overview')} /></div>
              <div className="hidden items-center gap-2 text-sm text-[#84909b] sm:flex"><span>Учебная среда</span><ChevronRight size={14} /><span className="font-semibold text-ink">{currentLabel}</span></div>
              <span className="text-sm font-semibold text-ink sm:hidden">{currentLabel}</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden rounded-full border border-[#d9e5d9] bg-[#edf5ed] px-3 py-1.5 text-[11px] font-semibold text-[#3b7652] md:inline-flex">Клиентский режим · данные локально</span>
              <button onClick={() => navigate('lab')} className="focus-ring flex h-9 items-center gap-2 rounded-xl bg-ink px-3 text-xs font-semibold text-white transition hover:bg-[#1c3a59] sm:px-4"><NotebookPen size={14} /><span className="hidden sm:inline">Моя лаборатория</span></button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-4 pb-16 pt-7 sm:px-7 sm:pt-9 xl:px-10">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection} {...fadeIn}>
              {activeSection === 'overview' && <Overview data={data} progress={progress} navigate={navigate} />}
              {activeSection === 'fundamentals' && <Fundamentals />}
              {activeSection === 'catalog' && <Catalog />}
              {activeSection === 'workflow' && <Workflow completed={data.guideCompleted} toggle={toggleGuide} />}
              {activeSection === 'prompts' && <PromptBuilder data={data} setData={setData} notify={setToast} />}
              {activeSection === 'scenarios' && <Scenarios completed={data.scenarioCompleted} setData={setData} />}
              {activeSection === 'safety' && <Safety data={data} setData={setData} />}
              {activeSection === 'lab' && <Laboratory data={data} setData={setData} notify={setToast} />}
            </motion.div>
          </AnimatePresence>
        </main>
        <footer className="border-t border-[#e7e6df] px-4 py-5 text-center text-xs text-[#7c8791] sm:px-7">
          Учебный материал для осмысленной и безопасной работы с генеративным ИИ · Прогресс хранится в LocalStorage
        </footer>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && <>
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} aria-label="Закрыть меню" className="fixed inset-0 z-40 bg-ink/40 lg:hidden" />
          <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: 'spring', damping: 28, stiffness: 260 }} className="fixed inset-y-0 left-0 z-50 w-[290px] max-w-[85vw] bg-ink p-5 text-white lg:hidden">
            <div className="flex items-center justify-between"><Brand onClick={() => navigate('overview')} /><button onClick={() => setMobileMenuOpen(false)} className="focus-ring grid h-9 w-9 place-items-center rounded-lg bg-white/10" aria-label="Закрыть"><X size={18} /></button></div>
            <div className="mt-8 space-y-5">{['КУРС', 'ПРАКТИКА', 'ПРИМЕНЕНИЕ', 'МОЁ'].map(group => <div key={group}><div className="mb-2 px-3 text-[10px] font-bold tracking-[.2em] text-slate-400">{group}</div><div className="space-y-1">{navigation.filter(item => item.group === group).map(item => { const Icon = sectionIcons[item.id]; const selected = activeSection === item.id; return <button key={item.id} onClick={() => navigate(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm ${selected ? 'bg-white font-semibold text-ink' : 'text-slate-300 hover:bg-white/10'}`}><Icon size={17} /><span>{item.label}</span></button> })}</div></div>)}</div>
            <div className="absolute inset-x-5 bottom-5 rounded-xl bg-white/10 p-4 text-xs text-slate-300">Маршрут пройден на <strong className="text-mint">{progress}%</strong></div>
          </motion.aside>
        </>}
      </AnimatePresence>

      <AnimatePresence>{toast && <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="fixed bottom-5 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-medium text-white shadow-xl"><CheckCircle2 size={17} className="text-mint" />{toast}</motion.div>}</AnimatePresence>
    </div>
  )
}

function Brand({ onClick, compact = false }: { onClick: () => void; compact?: boolean }) {
  return <button onClick={onClick} className={`focus-ring flex items-center gap-3 text-left ${compact ? 'gap-2' : ''}`}>
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#d9f2e5] text-[#1e6941]"><Sparkles size={19} strokeWidth={2.1} /></span>
    <span className="leading-tight"><span className={`display-font block font-extrabold tracking-[-.035em] ${compact ? 'text-[13px]' : 'text-[15px] text-white'}`}>ИИ в образовании</span>{!compact && <span className="mt-1 block text-[10px] tracking-wide text-slate-400">ПРАКТИЧЕСКИЙ КУРС ДЛЯ ПЕДАГОГА</span>}</span>
  </button>
}

function PageHeading({ eyebrow, title, text, icon: Icon }: { eyebrow: string; title: string; text: string; icon: LucideIcon }) {
  return <div className="mb-7 flex items-start gap-4 sm:mb-9">
    <div className="hidden h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#e4f3e8] text-[#398256] sm:grid"><Icon size={22} /></div>
    <div><div className="mb-2 text-[10px] font-bold tracking-[.19em] text-[#4a8a61]">{eyebrow}</div><h1 className="display-font text-[28px] font-extrabold leading-tight tracking-[-.04em] text-ink sm:text-[36px]">{title}</h1><p className="mb-0 mt-2 max-w-2xl text-sm leading-relaxed text-[#6c7a87] sm:text-[15px]">{text}</p></div>
  </div>
}

function Pill({ children, tone = 'green' }: { children: React.ReactNode; tone?: 'green' | 'amber' | 'blue' | 'gray' }) {
  const colors = { green: 'bg-[#e7f3e9] text-[#417751]', amber: 'bg-[#fff2d8] text-[#9b6b1f]', blue: 'bg-[#e8f0f5] text-[#4c7189]', gray: 'bg-[#f0f1ed] text-[#687780]' }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ${colors[tone]}`}>{children}</span>
}

function Overview({ data, progress, navigate }: { data: AppData; progress: number; navigate: (section: SectionId) => void }) {
  const cards: { id: SectionId; title: string; description: string; icon: LucideIcon; number: string; tint: string }[] = [
    { id: 'fundamentals', title: 'Понять основы', description: 'Как генеративная модель учится находить закономерности и почему может ошибаться.', icon: Brain, number: '01', tint: 'bg-[#e7f2e8]' },
    { id: 'prompts', title: 'Собрать промпт', description: 'Пошагово сформулировать задачу и сохранить удачные инструкции.', icon: MessageSquareText, number: '02', tint: 'bg-[#f8ecdf]' },
    { id: 'scenarios', title: 'Применить на уроке', description: 'Адаптировать практические сценарии к школьным предметам и кружкам.', icon: BookOpen, number: '03', tint: 'bg-[#e8eef5]' },
    { id: 'safety', title: 'Действовать безопасно', description: 'Разобрать реальные ситуации с данными, фактами, авторством и смещениями.', icon: ShieldCheck, number: '04', tint: 'bg-[#f6e9e5]' },
  ]
  return <>
    <section className="relative mb-8 overflow-hidden rounded-[26px] bg-ink px-6 py-7 text-white sm:px-10 sm:py-10 xl:py-12">
      <div className="absolute -right-10 -top-20 h-72 w-72 rounded-full border border-white/10" /><div className="absolute -right-1 top-2 h-52 w-52 rounded-full border border-white/10" /><div className="absolute bottom-0 right-[21%] h-24 w-24 rounded-full bg-[#90cba4]/10 blur-2xl" />
      <div className="relative grid gap-8 xl:grid-cols-[1fr_290px] xl:items-center">
        <div className="max-w-[690px]"><Pill>ПРАКТИЧЕСКИЙ МАРШРУТ · ДЛЯ ПЕДАГОГА</Pill><h1 className="display-font mt-5 text-[30px] font-extrabold leading-[1.12] tracking-[-.045em] sm:text-[42px]">Генеративный ИИ<br className="hidden sm:block" /> в образовании</h1><p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-[16px]">Осваивайте инструменты осмысленно: от понимания принципов до учебных сценариев, проверки результата и безопасной практики.</p><div className="mt-6 flex flex-wrap gap-3"><button onClick={() => navigate('fundamentals')} className="focus-ring inline-flex items-center gap-2 rounded-xl bg-[#d9f2e5] px-4 py-3 text-sm font-bold text-[#1a5737] transition hover:bg-white">Начать маршрут <ArrowRight size={16} /></button><button onClick={() => navigate('prompts')} className="focus-ring inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Открыть конструктор <ArrowUpRight size={15} /></button></div></div>
        <div className="rounded-2xl border border-white/10 bg-white/[.07] p-5 backdrop-blur"><div className="flex items-center justify-between"><span className="text-xs text-slate-300">Ваш прогресс</span><span className="display-font text-3xl font-extrabold tracking-tight text-[#a5ddb6]">{progress}<span className="text-base">%</span></span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: .7 }} className="h-full rounded-full bg-[#8cc99f]" /></div><div className="mt-4 grid grid-cols-2 gap-2 text-center"><Metric value={`${data.guideCompleted.length}/5`} label="шагов гайда" /><Metric value={`${Object.keys(data.safetyAnswers).length}/5`} label="ситуаций" /></div><p className="mb-0 mt-4 text-[11px] leading-relaxed text-slate-400">Результаты остаются в вашем браузере и не отправляются на сервер.</p></div>
      </div>
    </section>

    <div className="mb-4 flex items-end justify-between gap-4"><div><div className="mb-1 text-[10px] font-bold tracking-[.18em] text-[#70836f]">ЧЕМУ ВЫ НАУЧИТЕСЬ</div><h2 className="display-font m-0 text-xl font-bold tracking-tight sm:text-2xl">Выберите следующий шаг</h2></div><button onClick={() => navigate('workflow')} className="hidden items-center gap-1.5 text-xs font-bold text-[#477957] hover:text-ink sm:flex">Весь маршрут <ArrowRight size={14} /></button></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(card => { const Icon = card.icon; return <button onClick={() => navigate(card.id)} key={card.id} className="focus-ring group rounded-2xl border border-[#e7e7df] bg-white p-5 text-left shadow-[0_2px_8px_rgba(23,43,66,.025)] transition hover:-translate-y-0.5 hover:border-[#c6daca] hover:shadow-card"><div className="flex items-center justify-between"><span className={`grid h-10 w-10 place-items-center rounded-xl ${card.tint} text-ink`}><Icon size={19} /></span><span className="text-[10px] font-bold tracking-widest text-[#b3bbb8]">{card.number}</span></div><h3 className="display-font mb-1 mt-5 text-[15px] font-bold">{card.title}</h3><p className="mb-4 text-xs leading-relaxed text-[#71808b]">{card.description}</p><span className="inline-flex items-center gap-1 text-xs font-bold text-[#4b805b]">Перейти <ArrowRight size={13} className="transition group-hover:translate-x-1" /></span></button> })}</div>
    <section className="mt-7 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
      <div className="rounded-2xl border border-[#e5e6df] bg-white p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><Pill tone="blue">КОРОТКО О ПОДХОДЕ</Pill><h2 className="display-font mb-2 mt-3 text-lg font-bold">ИИ предлагает. Педагог решает.</h2><p className="mb-0 max-w-xl text-sm leading-relaxed text-[#72808a]">Генеративная модель создаёт вероятный вариант ответа на основе закономерностей в данных. Она не проверяет истину сама по себе: цель урока, точность и уместность материала остаются в зоне ответственности человека.</p></div><span className="hidden h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f4efe2] text-[#98712d] sm:grid"><Lightbulb size={20} /></span></div></div>
      <div className="rounded-2xl border border-[#dfe9df] bg-[#edf5ed] p-5 sm:p-6"><div className="flex items-center gap-2 text-xs font-bold text-[#477957]"><Target size={15} /> С ЧЕГО НАЧАТЬ</div><p className="display-font mb-3 mt-3 text-base font-bold leading-snug">Выберите одну небольшую задачу из подготовки к уроку.</p><p className="mb-4 text-xs leading-relaxed text-[#667b6c]">Например, попросите составить три вопроса для проверки понимания темы — и проверьте каждый перед использованием.</p><button onClick={() => navigate('workflow')} className="text-xs font-bold text-[#34724c] underline decoration-[#aecdb3] underline-offset-4">Посмотреть пошаговый гайд <ArrowRight size={13} className="ml-1 inline" /></button></div>
    </section>
    <div className="mt-5 flex flex-wrap gap-2"><Pill tone="gray">{data.savedPrompts.length} промптов сохранено</Pill><Pill tone="gray">{data.labEntries.length} заметок в лаборатории</Pill><Pill tone="gray">Работает без учётной записи</Pill></div>
  </>
}

function Metric({ value, label }: { value: string; label: string }) {
  return <div className="rounded-xl bg-white/[.06] px-2 py-3"><div className="text-base font-bold text-white">{value}</div><div className="mt-1 text-[10px] text-slate-400">{label}</div></div>
}

function Fundamentals() {
  const [answer, setAnswer] = useState<number | null>(null)
  const choices = ['фотосинтезу', 'испарению', 'магнитному полю']
  return <>
    <PageHeading eyebrow="МОДУЛЬ 01 · ПОНЯТЬ ПРИНЦИПЫ" title="Основы генеративного ИИ" text="Разберитесь, как модель создаёт ответы, где она полезна и почему убедительный текст ещё не означает верный." icon={Brain} />
    <div className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
      <section className="rounded-2xl border border-[#e4e6df] bg-white p-5 sm:p-7"><Pill>ОТ ЗАПРОСА К ОТВЕТУ</Pill><h2 className="display-font mb-2 mt-4 text-xl font-bold">Модель продолжает закономерности</h2><p className="max-w-2xl text-sm leading-relaxed text-[#6e7c87]">Генеративная модель обучается на большом наборе примеров и подбирает вероятное продолжение последовательности. Она может собирать связный ответ, но не «знает» контекст класса и не подтверждает факты автоматически.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">{[
          { step: '01', title: 'Запрос', text: 'Вы задаёте тему, контекст и желаемый формат.', icon: MessageSquareText },
          { step: '02', title: 'Закономерности', text: 'Модель оценивает подходящие продолжения текста.', icon: Brain },
          { step: '03', title: 'Черновик', text: 'Вы получаете вариант, который важно проверить.', icon: FileText },
        ].map(item => { const Icon = item.icon; return <div key={item.step} className="rounded-xl bg-[#f7f8f4] p-4"><div className="flex items-center justify-between"><Icon size={18} className="text-[#4b895f]" /><span className="text-[10px] font-bold tracking-widest text-[#a3aea7]">{item.step}</span></div><h3 className="mb-1 mt-4 text-sm font-bold">{item.title}</h3><p className="mb-0 text-xs leading-relaxed text-[#74818a]">{item.text}</p></div> })}</div>
      </section>
      <section className="rounded-2xl bg-[#eaf3eb] p-5 sm:p-6"><div className="flex items-center gap-2 text-xs font-bold tracking-wide text-[#477957]"><CircleHelp size={16} /> ПОЛЕЗНО ПОМНИТЬ</div><ul className="mb-0 mt-4 space-y-3 pl-4 text-sm leading-relaxed text-[#405d49]"><li>Ответ может быть правдоподобным и одновременно ошибочным.</li><li>Модель не знает ваших учеников, если вы не задали безопасный контекст.</li><li>Качество результата зависит от задачи, примеров и уточнений.</li><li>Ваша экспертиза нужна до и после генерации.</li></ul><div className="mt-5 rounded-xl border border-[#d4e4d6] bg-white/70 p-3 text-xs leading-relaxed text-[#64796a]"><strong>Термин:</strong> генеративный ИИ — класс систем, способных создавать новый текст, изображения, код, звук и другие материалы на основе выученных закономерностей.</div></section>
    </div>
    <section className="mt-5 overflow-hidden rounded-2xl border border-[#e4e6df] bg-white">
      <div className="grid lg:grid-cols-[.9fr_1.1fr]">
        <div className="p-5 sm:p-7"><Pill tone="amber">МИНИ-ЭКСПЕРИМЕНТ</Pill><h2 className="display-font mb-2 mt-4 text-xl font-bold">Выберите вероятное продолжение</h2><p className="text-sm leading-relaxed text-[#6f7d87]">Это учебная иллюстрация: реальная модель учитывает гораздо больше контекста, чем одно пропущенное слово.</p><div className="mt-5 rounded-xl bg-[#f6f7f3] px-4 py-4 text-sm leading-relaxed"><span className="text-[#79858b]">Растения получают энергию благодаря </span><span className="rounded bg-[#dff0e2] px-1.5 py-0.5 font-bold text-[#34734c]">…</span></div><div className="mt-4 space-y-2">{choices.map((choice, index) => { const selected = answer === index; const correct = index === 0; return <button key={choice} onClick={() => setAnswer(index)} className={`focus-ring flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${selected ? correct ? 'border-[#83bd90] bg-[#eef8ef] text-[#2f6a43]' : 'border-[#e6b4a4] bg-[#fff2ed] text-[#9c5443]' : 'border-[#e8e9e3] bg-white hover:border-[#bfd9c2]'}`}><span>{choice}</span>{selected && (correct ? <Check size={16} /> : <X size={16} />)}</button> })}</div><AnimatePresence>{answer !== null && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`mb-0 mt-3 text-xs leading-relaxed ${answer === 0 ? 'text-[#3a744b]' : 'text-[#8e594b]'}`}>{answer === 0 ? 'Верно. В контексте растений это закономерное продолжение. Но в открытой задаче модель могла бы предложить другое слово — поэтому важны точный запрос и проверка.' : 'Попробуйте ещё раз. Подумайте, какой процесс связывает солнечный свет, воду и питание растений.'}</motion.p>}</AnimatePresence></div>
        <div className="paper-grid flex min-h-[280px] items-center justify-center bg-[#f2f4ee] p-6"><div className="w-full max-w-sm rounded-2xl border border-white bg-white p-5 shadow-card"><div className="mb-4 flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-mint"><Sparkles size={16} /></span><span className="text-xs font-bold">Черновик ответа</span></div><div className="space-y-3"><div className="h-2.5 w-[93%] rounded-full bg-[#edf0eb]" /><div className="h-2.5 w-[82%] rounded-full bg-[#edf0eb]" /><div className="h-2.5 w-[88%] rounded-full bg-[#edf0eb]" /><div className="h-2.5 w-[67%] rounded-full bg-[#edf0eb]" /></div><div className="mt-5 flex items-center gap-2 rounded-lg bg-[#fff4dd] px-3 py-2 text-[11px] text-[#8f6b2f]"><Lightbulb size={14} /> Проверка фактов — задача человека</div></div></div>
      </div>
    </section>
    <div className="mt-5 grid gap-3 sm:grid-cols-3">{[['Подходит для', 'Черновиков, идей, объяснений, вариантов заданий'], ['Не заменяет', 'Предметную экспертизу, первоисточники, оценивание'], ['Проверяйте', 'Факты, предвзятость, возрастную уместность и права']].map(([title, text]) => <div key={title} className="rounded-xl border border-[#e5e6df] bg-white px-4 py-4"><div className="mb-1 text-xs font-bold">{title}</div><p className="mb-0 text-xs leading-relaxed text-[#73808a]">{text}</p></div>)}</div>
  </>
}

function Catalog() {
  const [query, setQuery] = useState('')
  const [family, setFamily] = useState('Все')
  const filtered = useMemo(() => catalogServices.filter(item => (family === 'Все' || item.family === family) && `${item.name} ${item.description} ${item.goodFor} ${item.family}`.toLowerCase().includes(query.toLowerCase())), [query, family])
  return <>
    <PageHeading eyebrow="МОДУЛЬ 02 · ОРИЕНТИРЫ ДЛЯ ВЫБОРА" title="Каталог сервисов и задач" text="Подбирайте тип инструмента под учебную задачу. Карточки описывают категории возможностей, а не подтверждают доступность конкретных платформ." icon={Search} />
    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#ecdcb8] bg-[#fff7e5] p-4 sm:p-5"><div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#f8e8bf] text-[#8d6a28]"><ExternalLink size={16} /></div><div><div className="text-sm font-bold text-[#73581f]">Перед использованием проверьте условия сервиса</div><p className="mb-0 mt-1 text-xs leading-relaxed text-[#806c40]">Актуальность карточек: 24.11.2026. Доступность сервисов и тарифы не сверялись. Они меняются; проверяйте их на официальной странице выбранного инструмента, а также уточняйте возрастные ограничения, хранение данных и правила школы.</p></div></div>
    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#e5e6df] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"><label className="relative block w-full sm:max-w-sm"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#96a19d]" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Найти тип инструмента или задачу" className="focus-ring h-11 w-full rounded-xl border border-[#e5e7e1] bg-[#fafbf8] pl-10 pr-3 text-sm outline-none placeholder:text-[#a0aaa5]" /></label><div className="flex flex-wrap gap-1.5">{serviceFamilies.map(item => <button key={item} onClick={() => setFamily(item)} className={`focus-ring rounded-full px-3 py-2 text-[11px] font-semibold transition ${family === item ? 'bg-ink text-white' : 'bg-[#f2f3ef] text-[#64717b] hover:bg-[#e6ebe4]'}`}>{item}</button>)}</div></div>
    <div className="mb-3 flex items-center justify-between text-xs text-[#73808a]"><span>Показано: <strong className="text-ink">{filtered.length}</strong></span><span className="hidden sm:inline">Фильтруйте по формату помощи</span></div>
    {filtered.length ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{filtered.map((item, index) => <article key={item.name} className="rounded-2xl border border-[#e5e6df] bg-white p-5 transition hover:border-[#cdddcf] hover:shadow-card"><div className="flex items-start justify-between"><span className={`grid h-10 w-10 place-items-center rounded-xl ${['bg-[#eaf3e9] text-[#477c52]', 'bg-[#e9f0f5] text-[#51738a]', 'bg-[#f7eee3] text-[#a17639]'][index % 3]}`}><ServiceIcon family={item.family} /></span><Pill tone="gray">{item.family}</Pill></div><h2 className="display-font mb-1 mt-4 text-base font-bold">{item.name}</h2><p className="mb-4 text-xs leading-relaxed text-[#71808a]">{item.description}</p><div className="rounded-xl bg-[#f6f8f3] p-3"><div className="text-[10px] font-bold tracking-wide text-[#4e7b59]">ПОДХОДЯЩАЯ ЗАДАЧА</div><p className="mb-0 mt-1 text-xs leading-relaxed text-[#607168]">{item.goodFor}</p></div><div className="mt-3 flex gap-2 text-[11px] leading-relaxed text-[#827153]"><span className="mt-0.5 shrink-0 text-[#c18c3b]">●</span><span>{item.caution}</span></div></article>)}</div> : <div className="rounded-2xl border border-dashed border-[#d5d9d1] bg-white p-10 text-center"><Search className="mx-auto text-[#9aa59c]" /><p className="mb-0 mt-3 text-sm text-[#71808a]">Ничего не найдено. Попробуйте изменить запрос или фильтр.</p></div>}
    <div className="mt-5 rounded-xl bg-[#eaf0f3] p-4 text-xs leading-relaxed text-[#5d7180]"><strong>Как сравнивать:</strong> кроме качества ответа учитывайте язык, доступность для вашей аудитории, требования к регистрации, политику обработки данных, возрастные ограничения, экспорт и условия использования результата.</div>
  </>
}

function ServiceIcon({ family }: { family: string }) {
  const Icon = family === 'Изображения' ? Sparkles : family === 'Поиск' ? Search : family === 'Голос' ? MessageSquareText : family === 'Код' ? FlaskConical : FileText
  return <Icon size={19} />
}

function Workflow({ completed, toggle }: { completed: string[]; toggle: (id: string) => void }) {
  const [openStep, setOpenStep] = useState(0)
  const finished = completed.length
  return <>
    <PageHeading eyebrow="МОДУЛЬ 03 · ПОШАГОВЫЙ ГАЙД" title="Как работать с ИИ" text="Пять шагов помогают превратить расплывчатую просьбу в проверяемый учебный результат." icon={ListFilter} />
    <div className="grid gap-5 lg:grid-cols-[1fr_290px]">
      <div className="space-y-3">{guideSteps.map((step, index) => { const isOpen = openStep === index; const done = completed.includes(`step-${index}`); return <article key={step.title} className={`overflow-hidden rounded-2xl border bg-white transition ${isOpen ? 'border-[#c8ddca] shadow-[0_8px_24px_rgba(23,43,66,.045)]' : 'border-[#e5e6df]'}`}><button onClick={() => setOpenStep(isOpen ? -1 : index)} className="focus-ring flex w-full items-center gap-4 px-4 py-4 text-left sm:px-5"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-extrabold ${done ? 'bg-[#e0f2e4] text-[#36764a]' : 'bg-[#f0f2ed] text-[#758078]'}`}>{done ? <Check size={18} /> : `0${index + 1}`}</span><span className="flex-1"><span className="block text-sm font-bold">{step.title}</span><span className="mt-1 block text-xs text-[#82908a]">Шаг {index + 1} из 5</span></span><ChevronDown size={17} className={`text-[#87938e] transition ${isOpen ? 'rotate-180' : ''}`} /></button><AnimatePresence initial={false}>{isOpen && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="border-t border-[#eef0eb] px-4 pb-5 pt-4 sm:ml-[72px] sm:px-5"><p className="text-sm leading-relaxed text-[#64737c]">{step.text}</p><div className="rounded-xl bg-[#f6f8f3] p-3"><div className="mb-1 text-[10px] font-bold tracking-wide text-[#4e7b59]">ПРИМЕР ФОРМУЛИРОВКИ</div><p className="mb-0 text-xs leading-relaxed text-[#52685a]">{step.example}</p></div><button onClick={() => toggle(`step-${index}`)} className={`mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${done ? 'bg-[#edf5ed] text-[#3f754d]' : 'bg-ink text-white hover:bg-[#1d3c59]'}`}>{done ? <><Check size={14} /> Шаг отмечен</> : 'Отметить шаг как пройденный'}</button></div></motion.div>}</AnimatePresence></article> })}</div>
      <aside className="h-fit rounded-2xl bg-ink p-5 text-white lg:sticky lg:top-[90px]"><Pill>ВАШ МАРШРУТ</Pill><h2 className="display-font mb-2 mt-4 text-lg font-bold">Пять привычек</h2><p className="text-xs leading-relaxed text-slate-300">Отмечайте шаги по мере освоения. Состояние сохраняется автоматически.</p><div className="my-5 flex items-end justify-between"><span className="text-xs text-slate-300">Завершено</span><span className="text-2xl font-extrabold text-mint">{finished}<span className="text-sm text-slate-400"> / 5</span></span></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#87c89b] transition-all" style={{ width: `${finished / 5 * 100}%` }} /></div><div className="mt-5 rounded-xl border border-white/10 bg-white/[.06] p-3 text-[11px] leading-relaxed text-slate-300"><LockKeyhole size={14} className="mb-2 text-mint" />Перед отправкой запроса проверьте, что в нём нет данных, по которым можно узнать конкретного ученика.</div></aside>
    </div>
  </>
}

function PromptBuilder({ data, setData, notify }: { data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>>; notify: (text: string) => void }) {
  const [role, setRole] = useState('Ты — доброжелательный учитель естествознания.')
  const [context, setContext] = useState('Ученики 6 класса только изучили тему круговорота воды.')
  const [task, setTask] = useState('Объясни испарение и конденсацию простыми словами.')
  const [format, setFormat] = useState('Оформи как 4 коротких пункта и один вопрос.')
  const [criteria, setCriteria] = useState('До 120 слов, без новых терминов без пояснения.')
  const [title, setTitle] = useState('Объяснение новой темы')
  const [selectedFormula, setSelectedFormula] = useState(0)
  const prompt = useMemo(() => [role && `Роль: ${role}`, context && `Контекст: ${context}`, task && `Задача: ${task}`, format && `Формат: ${format}`, criteria && `Критерии: ${criteria}`].filter(Boolean).join('\n\n'), [role, context, task, format, criteria])
  const savePrompt = () => {
    if (!prompt.trim()) { notify('Добавьте хотя бы один элемент запроса'); return }
    const saved: SavedPrompt = { id: crypto.randomUUID(), title: title.trim() || 'Новый промпт', content: prompt, createdAt: new Date().toISOString() }
    setData(current => ({ ...current, savedPrompts: [saved, ...current.savedPrompts] }))
    notify('Промпт сохранён в этом браузере')
  }
  const copyText = async (text: string) => {
    try { await navigator.clipboard.writeText(text); notify('Скопировано в буфер обмена') }
    catch { notify('Не удалось скопировать. Выделите текст и скопируйте вручную') }
  }
  const deletePrompt = (id: string) => setData(current => ({ ...current, savedPrompts: current.savedPrompts.filter(item => item.id !== id) }))
  return <>
    <PageHeading eyebrow="МОДУЛЬ 04 · ИНТЕРАКТИВНЫЙ ИНСТРУМЕНТ" title="Конструктор промптов" text="Соберите ясную инструкцию из пяти частей. Запрос задаёт направление, а проверка и доработка улучшают результат." icon={MessageSquareText} />
    <section className="mb-5 rounded-2xl border border-[#e5e6df] bg-white p-5 sm:p-6"><div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between"><div className="max-w-sm"><Pill tone="blue">ИНТЕРАКТИВНАЯ ФОРМУЛА</Pill><h2 className="display-font mb-1 mt-3 text-lg font-bold">Роль + контекст + задача + формат + критерии</h2><p className="mb-0 text-xs leading-relaxed text-[#71808a]">Нажмите на часть формулы, чтобы увидеть пример и разобраться, зачем она нужна.</p></div><div className="flex flex-wrap items-center gap-1.5">{formulaParts.map((part, index) => <span key={part.label} className="flex items-center gap-1.5"><button onClick={() => setSelectedFormula(index)} className={`focus-ring rounded-lg px-3 py-2 text-xs font-bold transition ${selectedFormula === index ? 'bg-ink text-white' : 'bg-[#f0f2ed] text-[#65736f] hover:bg-[#e5eee5]'}`}>{part.label}</button>{index < formulaParts.length - 1 && <Plus size={14} className="text-[#a3aea7]" />}</span>)}</div></div><div className="mt-4 flex items-start gap-3 rounded-xl bg-[#f6f8f3] p-4"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-[#4d8359]"><Lightbulb size={16} /></span><p className="mb-0 text-xs leading-relaxed text-[#60716a]"><strong className="text-ink">{formulaParts[selectedFormula].detail}</strong><br />{formulaParts[selectedFormula].sample}</p></div></section>
    <div className="grid items-start gap-5 xl:grid-cols-[1.05fr_.95fr]">
      <section className="rounded-2xl border border-[#e5e6df] bg-white p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="display-font mb-1 text-lg font-bold">Ваш запрос</h2><p className="mb-0 text-xs text-[#7b8790]">Редактируйте поля — результат обновится автоматически.</p></div><span className="rounded-full bg-[#f2f4ef] px-2.5 py-1 text-[10px] font-bold text-[#77847a]">5 частей</span></div><div className="space-y-4"><Field label="Роль" hint="Какой опыт или точку зрения задать?" value={role} onChange={setRole} /><Field label="Контекст" hint="Класс, тема, уровень и важные вводные." value={context} onChange={setContext} multiline /><Field label="Задача" hint="Одно действие, которое должна выполнить модель." value={task} onChange={setTask} multiline /><Field label="Формат" hint="Объём, структура или тип результата." value={format} onChange={setFormat} /><Field label="Критерии и ограничения" hint="Что проверить, исключить или пояснить?" value={criteria} onChange={setCriteria} /><label className="block"><span className="mb-1.5 block text-xs font-bold">Название для сохранения</span><input value={title} onChange={event => setTitle(event.target.value)} className="focus-ring h-10 w-full rounded-lg border border-[#e5e7e1] bg-[#fafbf8] px-3 text-sm outline-none" /></label></div></section>
      <div className="space-y-4 xl:sticky xl:top-[88px]"><section className="overflow-hidden rounded-2xl bg-ink text-white"><div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div><div className="text-[10px] font-bold tracking-[.16em] text-[#9fd1ab]">ПРЕДПРОСМОТР</div><h2 className="display-font mb-0 mt-1 text-base font-bold">Готовый промпт</h2></div><Sparkles size={18} className="text-[#a7d9b2]" /></div><div className="max-h-[420px] overflow-y-auto whitespace-pre-wrap px-5 py-5 text-sm leading-relaxed text-slate-200 quiet-scrollbar">{prompt || 'Заполните поля слева, чтобы собрать запрос.'}</div><div className="flex flex-wrap gap-2 border-t border-white/10 px-5 py-4"><button onClick={() => void copyText(prompt)} className="focus-ring inline-flex items-center gap-2 rounded-lg bg-[#d9f2e5] px-3 py-2 text-xs font-bold text-[#245a3a]"><Clipboard size={14} />Скопировать</button><button onClick={savePrompt} className="focus-ring inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10"><Plus size={14} />Сохранить в библиотеку</button></div></section><div className="rounded-xl border border-[#e4e6df] bg-white p-4 text-xs leading-relaxed text-[#6e7c84]"><strong className="text-ink">Уточняйте итерациями.</strong> Если ответ не подходит, укажите один критерий: например «сделай формулировки короче» или «добавь пример для ученика, который только начал тему».</div></div>
    </div>
    <section className="mt-6"><div className="mb-3 flex items-end justify-between"><div><div className="mb-1 text-[10px] font-bold tracking-[.18em] text-[#70836f]">ЛИЧНАЯ БИБЛИОТЕКА</div><h2 className="display-font m-0 text-lg font-bold">Сохранённые промпты <span className="text-sm font-medium text-[#85918b]">({data.savedPrompts.length})</span></h2></div></div>{data.savedPrompts.length ? <div className="grid gap-3 md:grid-cols-2">{data.savedPrompts.map(saved => <article key={saved.id} className="rounded-xl border border-[#e5e6df] bg-white p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="mb-1 text-sm font-bold">{saved.title}</h3><p className="mb-0 line-clamp-3 whitespace-pre-wrap text-xs leading-relaxed text-[#76838b]">{saved.content}</p></div><button onClick={() => deletePrompt(saved.id)} aria-label="Удалить промпт" className="focus-ring grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#8e9995] hover:bg-[#fff1ed] hover:text-[#a55b4b]"><Trash2 size={15} /></button></div><div className="mt-3 flex items-center justify-between border-t border-[#eff0eb] pt-3"><span className="text-[10px] text-[#9aa39f]">{new Date(saved.createdAt).toLocaleDateString('ru-RU')}</span><button onClick={() => void copyText(saved.content)} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#477957]"><Clipboard size={13} />Скопировать</button></div></article>)}</div> : <div className="rounded-xl border border-dashed border-[#d8ddd5] bg-white px-4 py-7 text-center text-xs text-[#85918b]">Сохранённые запросы появятся здесь. Они доступны только в этом браузере.</div>}</section>
  </>
}

function Field({ label, hint, value, onChange, multiline = false }: { label: string; hint: string; value: string; onChange: (value: string) => void; multiline?: boolean }) {
  const shared = 'focus-ring w-full rounded-lg border border-[#e5e7e1] bg-[#fafbf8] px-3 py-2.5 text-sm leading-relaxed outline-none transition focus:border-[#b9d3bc]'
  return <label className="block"><span className="mb-1.5 block text-xs font-bold">{label}</span><span className="mb-1.5 block text-[10px] text-[#929d97]">{hint}</span>{multiline ? <textarea value={value} onChange={event => onChange(event.target.value)} rows={2} className={`${shared} resize-y`} /> : <input value={value} onChange={event => onChange(event.target.value)} className={shared} />}</label>
}

function Scenarios({ completed, setData }: { completed: string[]; setData: React.Dispatch<React.SetStateAction<AppData>> }) {
  const [subject, setSubject] = useState('Все направления')
  const subjects = ['Все направления', ...new Set(lessonScenarios.map(item => item.subject))]
  const filtered = lessonScenarios.filter(item => subject === 'Все направления' || item.subject === subject)
  const toggle = (title: string) => setData(current => ({ ...current, scenarioCompleted: current.scenarioCompleted.includes(title) ? current.scenarioCompleted.filter(item => item !== title) : [...current.scenarioCompleted, title] }))
  return <>
    <PageHeading eyebrow="МОДУЛЬ 05 · ОТ ИДЕИ К ЗАНЯТИЮ" title="Сценарии уроков и кружков" text="Возьмите за основу заготовку, адаптируйте под программу и уровень группы, затем проверьте фактическую точность и учебную ценность." icon={BookOpen} />
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e5e6df] bg-white p-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e8eef5] text-[#54738c]"><GraduationCap size={18} /></span><div><div className="text-sm font-bold">Практические заготовки</div><div className="text-xs text-[#7e8b92]">Для школьных предметов и дополнительного образования</div></div></div><label className="flex items-center gap-2 text-xs text-[#7a878e]"><span className="hidden sm:inline">Направление</span><select value={subject} onChange={event => setSubject(event.target.value)} className="focus-ring h-10 rounded-lg border border-[#e4e6df] bg-[#fafbf8] px-3 text-xs font-semibold text-ink outline-none">{subjects.map(item => <option key={item}>{item}</option>)}</select></label></div>
    <div className="grid gap-4 lg:grid-cols-2">{filtered.map((item, index) => { const done = completed.includes(item.title); return <article key={item.title} className="rounded-2xl border border-[#e5e6df] bg-white p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-2"><Pill tone={index % 2 ? 'blue' : 'green'}>{item.subject}</Pill><span className="text-[10px] font-semibold text-[#8c9892]">{item.level}</span></div><h2 className="display-font mb-2 mt-4 text-lg font-bold">{item.title}</h2><div className="mb-4 flex items-start gap-2 text-xs leading-relaxed text-[#6f7d85]"><Target size={14} className="mt-0.5 shrink-0 text-[#5a8b65]" /><span><strong className="text-ink">Учебная цель:</strong> {item.goal}</span></div><div className="rounded-xl bg-[#f5f7f3] p-4"><div className="mb-2 text-[10px] font-bold tracking-wide text-[#4c7a55]">ЧЕРНОВИК ЗАПРОСА</div><p className="mb-0 whitespace-pre-wrap text-xs leading-relaxed text-[#54665a]">{item.prompt}</p></div><div className="mt-3 flex items-start gap-2 rounded-xl bg-[#fff6e7] p-3 text-[11px] leading-relaxed text-[#786944]"><Lightbulb size={14} className="mt-0.5 shrink-0 text-[#a88342]" /><span><strong>Доработка учителя:</strong> {item.teacher}</span></div><button onClick={() => toggle(item.title)} className={`focus-ring mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${done ? 'bg-[#edf5ed] text-[#3e744c]' : 'bg-ink text-white hover:bg-[#1d3c59]'}`}>{done ? <><Check size={14} />Использовал(а) как ориентир</> : 'Отметить как просмотренное'}</button></article> })}</div>
    <div className="mt-5 flex items-center justify-between rounded-xl bg-[#eaf3eb] px-4 py-3 text-xs text-[#59715f]"><span>Просмотрено сценариев</span><strong>{completed.length} / {lessonScenarios.length}</strong></div>
  </>
}

function Safety({ data, setData }: { data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>> }) {
  const answered = Object.keys(data.safetyAnswers).length
  const score = safetyCases.filter(item => data.safetyAnswers[item.id] === item.correct).length
  const choose = (id: string, choice: number) => setData(current => ({ ...current, safetyAnswers: { ...current.safetyAnswers, [id]: choice } }))
  const reset = () => setData(current => ({ ...current, safetyAnswers: {} }))
  return <>
    <PageHeading eyebrow="МОДУЛЬ 06 · ПРАКТИКА ОТВЕТСТВЕННОСТИ" title="Безопасность и критическая проверка" text="Решите, как поступить в учебных ситуациях. После выбора разберите, какие риски важно учитывать и какие действия помогут." icon={ShieldCheck} />
    <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center rounded-2xl border border-[#e5e6df] bg-white p-4 sm:p-5"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f6e9e5] text-[#a46252]"><ShieldCheck size={20} /></div><div><div className="text-sm font-bold">Ваш разбор ситуаций</div><div className="text-xs text-[#7d8a91]">Отвечено: {answered} из {safetyCases.length} · Верных решений: {score}</div></div></div>{answered > 0 && <button onClick={reset} className="focus-ring inline-flex items-center gap-2 rounded-lg border border-[#e5e6df] px-3 py-2 text-xs font-semibold text-[#6f7b83] hover:bg-[#f7f8f4]"><ArrowLeft size={13} />Начать заново</button>}</div>
    <div className="space-y-4">{safetyCases.map((item, index) => { const answer = data.safetyAnswers[item.id]; const isAnswered = answer !== undefined; return <article key={item.id} className="rounded-2xl border border-[#e5e6df] bg-white p-5 sm:p-6"><div className="flex items-start gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#f2f3ef] text-xs font-extrabold text-[#7d8982]">0{index + 1}</span><div className="flex-1"><div className="mb-1 text-[10px] font-bold tracking-wide text-[#8d9891]">СИТУАЦИОННОЕ ЗАДАНИЕ</div><h2 className="display-font mb-3 text-base font-bold">{item.title}</h2><p className="mb-4 text-sm leading-relaxed text-[#65747d]">{item.scenario}</p><div className="space-y-2">{item.options.map((option, optionIndex) => { const selected = answer === optionIndex; const isCorrect = item.correct === optionIndex; let style = 'border-[#e7e9e3] bg-white hover:border-[#c9d9ca]'; if (isAnswered && selected) style = isCorrect ? 'border-[#8fc49a] bg-[#eef8ef] text-[#3c6d48]' : 'border-[#e4a99b] bg-[#fff2ed] text-[#8f5144]'; if (isAnswered && isCorrect) style = 'border-[#b5d7b9] bg-[#f3faf2] text-[#3c6d48]'; return <button disabled={isAnswered} key={option} onClick={() => choose(item.id, optionIndex)} className={`focus-ring flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left text-xs leading-relaxed transition disabled:cursor-default ${style}`}><span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border ${isAnswered && isCorrect ? 'border-[#549265] bg-[#549265] text-white' : 'border-[#c8cfca]'}`}>{isAnswered && isCorrect && <Check size={10} />}</span><span>{option}</span></button> })}</div>{isAnswered && <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 rounded-xl p-4 text-xs leading-relaxed ${answer === item.correct ? 'bg-[#edf6ed] text-[#55715b]' : 'bg-[#fff5e7] text-[#786847]'}`}><div className="mb-1 flex items-center gap-2 font-bold">{answer === item.correct ? <CheckCircle2 size={15} /> : <Lightbulb size={15} />}{answer === item.correct ? 'Хорошее решение' : 'Что стоит учесть'}</div>{item.explanation}</motion.div>}</div></div></article> })}</div>
    {answered === safetyCases.length && <div className="mt-5 rounded-2xl bg-ink p-5 text-white sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><Pill>РАЗБОР ЗАВЕРШЁН</Pill><h2 className="display-font mb-1 mt-3 text-xl font-bold">Результат: {score} из {safetyCases.length}</h2><p className="mb-0 text-xs text-slate-300">Используйте чек-лист: данные · факты · стереотипы · авторство · права на материалы.</p></div><div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-4 border-[#89c499] text-xl font-extrabold text-mint">{Math.round(score / safetyCases.length * 100)}%</div></div></div>}
  </>
}

function Laboratory({ data, setData, notify }: { data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>>; notify: (text: string) => void }) {
  const [title, setTitle] = useState('')
  const [goal, setGoal] = useState('')
  const [output, setOutput] = useState('')
  const [reflection, setReflection] = useState('')
  const [showForm, setShowForm] = useState(false)
  const addEntry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!title.trim() || !goal.trim()) return
    const entry: LabEntry = { id: crypto.randomUUID(), title: title.trim(), goal: goal.trim(), output: output.trim(), reflection: reflection.trim(), createdAt: new Date().toISOString() }
    setData(current => ({ ...current, labEntries: [entry, ...current.labEntries] }))
    setTitle(''); setGoal(''); setOutput(''); setReflection(''); setShowForm(false)
    notify('Запись добавлена в лабораторию')
  }
  const exportData = () => {
    const payload = { application: 'Генеративный ИИ в образовании', exportedAt: new Date().toISOString(), data }
    const file = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url; link.download = 'ai-education-lab.json'; link.click()
    URL.revokeObjectURL(url)
    notify('Экспорт JSON готов')
  }
  const removeEntry = (id: string) => setData(current => ({ ...current, labEntries: current.labEntries.filter(item => item.id !== id) }))
  return <>
    <PageHeading eyebrow="МОЁ ПРОСТРАНСТВО · ЛОКАЛЬНО НА УСТРОЙСТВЕ" title="Личная лаборатория" text="Сохраняйте эксперименты с запросами, фиксируйте выводы и выгружайте свои данные в JSON." icon={FlaskConical} />
    <div className="mb-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center"><div className="rounded-2xl border border-[#dce8dd] bg-[#edf5ed] p-5"><div className="flex items-start gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-[#4b8357]"><LockKeyhole size={17} /></div><div><div className="text-sm font-bold text-[#3e6748]">Ваши записи принадлежат этому браузеру</div><p className="mb-0 mt-1 text-xs leading-relaxed text-[#647b69]">Материалы сохраняются в LocalStorage. Очистка данных браузера удалит сохранённые записи — используйте экспорт для резервной копии.</p></div></div></div><button onClick={exportData} className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-ink px-5 text-sm font-bold text-white transition hover:bg-[#1d3c59]"><Download size={16} />Экспортировать JSON</button></div>
    <div className="mb-5 flex items-center justify-between rounded-2xl border border-[#e5e6df] bg-white p-4 sm:p-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f5eddf] text-[#9a7538]"><FlaskConical size={19} /></span><div><h2 className="display-font mb-0 text-base font-bold">Эксперименты и заметки</h2><p className="mb-0 mt-1 text-xs text-[#7e8a90]">{data.labEntries.length} {pluralize(data.labEntries.length, 'запись', 'записи', 'записей')}</p></div></div><button onClick={() => setShowForm(value => !value)} className="focus-ring inline-flex items-center gap-2 rounded-lg bg-[#e5f2e6] px-3.5 py-2.5 text-xs font-bold text-[#3e754d] hover:bg-[#d8ecd9]"><Plus size={15} />Новый эксперимент</button></div>
    <AnimatePresence>{showForm && <motion.form onSubmit={addEntry} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mb-5 grid gap-4 rounded-2xl border border-[#dce8dd] bg-white p-5 sm:grid-cols-2 sm:p-6"><div className="sm:col-span-2"><Pill>КАРТОЧКА ЭКСПЕРИМЕНТА</Pill><h3 className="display-font mb-0 mt-3 text-lg font-bold">Зафиксируйте учебный опыт</h3></div><Field label="Название" hint="Короткий заголовок эксперимента." value={title} onChange={setTitle} /><Field label="Цель" hint="Что хотели улучшить или подготовить?" value={goal} onChange={setGoal} /><Field label="Промпт или результат" hint="Запрос, ссылка на локальный материал или итог наблюдения." value={output} onChange={setOutput} multiline /><Field label="Рефлексия" hint="Что сработало? Что вы проверили или изменили?" value={reflection} onChange={setReflection} multiline /><div className="flex gap-2 sm:col-span-2"><button type="submit" className="focus-ring rounded-lg bg-ink px-4 py-2.5 text-xs font-bold text-white">Сохранить заметку</button><button type="button" onClick={() => setShowForm(false)} className="focus-ring rounded-lg border border-[#e4e6df] px-4 py-2.5 text-xs font-semibold text-[#6e7a81]">Отмена</button></div></motion.form>}</AnimatePresence>
    {data.labEntries.length ? <div className="grid gap-3 md:grid-cols-2">{data.labEntries.map(entry => <article key={entry.id} className="rounded-2xl border border-[#e5e6df] bg-white p-5"><div className="flex items-start justify-between gap-3"><div><Pill tone="gray">{new Date(entry.createdAt).toLocaleDateString('ru-RU')}</Pill><h3 className="display-font mb-1 mt-3 text-base font-bold">{entry.title}</h3></div><button onClick={() => removeEntry(entry.id)} aria-label="Удалить запись" className="focus-ring grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#8f9a94] hover:bg-[#fff0eb] hover:text-[#a55b4b]"><Trash2 size={15} /></button></div><p className="text-xs leading-relaxed text-[#65747d]"><strong className="text-ink">Цель:</strong> {entry.goal}</p>{entry.output && <div className="mb-3 rounded-lg bg-[#f6f8f3] p-3"><div className="mb-1 text-[10px] font-bold tracking-wide text-[#718274]">ПРОМПТ / РЕЗУЛЬТАТ</div><p className="mb-0 whitespace-pre-wrap text-xs leading-relaxed text-[#617168]">{entry.output}</p></div>}{entry.reflection && <p className="mb-0 text-xs leading-relaxed text-[#65747d]"><strong className="text-ink">Рефлексия:</strong> {entry.reflection}</p>}</article>)}</div> : <div className="rounded-2xl border border-dashed border-[#d7ddd5] bg-white px-5 py-12 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#eef3ea] text-[#5b8060]"><FlaskConical size={22} /></div><h3 className="display-font mb-1 mt-4 text-base font-bold">Начните с небольшого эксперимента</h3><p className="mx-auto mb-4 max-w-md text-xs leading-relaxed text-[#7b888d]">Например, сравните два варианта запроса для составления проверочных вопросов и запишите, что пришлось проверить или переписать.</p><button onClick={() => setShowForm(true)} className="focus-ring inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-xs font-bold text-white"><Plus size={14} />Добавить первую запись</button></div>}
    <div className="mt-6 rounded-xl border border-[#e5e6df] bg-white p-4 text-xs leading-relaxed text-[#74818a]"><strong className="text-ink">Что попадает в JSON:</strong> заметки лаборатории, сохранённые промпты, отметки по гайду, сценариям и ответам на задания по безопасности.</div>
  </>
}

function pluralize(count: number, one: string, few: string, many: string) {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

export default App
