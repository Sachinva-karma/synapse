import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, ChevronDown, Check, ExternalLink, Zap, Box, Shield, Play } from 'lucide-react';

/* ═══════════════════════════════════════════════════
   ANIMATED NEURAL GRID — The Centerpiece
   Canvas-based particle system with connecting lines
   ═══════════════════════════════════════════════════ */
const NeuralGrid = () => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    const particles = [];
    const PARTICLE_COUNT = 80;
    const CONNECTION_DIST = 120;
    const MOUSE_RADIUS = 200;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = canvas.width = rect.width * window.devicePixelRatio;
      height = canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    // Init particles
    const w = canvas.parentElement.getBoundingClientRect().width;
    const h = canvas.parentElement.getBoundingClientRect().height;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const animate = () => {
      const rw = canvas.parentElement.getBoundingClientRect().width;
      const rh = canvas.parentElement.getBoundingClientRect().height;
      ctx.clearRect(0, 0, rw, rh);

      // Update & draw particles
      particles.forEach((p, i) => {
        p.pulse += 0.02;
        p.x += p.vx;
        p.y += p.vy;

        // Bounce
        if (p.x < 0 || p.x > rw) p.vx *= -1;
        if (p.y < 0 || p.y > rh) p.vy *= -1;

        // Mouse repulsion
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.02;
          p.vx += dx * force;
          p.vy += dy * force;
        }

        // Damping
        p.vx *= 0.99;
        p.vy *= 0.99;

        const alpha = 0.3 + Math.sin(p.pulse) * 0.15;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,0,0,${alpha})`;
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const cdx = p.x - p2.x;
          const cdy = p.y - p2.y;
          const cd = Math.sqrt(cdx * cdx + cdy * cdy);
          if (cd < CONNECTION_DIST) {
            const lineAlpha = (1 - cd / CONNECTION_DIST) * 0.08;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0,0,0,${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleMouseMove = useCallback((e) => {
    const rect = canvasRef.current?.parentElement?.getBoundingClientRect();
    if (rect) {
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -1000, y: -1000 };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
};

/* ═══════════════════════════════════
   SCROLL REVEAL HOOK
   ═══════════════════════════════════ */
const useScrollReveal = (options = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.15, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
};

/* ═══════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════ */
const AnimatedCounter = ({ end, suffix = '', prefix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [ref, isVisible] = useScrollReveal();

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, end, duration]);

  return <span ref={ref}>{prefix}{count}{suffix}</span>;
};

/* ═══════════════════════════════════
   CROSSHAIR FRAME
   ═══════════════════════════════════ */
const CrosshairFrame = ({ children, className = "" }) => (
  <div className={`relative ${className}`}>
    <Plus className="absolute -top-2.5 -left-2.5 text-black/15 w-5 h-5 pointer-events-none z-10" strokeWidth={1} />
    <Plus className="absolute -top-2.5 -right-2.5 text-black/15 w-5 h-5 pointer-events-none z-10" strokeWidth={1} />
    <Plus className="absolute -bottom-2.5 -left-2.5 text-black/15 w-5 h-5 pointer-events-none z-10" strokeWidth={1} />
    <Plus className="absolute -bottom-2.5 -right-2.5 text-black/15 w-5 h-5 pointer-events-none z-10" strokeWidth={1} />
    {children}
  </div>
);

/* ═══════════════════════════════════
   FAQ ACCORDION
   ═══════════════════════════════════ */
const FAQItem = ({ question, answer, index }) => {
  const [open, setOpen] = useState(false);
  const [ref, isVisible] = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`border-b border-black/10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-6 text-left group">
        <span className="text-base font-medium text-black pr-8 group-hover:text-black/70 transition-colors">{question}</span>
        <ChevronDown className={`w-5 h-5 text-black/40 transition-transform duration-300 flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-500 ${open ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="text-black/50 text-[15px] leading-relaxed -mt-2">{answer}</p>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════════════ */
const LandingPage = () => {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setHeroLoaded(true));
  }, []);

  // Scroll reveal hooks for each section
  const [trustRef, trustVisible] = useScrollReveal();
  const [intersectionRef, intersectionVisible] = useScrollReveal();
  const [featuresRef, featuresVisible] = useScrollReveal();
  const [ecosystemRef, ecosystemVisible] = useScrollReveal();
  const [tiersRef, tiersVisible] = useScrollReveal();
  const [testimonialsRef, testimonialsVisible] = useScrollReveal();
  const [ctaRef, ctaVisible] = useScrollReveal();

  const testimonials = [
    { company: "Simplify Digital Co", desc: "Bypassed manual invoicing friction for a global supply chain firm by deploying an event-driven middleware orchestration layer that cuts processing time from 48 hours to 11 minutes.", person: "Kevin McCallister", role: "Chief Operating Officer", quote: "\"Our manual data entry pipelines were completely strangling our margins and causing massive shipping delays at international customs checkpoints. Synapse OS bypassed the standard AI market fluff and engineered a robust, infrastructure-level solution. The autonomous pipeline completely transformed our unit economics, slashed our processing timelines from days to minutes, and allowed our business to scale throughput without forcing us to scale our human operational headcount.\"" },
    { company: "CoreTech Systems", desc: "Engineered a stateful conversational AI agent trained on proprietary banking databases to autonomously resolve Tier-1 helpdesk tickets without regulatory breaches.", person: "Cata Giraldo", role: "VP of Engineering", quote: "\"Synapse OS didn't just plug in a chatbot — they built an intelligent, stateful system that understands banking context, regulatory boundaries, and escalation triggers. Our Tier-1 resolution rate jumped from 40% to 92% within the first month of deployment.\"" },
    { company: "Velosite", desc: "Engineered a predictive AI middleware pipeline that analyzes real-time product telemetry to autonomously trigger personalized onboarding interventions.", person: "Aman Patel", role: "Director of Customer Success", quote: "\"Before this deployment, our CS team was constantly putting out fires. Synapse OS built an intelligent infrastructure that actually predicts user friction in real-time. It completely automated our health scoring and allowed our team to focus purely on high-level strategy. Our retention metrics transformed entirely.\"" }
  ];

  const faqs = [
    { q: "Is our company data safe from public AI models?", a: "Yes. We use zero-retention APIs and deploy entirely within your private cloud. Your data is ring-fenced and never trains public models." },
    { q: "Does this integrate with our legacy software?", a: "Yes. We build custom middleware for any system with an API. For closed legacy software, we deploy secure RPA to bridge the gap." },
    { q: "How fast is the deployment timeline?", a: "Audits take 7 days. Internal workflow automations deploy in 3 to 4 weeks. Customer-facing agents launch in 6 to 8 weeks after rigorous hallucination testing." },
    { q: "Will this replace our human workforce?", a: "No. Our systems resolve 80% of repetitive Tier-1 tasks automatically. High-stakes edge cases are instantly routed to your human staff with full context." },
    { q: "Who owns the code and intellectual property?", a: "You own 100% of the IP upon completion. We offer ongoing SLAs to monitor API stability and update the underlying language models." }
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-black overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── GLOBAL KEYFRAMES ── */}
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideLeft { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(0,0,0,0.05); } 50% { box-shadow: 0 0 0 20px rgba(0,0,0,0); } }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes dashDraw { to { stroke-dashoffset: 0; } }
        .reveal { opacity: 0; transform: translateY(30px); transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .stagger-1 { transition-delay: 100ms; }
        .stagger-2 { transition-delay: 200ms; }
        .stagger-3 { transition-delay: 300ms; }
        .stagger-4 { transition-delay: 400ms; }
        .card-hover { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08); }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center h-[70px] backdrop-blur-xl bg-[#f5f5f5]/80 border-b border-black/[0.04]"
        style={{ animation: heroLoaded ? 'fadeIn 0.6s ease-out' : 'none' }}
      >
        <div className="flex items-center justify-between w-full max-w-[1000px] px-7 relative">
          <button onClick={() => navigate('/about')} className="text-sm font-medium text-black/40 hover:text-black transition-colors duration-300">[About]</button>
          <div onClick={() => navigate('/')} className="cursor-pointer absolute left-1/2 -translate-x-1/2 hover:scale-110 transition-transform duration-300">
            <div className="flex flex-wrap w-[22px] h-[22px] gap-0">
              <div className="w-[10px] h-[10px] bg-black rounded-[1px]"></div>
              <div className="w-[10px] h-[10px] bg-black rounded-[1px] ml-[2px]"></div>
              <div className="w-[10px] h-[10px] bg-black rounded-[1px] mt-[2px]"></div>
              <div className="w-[10px] h-[10px] bg-black/20 rounded-[1px] ml-[2px] mt-[2px]"></div>
            </div>
          </div>
          <button className="text-sm font-medium text-black/40 hover:text-black transition-colors duration-300">[Pricing]</button>
        </div>
      </nav>

      {/* ═══════════════════════════════════════
         HERO — with Neural Grid centerpiece
         ═══════════════════════════════════════ */}
      <section className="pt-[120px] pb-8 px-6">
        <div className="max-w-[1180px] mx-auto">
          <CrosshairFrame className="border border-dashed border-black/10 rounded-2xl overflow-hidden relative">
            {/* The Neural Grid Centerpiece */}
            <div className="absolute inset-0">
              <NeuralGrid />
            </div>

            {/* Content over the grid */}
            <div className="relative z-10 py-24 md:py-36 px-8 md:px-16 flex flex-col items-center text-center">
              {/* Badge */}
              <div
                className="mb-8 inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-black/10 bg-white/80 backdrop-blur-md text-[11px] font-semibold tracking-[0.15em] uppercase text-black/60 shadow-sm"
                style={{ animation: heroLoaded ? 'fadeUp 0.8s ease-out 0.2s both' : 'none' }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Synapse OS Engine v2.0
              </div>

              {/* Heading */}
              <h1
                className="text-[52px] md:text-[80px] lg:text-[100px] leading-[0.92] tracking-[-0.04em] font-medium mb-8"
                style={{ animation: heroLoaded ? 'fadeUp 1s ease-out 0.4s both' : 'none' }}
              >
                The all new{' '}
                <span className="italic block md:inline" style={{ fontFamily: "'Instrument Serif', serif" }}>AI Era</span>
              </h1>

              {/* Subtext */}
              <p
                className="text-[15px] md:text-base text-black/45 max-w-md mx-auto mb-12 leading-relaxed"
                style={{ animation: heroLoaded ? 'fadeUp 1s ease-out 0.6s both' : 'none' }}
              >
                Deploy autonomous AI agents to orchestrate tenancy sync, data abstraction, and neural rosters.
              </p>

              {/* Buttons */}
              <div
                className="flex items-center gap-4"
                style={{ animation: heroLoaded ? 'fadeUp 1s ease-out 0.8s both' : 'none' }}
              >
                <button
                  onClick={() => navigate('/app/orchestration')}
                  className="group flex items-center gap-2 bg-black text-white px-7 py-3.5 rounded-full text-sm font-medium hover:bg-black/85 transition-all duration-300 hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.3)] hover:-translate-y-0.5"
                >
                  Execute Workflow
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 border border-black/12 bg-white/60 backdrop-blur-md text-black px-7 py-3.5 rounded-full text-sm font-medium hover:bg-white transition-all duration-300 hover:-translate-y-0.5"
                >
                  Start now
                </button>
              </div>
            </div>
          </CrosshairFrame>
        </div>
      </section>

      {/* ═══════════════════════════════════════
         TRUSTED BY — Infinite marquee
         ═══════════════════════════════════════ */}
      <section ref={trustRef} className={`py-14 px-6 transition-all duration-1000 ${trustVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-[1180px] mx-auto">
          <p className="text-center text-[10px] font-bold tracking-[0.25em] uppercase text-black/30 mb-10">Trusted by people at</p>
          <div className="overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#f5f5f5] to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#f5f5f5] to-transparent z-10 pointer-events-none"></div>
            <div className="flex items-center gap-16 whitespace-nowrap" style={{ animation: 'marquee 30s linear infinite' }}>
              {[...Array(2)].map((_, loop) => (
                <React.Fragment key={loop}>
                  {['Openly AI', 'Stries', 'I Combinator', 'Radial', 'Vercex', 'Votion', 'Search App'].map((name, i) => (
                    <span key={`${loop}-${i}`} className="text-xl font-bold tracking-tight text-black/15 px-8 select-none">{name}</span>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
         STATS BAR
         ═══════════════════════════════════════ */}
      <section className="py-16 px-6">
        <div className="max-w-[1180px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: 48, suffix: 'h→11m', label: 'Processing Time Cut' },
            { value: 92, suffix: '%', label: 'Tier-1 Auto-Resolution' },
            { value: 100, suffix: '%', label: 'IP Ownership' },
            { value: 80, suffix: '%', label: 'Task Automation Rate' }
          ].map((stat, i) => {
            const [ref, vis] = useScrollReveal();
            return (
              <div key={i} ref={ref} className={`text-center transition-all duration-700 ${vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="text-[40px] md:text-[52px] font-bold tracking-tighter leading-none mb-2">
                  {i === 0 ? '48h→11m' : <AnimatedCounter end={stat.value} suffix={stat.suffix} />}
                </div>
                <p className="text-xs text-black/40 font-medium tracking-wide uppercase">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════
         THE HUMAN-AI INTERSECTION
         ═══════════════════════════════════════ */}
      <section ref={intersectionRef} className="py-32 px-6 overflow-hidden">
        <div className={`max-w-[1180px] mx-auto text-center transition-all duration-1000 ${intersectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-[40px] md:text-[60px] leading-[1] tracking-[-0.03em] mb-6">
            <span className="italic" style={{ fontFamily: "'Instrument Serif', serif" }}>The Human-AI Intersection.</span>
          </h2>
          <p className="text-base text-black/45 max-w-xl mx-auto mb-16 leading-relaxed">
            Unifying human enterprise and autonomous data pipelines to scale your company's throughput instantly.
          </p>

          {/* Central Interactive Art Piece */}
          <div className="relative w-full aspect-square md:aspect-[21/9] max-h-[600px] flex items-center justify-center mt-12 group cursor-crosshair">
            {/* The outer glowing ring */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-[3rem] blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" style={{ animation: 'gradientShift 8s ease infinite' }}></div>
            
            <CrosshairFrame className="w-full h-full border border-dashed border-black/15 rounded-[2.5rem] overflow-hidden bg-white/40 backdrop-blur-2xl shadow-2xl relative transition-all duration-700 group-hover:border-black/30 group-hover:bg-white/60">
              
              {/* Dynamic particle grid in the background */}
              <div className="absolute inset-0 opacity-50 group-hover:opacity-100 transition-opacity duration-700">
                 <NeuralGrid />
              </div>

              {/* Central Floating Orb/Core */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center" style={{ animation: 'float 5s ease-in-out infinite' }}>
                  
                  {/* Glowing Core */}
                  <div className="absolute inset-0 bg-black rounded-full shadow-[0_0_80px_rgba(0,0,0,0.2)] group-hover:shadow-[0_0_120px_rgba(0,0,0,0.3)] transition-shadow duration-700"></div>
                  
                  {/* Spinning wireframe rings */}
                  <div className="absolute -inset-4 border border-black/20 rounded-full group-hover:border-black/40 transition-colors duration-700 border-dashed" style={{ animation: 'spin 20s linear infinite' }}></div>
                  <div className="absolute -inset-8 border border-black/10 rounded-full group-hover:border-black/30 transition-colors duration-700 border-dotted" style={{ animation: 'spin 30s linear infinite reverse' }}></div>
                  
                  {/* Inner text */}
                  <div className="relative z-10 flex flex-col items-center justify-center text-white text-center">
                    <Zap size={32} strokeWidth={1.5} className="mb-2 text-white/80 group-hover:text-white transition-colors duration-500" />
                    <span className="font-serif italic text-3xl md:text-4xl tracking-tighter" style={{ fontFamily: "'Instrument Serif', serif" }}>Synapse</span>
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 mt-1">Core Active</span>
                  </div>

                </div>
              </div>

              {/* Floating Data Modules (simulating UI elements) */}
              <div className="absolute top-8 left-8 p-4 rounded-xl border border-black/5 bg-white/60 backdrop-blur-md shadow-lg transform -rotate-2 group-hover:rotate-0 group-hover:scale-105 transition-all duration-500" style={{ animation: 'float 6s ease-in-out infinite 1s' }}>
                <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-black/40 mb-1">Incoming Nodes</div>
                <div className="text-xl font-bold tracking-tight">14,293<span className="text-emerald-500 ml-1">↑</span></div>
              </div>

              <div className="absolute bottom-8 right-8 p-4 rounded-xl border border-black/5 bg-white/60 backdrop-blur-md shadow-lg transform rotate-2 group-hover:rotate-0 group-hover:scale-105 transition-all duration-500" style={{ animation: 'float 7s ease-in-out infinite 2s' }}>
                <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-black/40 mb-1">Latency</div>
                <div className="text-xl font-bold tracking-tight">1.2ms<span className="text-blue-500 ml-1">~</span></div>
              </div>

            </CrosshairFrame>
          </div>
        </div>
        
        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </section>

      {/* ═══════════════════════════════════════
         FEATURES
         ═══════════════════════════════════════ */}
      <section ref={featuresRef} className="py-28 px-6">
        <div className="max-w-[1180px] mx-auto">
          <div className={`text-center mb-20 transition-all duration-1000 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black text-white text-[11px] font-bold tracking-[0.15em] uppercase mb-8 shadow-lg" style={{ animation: 'pulseGlow 3s ease-in-out infinite' }}>
              Features
            </div>
            <h2 className="text-[40px] md:text-[60px] leading-[1] tracking-[-0.03em] mb-6">
              <span className="italic" style={{ fontFamily: "'Instrument Serif', serif" }}>Engineered Core Capabilities.</span>
            </h2>
            <p className="text-base text-black/45 max-w-xl mx-auto leading-relaxed">
              From isolated language model agents to private, secure database environments—we architect the structural foundation of your automated enterprise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: <Zap className="w-5 h-5" />, title: "Tenancy Sync Agents", desc: "Automate lease agreements, sync tenancy statuses, and handle multi-branch auditing autonomously." },
              { icon: <Box className="w-5 h-5" />, title: "Data Abstraction", desc: "Abstract legacy property databases into a unified neural roster for real-time operations." },
              { icon: <Shield className="w-5 h-5" />, title: "Secure Enterprise Data", desc: "Query proprietary documents through private, zero-retention infrastructure using RAG architecture." },
              { icon: <Play className="w-5 h-5" />, title: "Lease Management Automation", desc: "Orchestrate lease updates, manage units, and track move-in/move-out workflows entirely on autopilot." }
            ].map((f, i) => {
              const [ref, vis] = useScrollReveal();
              return (
                <div ref={ref} key={i} className={`transition-all duration-700 ${vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${i * 120}ms` }}>
                  <CrosshairFrame className="card-hover border border-dashed border-black/8 rounded-2xl p-10 md:p-12 bg-white/50 backdrop-blur-sm group cursor-default h-full">
                    <div className="w-12 h-12 rounded-2xl bg-black/[0.04] flex items-center justify-center mb-8 text-black/60 group-hover:bg-black group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                      {f.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:translate-x-1 transition-transform duration-300">{f.title}</h3>
                    <p className="text-sm text-black/45 leading-relaxed">{f.desc}</p>
                  </CrosshairFrame>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
         SERVICE TIERS
         ═══════════════════════════════════════ */}
      <section ref={tiersRef} className="py-28 px-6">
        <div className="max-w-[1180px] mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${tiersVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black text-white text-[11px] font-bold tracking-[0.15em] uppercase mb-8 shadow-lg">
              Service Tiers
            </div>
            <h2 className="text-[32px] md:text-[48px] leading-[1.05] tracking-[-0.02em] mb-4">
              Clear execution phases.
            </h2>
            <p className="text-sm text-black/45 max-w-xl mx-auto leading-relaxed">
              Designed to audit, build, and continuously optimize your custom intelligence assets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { tier: "Tier 1", name: "Starter Automations", desc: "Map out and deploy foundational data syncing and tenancy pipelines.", price: "$1,000", period: "", items: ["Review of your current manual tasks", "Identify the highest-ROI AI opportunities", "Complete data privacy and security check", "Step-by-step custom implementation plan"], featured: false },
              { tier: "Tier 2", name: "Neural Roster Orchestration", desc: "Deploy multi-agent swarms that integrate with n8n and existing CRM data.", price: "$5,000", period: "", items: ["Custom AI agent and chatbot development", "Connecting your existing software tools", "Secure setup using your private company data", "Complete team training and system handover"], featured: true },
              { tier: "Tier 3", name: "Enterprise Abstraction", desc: "Dedicated system dispatchers, private compute nodes, and full neural abstraction.", price: "$3,500", period: "/mo", items: ["Dedicated system dispatchers", "Private compute infrastructure", "Full neural data abstraction", "24/7 monitoring and SLA"], featured: false }
            ].map((t, i) => {
              const [ref, vis] = useScrollReveal();
              return (
                <div ref={ref} key={i} className={`transition-all duration-700 ${vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${i * 150}ms` }}>
                  <div className={`card-hover rounded-2xl border p-8 md:p-10 flex flex-col h-full ${t.featured ? 'border-black bg-black text-white shadow-2xl shadow-black/20 scale-[1.02]' : 'border-black/10 bg-white'}`}>
                    <div className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-5 ${t.featured ? 'text-white/40' : 'text-black/30'}`}>{t.tier}</div>
                    <h3 className="text-xl font-bold mb-2">{t.name}</h3>
                    <p className={`text-sm mb-8 leading-relaxed ${t.featured ? 'text-white/50' : 'text-black/45'}`}>{t.desc}</p>
                    <div className="flex items-baseline gap-1 mb-8">
                      <span className="text-[40px] font-bold tracking-tighter">{t.price}</span>
                      {t.period && <span className={`text-sm ${t.featured ? 'text-white/40' : 'text-black/35'}`}>{t.period}</span>}
                    </div>
                    <button className={`w-full py-3.5 rounded-full text-sm font-semibold mb-8 transition-all duration-300 hover:-translate-y-0.5 ${t.featured ? 'bg-white text-black hover:bg-white/90 hover:shadow-lg' : 'bg-black text-white hover:bg-black/85 hover:shadow-lg'}`}>
                      Book now
                    </button>
                    <div className="space-y-3.5 mt-auto">
                      {t.items.map((item, j) => (
                        <div key={j} className="flex items-start gap-3">
                          <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${t.featured ? 'text-white/40' : 'text-black/25'}`} />
                          <span className={`text-[13px] ${t.featured ? 'text-white/60' : 'text-black/50'}`}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
         TESTIMONIALS
         ═══════════════════════════════════════ */}
      <section ref={testimonialsRef} className="py-28 px-6">
        <div className={`max-w-[1180px] mx-auto transition-all duration-1000 ${testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="mb-12">
            <h2 className="text-[32px] md:text-[48px] leading-[1.05] tracking-[-0.02em] mb-4">
              <span className="italic" style={{ fontFamily: "'Instrument Serif', serif" }}>Proven Deployment Outcomes</span>
            </h2>
            <p className="text-sm text-black/45 max-w-xl leading-relaxed">
              Below is the exact operational impact and ROI our custom automation pipelines have delivered across enterprise infrastructures.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
            <div className="flex flex-col gap-3">
              {testimonials.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`text-left rounded-2xl border p-6 transition-all duration-500 ${activeTestimonial === i ? 'border-black/15 bg-white shadow-md scale-[1.02]' : 'border-transparent bg-transparent hover:bg-white/60'}`}
                >
                  <h4 className="font-bold text-sm mb-1">{t.company}</h4>
                  <p className="text-[12px] text-black/35 leading-relaxed line-clamp-2">{t.desc}</p>
                  <div className="mt-3 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-black/10 to-black/5"></div>
                    <div>
                      <p className="text-[11px] font-semibold">{t.person}</p>
                      <p className="text-[10px] text-black/35">{t.role}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-10 md:p-14 flex flex-col justify-between relative overflow-hidden shadow-sm">
              <div className="absolute -top-8 -right-4 text-[220px] italic text-black/[0.025] leading-none select-none pointer-events-none" style={{ fontFamily: "'Instrument Serif', serif" }}>"</div>
              <div>
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-black/15 to-black/5"></div>
                  <div>
                    <p className="text-sm font-bold">{testimonials[activeTestimonial].person}</p>
                    <p className="text-xs text-black/35">{testimonials[activeTestimonial].role}</p>
                  </div>
                </div>
                <p key={activeTestimonial} className="text-lg md:text-[22px] leading-[1.55] text-black/70 italic" style={{ fontFamily: "'Instrument Serif', serif", animation: 'fadeUp 0.6s ease-out' }}>
                  {testimonials[activeTestimonial].quote}
                </p>
              </div>
              <button className="mt-10 flex items-center gap-2 text-sm font-medium text-black/50 hover:text-black transition-colors duration-300 group">
                Read Case Study <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
         FAQ
         ═══════════════════════════════════════ */}
      <section className="py-28 px-6">
        <div className="max-w-[800px] mx-auto">
          <div className="mb-12">
            <h2 className="text-[32px] md:text-[48px] leading-[1.05] tracking-[-0.02em] mb-4">
              <span className="italic" style={{ fontFamily: "'Instrument Serif', serif" }}>Frequently Asked Questions</span>
            </h2>
            <p className="text-sm text-black/45 leading-relaxed">
              Clear, zero-fluff technical and operational parameters regarding how we build, deploy, and secure your enterprise architectures.
            </p>
          </div>
          <div>
            {faqs.map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
         CTA
         ═══════════════════════════════════════ */}
      <section ref={ctaRef} className="py-28 px-6">
        <div className={`max-w-[1180px] mx-auto text-center transition-all duration-1000 ${ctaVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
          <h2 className="text-[44px] md:text-[80px] leading-[0.92] tracking-[-0.04em] font-medium mb-8">
            Scale Your <span className="italic" style={{ fontFamily: "'Instrument Serif', serif" }}>Infrastructure.</span>
          </h2>
          <p className="text-base text-black/45 max-w-xl mx-auto mb-10 leading-relaxed">
            Book a 30-minute technical assessment. We will audit your current manual workflows and tell you exactly which processes can be automated using AI.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-14">
            {['🔒 No aggressive sales pitches.', '👤 Speak directly with a lead engineer.', '🗺 Receive a clear deployment roadmap.'].map((val, i) => (
              <div key={i} className="px-4 py-2 rounded-full border border-black/8 bg-white/70 backdrop-blur-md text-[13px] text-black/60 font-medium shadow-sm">
                {val}
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/app')}
            className="group bg-black text-white px-10 py-5 rounded-full text-base font-semibold hover:bg-black/85 transition-all duration-300 hover:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.3)] hover:-translate-y-1 inline-flex items-center gap-3"
          >
            Book Technical Audit
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════
         FOOTER
         ═══════════════════════════════════════ */}
      <footer className="border-t border-black/8 py-16 px-6 bg-white/30">
        <div className="max-w-[1180px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex flex-wrap w-[14px] h-[14px] gap-0">
                  <div className="w-[6px] h-[6px] bg-black rounded-[0.5px]"></div>
                  <div className="w-[6px] h-[6px] bg-black rounded-[0.5px] ml-[2px]"></div>
                  <div className="w-[6px] h-[6px] bg-black rounded-[0.5px] mt-[2px]"></div>
                  <div className="w-[6px] h-[6px] bg-black/20 rounded-[0.5px] ml-[2px] mt-[2px]"></div>
                </div>
                <span className="font-bold text-sm">Synapse OS</span>
              </div>
              <p className="text-[12px] text-black/35 leading-relaxed mb-4">Autonomous AI agent orchestration for modern enterprises.</p>
              <p className="text-[11px] text-black/25">©️ Synapse OS. All Rights Reserved.</p>
            </div>
            <div>
              <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-black/30 mb-4">Pages</h4>
              <div className="flex flex-col gap-2.5">
                {['About', 'Pricing', 'Case Studies', 'Careers'].map((l, i) => (
                  <a key={i} href="#" className="text-[13px] text-black/50 hover:text-black transition-colors duration-300">{l}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-black/30 mb-4">Support</h4>
              <div className="flex flex-col gap-2.5">
                {['Contact', 'Privacy Policy', 'Terms & Conditions', 'Acceptable Use'].map((l, i) => (
                  <a key={i} href="#" className="text-[13px] text-black/50 hover:text-black transition-colors duration-300">{l}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-black/30 mb-4">Connect</h4>
              <a href="mailto:support@synapse-os.com" className="text-[13px] text-black/50 hover:text-black transition-colors duration-300">support@synapse-os.com</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
