import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen, Bookmark, Check, ChevronLeft, ChevronRight, CircleHelp, Clock3,
  Flame, GraduationCap, Heart, LayoutDashboard, Lightbulb, Plus, Search,
  Sparkles, Trash2, Volume2, X, ArrowRight, Menu, RotateCcw, Waves, Compass, Trophy, BrainCircuit, PlayCircle, CheckCircle2, Gamepad2, BarChart3, CalendarDays, UserRound, Target
} from 'lucide-react';

const CATEGORIES = ['All', 'Everyday', 'Personal growth', 'Communication', 'Work', 'Literature', 'General'];
const POSITIONS = ['Noun', 'Verb', 'Adjective', 'Adverb', 'Other'];

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'Something went wrong. Please try again.');
  }
  return response.status === 204 ? null : response.json();
}

function WorkspaceApp() {
  const [words, setWords] = useState([]);
  const [stats, setStats] = useState({ total: 0, favorites: 0, categories: 0 });
  const [activePage, setActivePage] = useState('Overview');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizChoice, setQuizChoice] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  async function loadWords() {
    setLoading(true);
    try {
      const [list, summary] = await Promise.all([
        api('/api/words'), api('/api/stats')
      ]);
      setWords(list);
      setStats(summary);
    } catch {
      setToast('Could not connect to the API. Start the app with npm run dev.');
    } finally { setLoading(false); }
  }
  useEffect(() => { loadWords(); }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const filteredWords = useMemo(() => words.filter(w => {
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || [w.word, w.meaning, w.example, w.category].some(s => s.toLowerCase().includes(q));
    const matchesCategory = category === 'All' || w.category === category;
    const matchesFavorite = !favoritesOnly || w.is_favorite;
    return matchesSearch && matchesCategory && matchesFavorite;
  }), [words, search, category, favoritesOnly]);

  const todayWord = words.length ? words[(new Date().getDate() + new Date().getMonth()) % words.length] : null;
  const recentWords = [...words].slice(0, 4);

  async function toggleFavorite(word) {
    try {
      const updated = await api(`/api/words/${word.id}/favorite`, { method: 'PATCH' });
      setWords(current => current.map(w => w.id === updated.id ? updated : w));
      setStats(s => ({ ...s, favorites: s.favorites + (updated.is_favorite ? 1 : -1) }));
    } catch (e) { setToast(e.message); }
  }
  async function deleteWord(word) {
    if (!window.confirm(`Delete “${word.word}” from your vocabulary?`)) return;
    try {
      await api(`/api/words/${word.id}`, { method: 'DELETE' });
      setWords(current => current.filter(w => w.id !== word.id));
      setStats(s => ({ ...s, total: s.total - 1, favorites: s.favorites - (word.is_favorite ? 1 : 0) }));
      setToast('Word removed from your vocabulary.');
    } catch (e) { setToast(e.message); }
  }
  async function addWord(form) {
    try {
      const created = await api('/api/words', { method: 'POST', body: JSON.stringify(form) });
      setWords(current => [created, ...current]);
      setStats(s => ({ ...s, total: s.total + 1 }));
      setModalOpen(false);
      setToast('New word added. Keep growing!');
    } catch (e) { throw e; }
  }

  const navItems = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'Daily words', icon: CalendarDays },
    { name: 'My vocabulary', icon: BookOpen },
    { name: 'Favorites', icon: Heart },
    { name: 'Games', icon: Gamepad2 },
    { name: 'Practice quiz', icon: GraduationCap },
    { name: 'AI sentence checker', icon: BrainCircuit },
    { name: 'Progress', icon: BarChart3 },
    { name: 'Profile & settings', icon: UserRound }
  ];

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><BookOpen size={21} strokeWidth={2.4}/></div><span>vocab<span className="brand-light">nest</span><i>.</i></span><button className="mobile-close icon-button" onClick={() => setMobileNav(false)}><X size={18}/></button></div>
      <div className="workspace-label">YOUR WORKSPACE</div>
      <nav className="main-nav">
        {navItems.map(({ name, icon: Icon }) => <button key={name} className={`nav-item ${activePage === name ? 'active' : ''}`} onClick={() => { setActivePage(name); setMobileNav(false); if (name === 'Favorites') setFavoritesOnly(true); else setFavoritesOnly(false); requestAnimationFrame(() => document.querySelector('.app-shell')?.scrollIntoView({ behavior: 'smooth', block: 'start' })); }}>
          <Icon size={18}/><span>{name}</span>{name === 'Favorites' && <span className="nav-count">{stats.favorites}</span>}
        </button>)}
      </nav>
      <div className="sidebar-divider"/>
      <div className="workspace-label">YOUR PROGRESS</div>
      <div className="sidebar-progress">
        <div className="progress-icon"><Flame size={17}/></div>
        <div><strong>Build your streak</strong><p>A little practice every day.</p></div>
      </div>
      <div className="streak-bar"><span/><span/><span/><span/><span/><span/><span/></div>
      <div className="streak-days"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>
      <div className="sidebar-bottom"><div className="avatar">V</div><div className="profile-copy"><strong>Vocabulary learner</strong><span>Personal workspace</span></div><span className="online-dot"/></div>
    </aside>

    <main className="main-area">
      <header className="topbar">
        <button className="icon-button menu-trigger" onClick={() => setMobileNav(true)}><Menu size={21}/></button>
        <div className="breadcrumb">Workspace <ChevronRight size={14}/> <strong>{activePage}</strong></div>
        <div className="topbar-right"><div className="date-chip"><Clock3 size={15}/>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div><button className="avatar avatar-small" title="Your profile">V</button></div>
      </header>

      <div className="page-content">
        {activePage === 'Overview' && <Overview stats={stats} todayWord={todayWord} recentWords={recentWords} setActivePage={setActivePage} onAdd={() => setModalOpen(true)} onFavorite={toggleFavorite} />}
        {activePage === 'My vocabulary' && <Vocabulary words={filteredWords} loading={loading} search={search} setSearch={setSearch} category={category} setCategory={setCategory} onAdd={() => setModalOpen(true)} onFavorite={toggleFavorite} onDelete={deleteWord} favoritesOnly={false} />}
        {activePage === 'Favorites' && <Vocabulary words={filteredWords} loading={loading} search={search} setSearch={setSearch} category={category} setCategory={setCategory} onAdd={() => setModalOpen(true)} onFavorite={toggleFavorite} onDelete={deleteWord} favoritesOnly />}
        {activePage === 'Practice quiz' && <Quiz words={words} index={quizIndex} setIndex={setQuizIndex} choice={quizChoice} setChoice={setQuizChoice} score={quizScore} setScore={setQuizScore} done={quizDone} setDone={setQuizDone} />}
        {['Daily words','Games','AI sentence checker','Progress','Profile & settings'].includes(activePage) && <ExtraFeatures page={activePage} words={words} stats={stats} onGo={setActivePage} onFavorite={toggleFavorite} />}
      </div>
      <footer className="footer"><span>Made for curious minds <span className="footer-heart">♥</span></span><span>One word at a time.</span></footer>
    </main>

    {modalOpen && <AddWordModal onClose={() => setModalOpen(false)} onSubmit={addWord}/>}
    {toast && <div className="toast"><span className="toast-check"><Check size={15}/></span>{toast}<button onClick={() => setToast('')}><X size={15}/></button></div>}
  </div>;
}


function App() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vocabnest_demo_user') || 'null'); } catch { return null; }
  });
  const [authView, setAuthView] = useState('');
  function enterDemo(user) {
    const safeUser = { name: user.name || user.email.split('@')[0] || 'Learner', email: user.email };
    localStorage.setItem('vocabnest_demo_user', JSON.stringify(safeUser));
    setSession(safeUser); setAuthView('');
  }
  function signOut() { localStorage.removeItem('vocabnest_demo_user'); setSession(null); }
  if (authView) return <AuthScreen mode={authView} onMode={setAuthView} onSubmit={enterDemo} onBack={() => setAuthView('')} />;
  // Keep the public landing page visible for everyone; the full learning workspace is available below it without requiring sign-in.
  return <>
    {session && <div className="session-ribbon"><span><Waves size={14}/> Signed in as {session.name} · your learning workspace is below</span><button onClick={signOut}>Sign out</button></div>}
    <LandingPage onAuth={setAuthView} onDemo={() => enterDemo({ name: 'Alex', email: 'alex@example.com' })} session={session} />
    <div id="workspace" className="public-workspace-intro"><span className="section-tag">LEARNING WORKSPACE</span><h2>Explore all learning tools</h2><p>Browse words, play games and practice freely. Sign in to keep this browser's learning session associated with your account.</p></div>
    <WorkspaceApp />
  </>;
}

function LandingPage({ onAuth, onDemo, session }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <div className="marketing-site">
    <header className="landing-nav"><a href="#home" className="landing-brand"><span className="landing-logo"><Waves size={22}/></span>VocabNest</a><button className="landing-menu" onClick={() => setMenuOpen(!menuOpen)}><Menu size={21}/></button><nav className={menuOpen ? 'nav-open' : ''}><a href="#features" onClick={() => setMenuOpen(false)}>Features</a><a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a><a href="#games" onClick={() => setMenuOpen(false)}>Games</a><a href="#workspace" onClick={() => setMenuOpen(false)}>Learning tools</a>{session ? <a className="nav-signup" href="#workspace" onClick={() => setMenuOpen(false)}>My workspace <ArrowRight size={15}/></a> : <><button className="nav-login" onClick={() => onAuth('login')}>Log in</button><button className="nav-signup" onClick={() => onAuth('signup')}>Sign up <ArrowRight size={15}/></button></>}</nav></header>
    <main>
      <section id="home" className="ocean-hero"><div className="hero-copy"><div className="hero-kicker"><span/> A calmer way to learn</div><h1>Small words.<br/><span>Big horizons.</span></h1><p>Grow your vocabulary, one thoughtful moment at a time. Learn meanings in Hindi and English, practice in playful ways, and watch your confidence grow.</p><div className="hero-actions"><button className="hero-primary" onClick={() => onAuth('signup')}>Start learning <ArrowRight size={17}/></button><a className="hero-secondary" href="#how-it-works"><PlayCircle size={17}/> See how it works</a></div><div className="hero-proof"><div className="proof-avatars"><i>A</i><i>M</i><i>R</i></div><span><strong>A little practice, every day.</strong><br/>Built for curious minds.</span></div></div><div className="hero-visual" aria-label="Illustration of a peaceful ocean and lighthouse"><div className="hero-sun"/><div className="hero-cloud cloud-a"/><div className="hero-cloud cloud-b"/><div className="hero-cliff"/><div className="hero-lighthouse"><div className="light-cap"/><div className="light-room"/><div className="light-body"/><div className="light-base"/></div><div className="hero-sail sail-a"/><div className="hero-sail sail-b"/><div className="floating-word word-float-a">serendipity ✦</div><div className="floating-word word-float-b">resilient</div><div className="wave wave-a"/><div className="wave wave-b"/><div className="wave wave-c"/></div><div className="hero-bottom-strip"><div><span className="feature-icon blue"><BookOpen size={18}/></span><span><strong>Daily words</strong><small>Curated for you</small></span></div><div><span className="feature-icon purple"><Compass size={18}/></span><span><strong>Fun practice</strong><small>Learn by playing</small></span></div><div><span className="feature-icon green"><Trophy size={18}/></span><span><strong>Track progress</strong><small>Celebrate growth</small></span></div><div><span className="feature-icon gold"><BrainCircuit size={18}/></span><span><strong>Smart feedback</strong><small>Practice with purpose</small></span></div></div></section>
      <section id="features" className="landing-section feature-section"><div className="section-intro"><span className="section-tag">YOUR LEARNING TOOLKIT</span><h2>Everything you need.<br/><span>Nothing to overwhelm you.</span></h2><p>A focused, friendly space that helps new words become part of your everyday language.</p></div><div className="feature-cards"><article className="landing-feature"><div className="tile-icon tile-blue"><BookOpen/></div><h3>Your vocabulary library</h3><p>Search, filter, save favorites, and build a personal collection of useful words.</p><span className="mini-link">Explore words <ArrowRight size={14}/></span></article><article className="landing-feature"><div className="tile-icon tile-purple"><Compass/></div><h3>Practice that sticks</h3><p>Match words, build sentences, take quick quizzes, and revisit words at the right time.</p><span className="mini-link">Make it memorable <ArrowRight size={14}/></span></article><article id="games" className="landing-feature"><div className="tile-icon tile-green"><Trophy/></div><h3>Progress you can feel</h3><p>Keep an eye on learning goals, quiz scores, activity, and your daily consistency.</p><span className="mini-link">Celebrate progress <ArrowRight size={14}/></span></article><article className="landing-feature"><div className="tile-icon tile-gold"><BrainCircuit/></div><h3>Thoughtful feedback</h3><p>Planned AI tools can help polish your sentences and suggest more natural phrasing.</p><span className="mini-link">Write with confidence <ArrowRight size={14}/></span></article></div></section>
      <section id="how-it-works" className="landing-section steps-section"><div className="section-intro"><span className="section-tag">A SIMPLE ROUTINE</span><h2>Learn a little.<br/><span>Grow a lot.</span></h2></div><div className="steps-grid"><div className="step-card"><span>01</span><div className="step-symbol"><BookOpen/></div><h3>Discover</h3><p>Meet a new word with a clear meaning in English and Hindi.</p></div><div className="step-connector">········→</div><div className="step-card"><span>02</span><div className="step-symbol lavender"><PlayCircle/></div><h3>Practice</h3><p>Use games and examples to understand how the word works.</p></div><div className="step-connector">········→</div><div className="step-card"><span>03</span><div className="step-symbol mint"><Trophy/></div><h3>Make it yours</h3><p>Save it, revise it, and see your confidence build over time.</p></div></div></section>
      <section className="landing-cta"><div className="cta-orb orb-one"/><div className="cta-orb orb-two"/><span className="section-tag">YOUR NEXT WORD IS WAITING</span><h2>Ready to find your<br/>new favorite word?</h2><p>Start with one word today. See where it takes you.</p><button className="hero-primary" onClick={() => onAuth('signup')}>Create your free account <ArrowRight size={17}/></button><small>No pressure. Just progress, one word at a time.</small></section>
    </main><footer className="landing-footer"><a href="#home" className="landing-brand"><span className="landing-logo"><Waves size={20}/></span>VocabNest</a><span>Small words. Big horizons.</span><span>Made for curious minds © 2026</span></footer>
  </div>;
}

function AuthScreen({ mode, onMode, onSubmit, onBack }) {
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState('');
  const signup = mode === 'signup';
  function submit(e) { e.preventDefault(); if (!email.includes('@')) return setError('Please enter a valid email address.'); if (password.length < 6) return setError('Use at least 6 characters for your password.'); if (signup && name.trim().length < 2) return setError('Please enter your name.'); setError(''); onSubmit({ name: signup ? name.trim() : (email.split('@')[0]), email }); }
  return <div className="auth-page"><button className="auth-back" onClick={onBack}><ChevronLeft size={17}/> Back to home</button><div className="auth-art"><div className="auth-art-content"><div className="landing-logo"><Waves size={22}/></div><span className="section-tag">SMALL WORDS, BIG HORIZONS</span><h2>Your next chapter<br/>starts with a word.</h2><p>Build a daily learning habit at your own pace.</p><div className="auth-mini-stats"><span><BookOpen/> Daily vocabulary</span><span><Trophy/> Progress tracking</span></div></div></div><div className="auth-form-side"><form className="auth-card" onSubmit={submit}><div className="auth-mark"><Waves size={23}/></div><h1>{signup ? 'Create your account' : 'Welcome back'}</h1><p>{signup ? 'Your vocabulary journey starts here.' : 'Pick up where your learning left off.'}</p>{signup && <label>Full name<input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" autoComplete="name"/></label>}<label>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"/></label><label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete={signup ? 'new-password' : 'current-password'}/></label>{error && <div className="auth-error">{error}</div>}<button className="auth-submit" type="submit">{signup ? 'Create account' : 'Log in'} <ArrowRight size={16}/></button><div className="auth-disclaimer">Demo mode: account details stay in this browser only; secure multi-user authentication is not connected yet.</div><div className="auth-switch">{signup ? 'Already have an account?' : 'New to VocabNest?'} <button type="button" onClick={() => onMode(signup ? 'login' : 'signup')}>{signup ? 'Log in' : 'Create account'}</button></div></form></div></div>;
}

function SectionHeading({ eyebrow, title, subtitle, action }) {
  return <div className="section-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{action}</div>;
}
function Overview({ stats, todayWord, recentWords, setActivePage, onAdd, onFavorite }) {
  return <>
    <SectionHeading eyebrow="YOUR LEARNING SPACE" title={<>Words open <span className="title-accent">worlds.</span></>} subtitle="A small step today. A more articulate you tomorrow." action={<button className="primary-button" onClick={onAdd}><Plus size={17}/> Add a word</button>}/>
    <div className="welcome-banner"><div className="welcome-copy"><div className="banner-pill"><Sparkles size={13}/> YOUR DAILY MOMENT</div><h2>Make room for a<br/><em>new word.</em></h2><p>Every word you learn gives you a new way to think, write, and connect.</p><button className="banner-button" onClick={() => setActivePage('Practice quiz')}>Start learning <ArrowRight size={16}/></button></div><div className="banner-art" aria-hidden="true"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-sun"/><div className="art-book"><BookOpen size={75} strokeWidth={1.15}/></div><span className="art-word word-one">grow</span><span className="art-word word-two">wonder</span><span className="art-word word-three">learn</span><span className="art-spark spark-one">✳</span><span className="art-spark spark-two">✦</span></div></div>
    <div className="stats-grid">
      <StatCard icon={<BookOpen size={18}/>} label="Words collected" value={stats.total} note="Your personal dictionary" tone="lavender"/>
      <StatCard icon={<Heart size={18}/>} label="Saved favorites" value={stats.favorites} note="Words worth keeping" tone="peach"/>
      <StatCard icon={<Sparkles size={18}/>} label="Topics explored" value={stats.categories} note="Different areas of life" tone="mint"/>
      <StatCard icon={<Flame size={18}/>} label="Learning mindset" value="On" note="Your next word awaits" tone="yellow"/>
    </div>
    <div className="dashboard-grid">
      <section className="panel daily-panel"><div className="panel-heading"><div><span className="eyebrow">A WORD TO KEEP</span><h3>Word of the day <span className="tiny-sun">✳</span></h3></div><span className="date-mini">TODAY</span></div>
        {todayWord ? <><div className="daily-word-row"><div><h2>{todayWord.word}</h2><span className="word-type">{todayWord.part_of_speech}</span></div><button className={`round-action ${todayWord.is_favorite ? 'is-favorite' : ''}`} onClick={() => onFavorite(todayWord)} aria-label="Toggle favorite"><Heart size={18} fill={todayWord.is_favorite ? 'currentColor' : 'none'}/></button></div><p className="daily-meaning">{todayWord.meaning}</p><div className="example-box"><span>IN A SENTENCE</span><p>“{todayWord.example || `Try using ${todayWord.word} in a sentence of your own.`}”</p></div><button className="text-button" onClick={() => setActivePage('My vocabulary')}>Explore your words <ArrowRight size={15}/></button></> : <EmptyState title="Your first word starts here" text="Add a word to begin building your personal dictionary."/>}
      </section>
      <section className="panel recent-panel"><div className="panel-heading"><div><span className="eyebrow">KEEP THE MOMENTUM</span><h3>Recently added</h3></div><button className="text-button" onClick={() => setActivePage('My vocabulary')}>View all <ArrowRight size={14}/></button></div>
        {recentWords.length ? <div className="recent-list">{recentWords.map((w, i) => <div className="recent-item" key={w.id}><div className={`recent-letter letter-${i % 4}`}>{w.word[0].toUpperCase()}</div><div className="recent-copy"><strong>{w.word}</strong><span>{w.meaning}</span></div><button className={`mini-heart ${w.is_favorite ? 'is-favorite' : ''}`} onClick={() => onFavorite(w)} aria-label="Toggle favorite"><Heart size={16} fill={w.is_favorite ? 'currentColor' : 'none'}/></button></div>)}</div> : <EmptyState title="Nothing here yet" text="Add your first word to see it here."/>}
        <button className="add-another" onClick={() => setActivePage('My vocabulary')}><BookOpen size={16}/> Browse your collection <ChevronRight size={16}/></button>
      </section>
    </div>
    <div className="tip-strip"><div className="tip-icon"><Lightbulb size={19}/></div><div><strong>A little learning tip</strong><p>Try writing one original sentence for every new word. Context makes vocabulary stick.</p></div><span className="tip-spark">✳</span></div>
  </>;
}
function StatCard({ icon, label, value, note, tone }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></div>;
}
function EmptyState({ title, text }) { return <div className="empty-state"><BookOpen size={25}/><strong>{title}</strong><p>{text}</p></div>; }

function Vocabulary({ words, loading, search, setSearch, category, setCategory, onAdd, onFavorite, onDelete, favoritesOnly }) {
  return <>
    <SectionHeading eyebrow={favoritesOnly ? 'YOUR PERSONAL PICKS' : 'YOUR PERSONAL DICTIONARY'} title={favoritesOnly ? <>Words to <span className="title-accent">remember.</span></> : <>Your word <span className="title-accent">collection.</span></>} subtitle={favoritesOnly ? 'The words you want to keep close.' : 'Collect, revisit, and grow your vocabulary.'} action={<button className="primary-button" onClick={onAdd}><Plus size={17}/> Add a word</button>}/>
    <div className="library-toolbar"><div className="search-field"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search words, meanings..." aria-label="Search vocabulary"/>{search && <button onClick={() => setSearch('')}><X size={15}/></button>}</div><div className="category-select"><span>Topic</span><select value={category} onChange={e => setCategory(e.target.value)}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div><span className="results-count">{words.length} {words.length === 1 ? 'word' : 'words'}</span></div>
    {loading ? <div className="loading-state">Loading your words…</div> : words.length ? <div className="word-grid">{words.map(w => <article className="word-card" key={w.id}><div className="word-card-top"><span className="word-category">{w.category}</span><div className="word-card-actions"><button className={`mini-heart ${w.is_favorite ? 'is-favorite' : ''}`} onClick={() => onFavorite(w)} aria-label="Toggle favorite"><Heart size={16} fill={w.is_favorite ? 'currentColor' : 'none'}/></button><button className="mini-delete" onClick={() => onDelete(w)} aria-label="Delete word"><Trash2 size={15}/></button></div></div><h3>{w.word}</h3><span className="word-type">{w.part_of_speech}</span><p className="word-card-meaning">{w.meaning}</p>{w.example && <div className="word-card-example">“{w.example}”</div>}</article>)}</div> : <div className="empty-library"><div className="empty-illustration"><Search size={27}/></div><h3>No words found</h3><p>Try a different search or add a new word to your collection.</p><button className="primary-button" onClick={onAdd}><Plus size={16}/> Add a word</button></div>}
  </>;
}

function Quiz({ words, index, setIndex, choice, setChoice, score, setScore, done, setDone }) {
  const usable = words.length >= 4 ? words : [];
  const current = usable[index % Math.max(usable.length, 1)];
  const options = useMemo(() => {
    if (!current || !usable.length) return [];
    const wrong = usable.filter(w => w.id !== current.id).slice(0, 3);
    return [current, ...wrong].sort((a, b) => ((a.id * 13 + index * 7) % 19) - ((b.id * 13 + index * 7) % 19));
  }, [current?.id, index, words.length]);
  function choose(option) {
    if (choice) return;
    setChoice(option.id);
    if (option.id === current.id) setScore(s => s + 1);
  }
  function next() {
    if (index >= 4) setDone(true);
    else { setIndex(i => i + 1); setChoice(null); }
  }
  function restart() { setIndex(0); setChoice(null); setScore(0); setDone(false); }
  return <>
    <SectionHeading eyebrow="PRACTICE MAKES PROGRESS" title={<>Put your words <span className="title-accent">to work.</span></>} subtitle="A quick check-in to help new vocabulary stick."/>
    {usable.length < 4 ? <div className="quiz-card quiz-empty"><div className="quiz-icon"><CircleHelp size={27}/></div><h2>Let’s build your quiz first.</h2><p>Add at least four words to your collection to start practicing.</p></div> : done ? <div className="quiz-card quiz-result"><div className="quiz-icon"><GraduationCap size={29}/></div><span className="eyebrow">ROUND COMPLETE</span><h2>You showed up. That counts.</h2><div className="score-number">{score}<span>/5</span></div><p>{score >= 4 ? 'Fantastic work — your vocabulary is taking root.' : 'Nice practice. Revisit your words and give it another go.'}</p><button className="primary-button" onClick={restart}><RotateCcw size={16}/> Try again</button></div> : <div className="quiz-card"><div className="quiz-topline"><span className="quiz-tag"><Sparkles size={14}/> QUICK QUIZ</span><span>QUESTION {index + 1} <span className="muted">/ 5</span></span></div><div className="quiz-progress"><span style={{ width: `${((index + 1) / 5) * 100}%` }}/></div><div className="quiz-question"><span className="eyebrow">CHOOSE THE RIGHT MEANING</span><h2>What does <em>{current.word}</em> mean?</h2><span className="word-type">{current.part_of_speech}</span></div><div className="quiz-options">{options.map(option => <button key={option.id} onClick={() => choose(option)} className={`quiz-option ${choice === option.id ? (option.id === current.id ? 'correct' : 'incorrect') : ''} ${choice && option.id === current.id ? 'show-correct' : ''}`}><span className="option-letter">{String.fromCharCode(65 + options.indexOf(option))}</span><span>{option.meaning}</span>{choice && option.id === current.id && <Check size={17}/>}</button>)}</div>{choice && <div className={`answer-feedback ${choice === current.id ? 'feedback-good' : 'feedback-bad'}`}>{choice === current.id ? 'That’s right! Nicely done.' : `Not quite — ${current.word} means: ${current.meaning}`}</div>}<div className="quiz-footer"><span>{score} correct so far</span><button className="primary-button" disabled={!choice} onClick={next}>{index === 4 ? 'See results' : 'Next question'} <ArrowRight size={16}/></button></div></div>}
  </>;
}


function ExtraFeatures({ page, words, stats, onGo, onFavorite }) {
  const [game, setGame] = useState('Word Match');
  const [picked, setPicked] = useState('');
  const [sentence, setSentence] = useState('');
  const [feedback, setFeedback] = useState('');
  const [goal, setGoal] = useState('5');
  const [language, setLanguage] = useState('English + Hindi');
  const [level, setLevel] = useState('Mixed');
  const [round, setRound] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const daily = words.length ? words[(new Date().getDate() + new Date().getMonth()) % words.length] : null;
  const word = words.length ? words[round % words.length] : null;
  const randomChoices = words.slice(0,4);
  if (page === 'Daily words') return <div className="extra-page"><SectionHeading eyebrow="A FRESH START" title="Today's words" subtitle="A small set of useful words to learn at your own pace." action={<button className="primary-button" onClick={() => onGo('My vocabulary')}>Open library <ArrowRight size={16}/></button>}/><div className="extra-word-grid">{(words.length ? words.slice(0,6) : []).map((w,i)=><article className="extra-word-card" key={w.id}><div className="extra-word-top"><span className={`word-icon tone-${i%4}`}><BookOpen size={20}/></span><button className={`icon-button ${w.is_favorite?'is-favorite':''}`} onClick={()=>onFavorite(w)} aria-label="Favorite word"><Heart size={18} fill={w.is_favorite?'currentColor':'none'}/></button></div><span className="word-level">{w.difficulty || (i%2?'Intermediate':'Beginner')}</span><h3>{w.word}</h3><p>{w.meaning}</p><small>{w.example}</small><button className="text-action" onClick={()=>{setRound(i);setRevealed(!revealed)}}>{revealed && round===i ? 'Hide practice' : 'Practice this word'} <ArrowRight size={14}/></button>{revealed&&round===i&&<div className="inline-tip">Try using <b>{w.word}</b> in a sentence of your own.</div>}</article>)}</div></div>;
  if (page === 'Games') return <div className="extra-page"><SectionHeading eyebrow="PLAY TO REMEMBER" title="Games & practice" subtitle="Quick, low-pressure activities to help words stick."/><div className="game-tabs">{['Word Match','Sentence Builder','Guess the Word'].map((g,i)=><button className={game===g?'selected':''} key={g} onClick={()=>{setGame(g);setPicked('');setFeedback('')}}><span>{[<Gamepad2/>,<BookOpen/>,<CircleHelp/>][i]}</span>{g}<small>{['Match meaning','Build a sentence','Choose the word'][i]}</small></button>)}</div><div className="game-board"><div className="game-board-head"><span className="section-tag">ROUND {round+1}</span><span className="word-level">Practice mode</span></div>{!word?<EmptyState title="Add some words to play" text="Your games use words from your vocabulary library."/>:game==='Word Match'?<><h2>Which word means “{word.meaning}”?</h2><div className="game-options">{(randomChoices.length?randomChoices:[word]).map(w=><button key={w.id} className={picked===w.word?'picked':''} onClick={()=>{setPicked(w.word);setFeedback(w.word===word.word?'Correct! Great match.':`Not quite — the answer is ${word.word}.`)}}>{w.word}</button>)}</div></>:game==='Sentence Builder'?<><h2>Make a sentence with <span>{word.word}</span></h2><p className="muted">Meaning: {word.meaning}</p><textarea value={sentence} onChange={e=>setSentence(e.target.value)} placeholder={`Write a sentence using “${word.word}”…`}/><button className="primary-button" onClick={()=>setFeedback(sentence.toLowerCase().includes(word.word.toLowerCase())?'Nice! You used the target word. Read it aloud to practice.':'Try including the word “'+word.word+'” in your sentence.')}>Check sentence <Check size={16}/></button></>:<><h2>“{word.example || word.meaning}”</h2><p>Choose the vocabulary word that best fits this meaning.</p><div className="game-options">{randomChoices.map(w=><button key={w.id} className={picked===w.word?'picked':''} onClick={()=>{setPicked(w.word);setFeedback(w.word===word.word?'Correct answer!':'Keep going — try again or review the meaning.')}}>{w.word}</button>)}</div></>}{feedback&&<div className="feedback-box">{feedback}</div>}<button className="secondary-button" onClick={()=>{setRound(r=>r+1);setPicked('');setFeedback('');setSentence('')}}><RotateCcw size={15}/> Next round</button></div></div>;
  if (page === 'AI sentence checker') return <div className="extra-page"><SectionHeading eyebrow="WRITE WITH CONFIDENCE" title="Sentence checker" subtitle="Practice using vocabulary naturally. This starter version gives local, rule-based tips; AI API integration can be added later."/><div className="checker-card"><div className="checker-icon"><Sparkles size={22}/></div><label htmlFor="sentence-input">Your English sentence</label><textarea id="sentence-input" value={sentence} onChange={e=>{setSentence(e.target.value);setFeedback('')}} placeholder="Example: I was resilient even when the task was difficult."/><div className="checker-footer"><span>{sentence.length}/500 characters</span><button className="primary-button" disabled={!sentence.trim()} onClick={()=>{const lower=sentence.toLowerCase();const found=words.find(w=>lower.includes(w.word.toLowerCase()));setFeedback(found?`Good practice! You used “${found.word}”. Meaning: ${found.meaning}. Read your sentence aloud and check that the word fits the context.`: 'Tip: add one of the words from your vocabulary library, then check that the meaning fits the sentence. This demo does not call an AI service yet.')}}>Check sentence <ArrowRight size={15}/></button></div>{feedback&&<div className="feedback-box"><CheckCircle2 size={18}/><span>{feedback}</span></div>}</div></div>;
  if (page === 'Progress') return <div className="extra-page"><SectionHeading eyebrow="YOUR LEARNING JOURNEY" title="Progress & consistency" subtitle="A simple snapshot of your practice. Full account-based history requires authentication and persistent progress tracking."/><div className="progress-stat-grid"><div><Flame/><strong>1 day</strong><span>Current streak demo</span></div><div><BookOpen/><strong>{stats.total||words.length}</strong><span>Words in library</span></div><div><Heart/><strong>{stats.favorites||0}</strong><span>Favorite words</span></div><div><Target/><strong>0%</strong><span>Quiz accuracy recorded</span></div></div><div className="activity-card"><h3>This week's learning rhythm</h3><div className="activity-bars">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i)=><div key={d}><span style={{height:[32,55,42,72,48,25,60][i]+'px'}}/><small>{d}</small></div>)}</div><p className="muted">Tip: set a small daily goal and return for a few minutes each day.</p></div></div>;
  return <div className="extra-page"><SectionHeading eyebrow="MAKE IT YOURS" title="Profile & settings" subtitle="Adjust your learning preferences for a calmer, more personal experience."/><div className="settings-card"><div className="profile-avatar"><UserRound size={28}/></div><div><h3>Your learner profile</h3><p className="muted">Demo profile stored in this browser.</p></div><label>Preferred explanation<select value={language} onChange={e=>setLanguage(e.target.value)}><option>English + Hindi</option><option>English only</option><option>Hindi + English (more Hindi)</option></select></label><label>Daily word goal<select value={goal} onChange={e=>setGoal(e.target.value)}>{['3','5','10','15'].map(n=><option value={n} key={n}>{n} words per day</option>)}</select></label><label>Difficulty level<select value={level} onChange={e=>setLevel(e.target.value)}><option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Mixed</option></select></label><button className="primary-button" onClick={()=>setFeedback(`Preferences saved for this session: ${language}, ${goal} words/day, ${level} level.`)}>Save preferences <Check size={16}/></button>{feedback&&<div className="feedback-box">{feedback}</div>}</div></div>;
}

function AddWordModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ word: '', meaning: '', example: '', part_of_speech: 'Noun', category: 'General' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  function update(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); setError(''); }
  async function submit(e) {
    e.preventDefault(); setSaving(true);
    try { await onSubmit(form); }
    catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><span className="eyebrow">GROW YOUR VOCABULARY</span><h2 id="modal-title">Add a new word</h2><p>Every great vocabulary starts with one.</p></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19}/></button></div><form onSubmit={submit}><label>Word <span>*</span><input name="word" value={form.word} onChange={update} placeholder="e.g. Mellifluous" required maxLength="80" autoFocus/></label><label>Meaning <span>*</span><textarea name="meaning" value={form.meaning} onChange={update} placeholder="What does this word mean?" rows="3" required maxLength="500"/></label><label>Example sentence<input name="example" value={form.example} onChange={update} placeholder="Use it in a sentence..." maxLength="500"/></label><div className="form-row"><label>Part of speech<select name="part_of_speech" value={form.part_of_speech} onChange={update}>{POSITIONS.map(p => <option key={p}>{p}</option>)}</select></label><label>Topic<select name="category" value={form.category} onChange={update}>{CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}</select></label></div>{error && <div className="form-error">{error}</div>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? 'Saving…' : <><Plus size={16}/> Save word</>}</button></div></form></div></div>;
}

export default App;