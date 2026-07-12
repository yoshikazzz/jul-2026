import { useState } from "react";
import {
  Check, MapPin, Clock, Plane, Train, Ship, Camera, Utensils,
  ShoppingBag, Star, ChevronRight, Plus, X, Users, Briefcase,
  Moon, Sun, Sunset
} from "lucide-react";
import todosJson  from "../data/todos.json";
import daysJson   from "../data/days.json";
import membersJson from "../data/members.json";
import citiesJson  from "../data/cities.json";

// ─── Types ───────────────────────────────────────────────────────────────────

type TimeSlot = "morning" | "afternoon" | "evening";
type Person = "すぅ" | "ふぅ" | "じょしゅ" | "ゆず" | "もぐ" | "だぃ" | "はりぃ" | "まこ" | "こうへい" | "全員";
type City = "HK" | "KL" | "BKK";

interface Activity {
  id: string;
  time: string;
  slot: TimeSlot;
  title: string;
  place?: string;
  duration?: string;
  category: "transport" | "food" | "sightseeing" | "shopping" | "leisure" | "work";
  note?: string;
  highlight?: boolean;
  people?: Person[];
}

interface DayPlan {
  day: number;
  date: string;
  dateJa: string;
  label: string;
  city: City;
  activities: Activity[];
}

interface TodoItem {
  id: string;
  text: string;
  category: "flight" | "hotel" | "booking" | "packing" | "money" | "health" | "info";
  done: boolean;
  priority: "high" | "mid" | "low";
}

// ─── Data (loaded from JSON) ──────────────────────────────────────────────────

const DAYS: DayPlan[]     = daysJson    as unknown as DayPlan[];
const TODOS: TodoItem[] = (todosJson as unknown[]).map((t) => t as TodoItem);


// ─── Constants ────────────────────────────────────────────────────────────────

const personColors: Record<string, string> = {
  "すぅ":    "bg-rose-500/20 text-rose-300 border-rose-500/30",
  "ふぅ":    "bg-violet-500/20 text-violet-300 border-violet-500/30",
  "じょしゅ": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "ゆず":    "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "もぐ":    "bg-pink-500/20 text-pink-300 border-pink-500/30",
  "だぃ":    "bg-lime-500/20 text-lime-300 border-lime-500/30",
  "はりぃ":  "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "まこ":    "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  "こうへい": "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  "全員":    "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};


const categoryColors: Record<Activity["category"], string> = {
  transport: "text-blue-400",
  food: "text-amber-400",
  sightseeing: "text-emerald-400",
  shopping: "text-violet-400",
  leisure: "text-sky-300",
  work: "text-rose-400",
};

const categoryIcons: Record<Activity["category"], React.ReactNode> = {
  transport: <Train size={11} />,
  food: <Utensils size={11} />,
  sightseeing: <Camera size={11} />,
  shopping: <ShoppingBag size={11} />,
  leisure: <Star size={11} />,
  work: <Briefcase size={11} />,
};

const slotIcons: Record<TimeSlot, React.ReactNode> = {
  morning: <Sun size={11} />,
  afternoon: <Sunset size={11} />,
  evening: <Moon size={11} />,
};

const slotLabel: Record<TimeSlot, string> = {
  morning: "午前",
  afternoon: "午後",
  evening: "夜",
};

const todoCategoryLabel: Record<TodoItem["category"], string> = {
  flight: "航空券",
  hotel: "ホテル",
  booking: "予約",
  packing: "荷造",
  money: "お金",
  health: "健康",
  info: "情報",
};

const todoCategoryColor: Record<TodoItem["category"], string> = {
  flight: "text-sky-400 border-sky-400/40 bg-sky-400/10",
  hotel: "text-teal-400 border-teal-400/40 bg-teal-400/10",
  booking: "text-primary border-primary/40 bg-primary/10",
  packing: "text-violet-400 border-violet-400/40 bg-violet-400/10",
  money: "text-amber-400 border-amber-400/40 bg-amber-400/10",
  health: "text-emerald-400 border-emerald-400/40 bg-emerald-400/10",
  info: "text-blue-400 border-blue-400/40 bg-blue-400/10",
};

type CityConfig = { label: string; labelEn: string; accent: string; bg: string; dates: string };
const cityConfig: Record<City, CityConfig> = Object.fromEntries(
  citiesJson.map((c) => [c.id, { label: c.label, labelEn: c.labelEn, accent: c.accentClass, bg: c.bgClass, dates: c.dates }])
) as Record<City, CityConfig>;

const cityMembers: Record<City, Person[]> = Object.fromEntries(
  citiesJson.map((c) => [
    c.id,
    membersJson.filter((m) => c.memberIds.includes(m.id)).map((m) => m.name as Person),
  ])
) as Record<City, Person[]>;


const cityHeroPhotos: Record<City, string[]> = {
  HK: [
    "https://images.unsplash.com/photo-1597172300672-dbcdf33ac44e?w=1200&h=400&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1597172300672-dbcdf33ac44e?w=1200&h=400&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1597172300672-dbcdf33ac44e?w=1200&h=400&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1597172300672-dbcdf33ac44e?w=1200&h=400&fit=crop&auto=format",
  ],
  KL: [
    "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200&h=400&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1555921015-5532091f6026?w=1200&h=400&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&h=400&fit=crop&auto=format",
  ],
  BKK: [
    "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&h=400&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=1200&h=400&fit=crop&auto=format",
  ],
};

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeCity, setActiveCity] = useState<City>("HK");
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [todos, setTodos] = useState<TodoItem[]>(TODOS);
  const [newTodo, setNewTodo] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");
  const [mobileView, setMobileView] = useState<"schedule" | "checklist">("schedule");

  const cityDays = DAYS.filter((d) => d.city === activeCity);
  const currentDay = cityDays[activeDayIdx] ?? cityDays[0];
  const cfg = cityConfig[activeCity];

  const slots: TimeSlot[] = ["morning", "afternoon", "evening"];

  const handleCitySwitch = (city: City) => {
    setActiveCity(city);
    setActiveDayIdx(0);
  };

  const toggleTodo = (id: string) =>
    setTodos((p) => p.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const removeTodo = (id: string) =>
    setTodos((p) => p.filter((t) => t.id !== id));

  const addTodo = () => {
    const text = newTodo.trim();
    if (!text) return;
    setTodos((p) => [...p, { id: `t${Date.now()}`, text, category: "info", done: false, priority: "mid" }]);
    setNewTodo("");
  };

  const visibleTodos = todos.filter((t) =>
    filter === "open" ? !t.done : filter === "done" ? t.done : true
  );

  const doneCount = todos.filter((t) => t.done).length;
  const progress = Math.round((doneCount / todos.length) * 100);

  const heroPhoto =
    cityHeroPhotos[activeCity][activeDayIdx] ??
    cityHeroPhotos[activeCity][cityHeroPhotos[activeCity].length - 1];

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>

      {/* ── Top Bar ───────────────────────────────────────────────────────── */}
      <header className="border-b border-border px-4 md:px-6 py-2 md:py-0 md:h-14 flex flex-wrap md:flex-nowrap items-center justify-between gap-y-2 shrink-0">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <Plane size={15} className="text-primary shrink-0" />
          <span className="text-xs tracking-[0.18em] uppercase text-muted-foreground truncate" style={{ fontFamily: "'DM Mono', monospace" }}>
            TRIP PLAN 2026
          </span>
          <ChevronRight size={11} className="hidden sm:block text-muted-foreground shrink-0" />
          <span className="hidden sm:inline text-sm font-semibold truncate" style={{ fontFamily: "'DM Mono', monospace" }}>
            Hong Kong · Kuala Lumpur · Bangkok
          </span>
        </div>
        <div className="flex items-center gap-3 md:gap-5 text-xs text-muted-foreground shrink-0" style={{ fontFamily: "'DM Mono', monospace" }}>
          <span className="hidden sm:inline">2026.07.15 — 07.23</span>
          <span className="text-accent font-medium">9 DAYS</span>
          <div className="flex items-center gap-2">
            <div className="w-14 md:w-20 h-0.5 bg-secondary overflow-hidden rounded">
              <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span>準備 {progress}%</span>
          </div>
        </div>
      </header>

      {/* ── City Tabs ─────────────────────────────────────────────────────── */}
      <div className="border-b border-border flex overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {(["HK", "KL", "BKK"] as City[]).map((city) => {
          const c = cityConfig[city];
          const active = activeCity === city;
          const dayCount = DAYS.filter((d) => d.city === city).length;
          return (
            <button
              key={city}
              onClick={() => handleCitySwitch(city)}
              className={`
                relative flex items-center gap-2 md:gap-3 px-4 md:px-8 py-3 md:py-3.5 text-sm transition-colors border-b-2 shrink-0
                ${active ? `border-b-2 ${c.bg.replace("bg-", "border-")} bg-card` : "border-transparent hover:bg-secondary/30 text-muted-foreground"}
              `}
            >
              {active && (
                <div className={`w-1.5 h-1.5 rounded-full ${c.bg} shrink-0`} />
              )}
              <span className={active ? c.accent : ""} style={{ fontFamily: "'DM Mono', monospace" }}>
                {c.label}
              </span>
              <span className={`text-xs hidden sm:inline ${active ? "text-muted-foreground" : "text-muted-foreground/50"}`}
                style={{ fontFamily: "'DM Mono', monospace" }}>
                {c.dates}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-sm border
                ${active ? `${c.bg}/20 ${c.accent} ${c.bg.replace("bg-", "border-")}/30` : "bg-secondary/30 text-muted-foreground border-border"}`}
                style={{ fontFamily: "'DM Mono', monospace" }}>
                {dayCount}d
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Mobile View Toggle (Schedule / Checklist) ────────────────────── */}
      <div className="flex md:hidden border-b border-border">
        {(["schedule", "checklist"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setMobileView(v)}
            className={`flex-1 py-2.5 text-[10px] tracking-widest uppercase transition-colors
              ${mobileView === v ? "text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            {v === "schedule" ? "SCHEDULE" : "CHECKLIST"}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:h-[calc(100vh-108px)]">

        {/* ── Left: Day Sidebar (desktop only) ─────────────────────────── */}
        <aside className="hidden md:flex w-48 border-r border-border flex-col shrink-0 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          <div className="px-4 py-3 text-[10px] tracking-widest text-muted-foreground uppercase border-b border-border"
            style={{ fontFamily: "'DM Mono', monospace" }}>
            DAYS
          </div>
          {cityDays.map((day, i) => (
            <button
              key={day.day}
              onClick={() => setActiveDayIdx(i)}
              className={`
                w-full text-left px-4 py-3.5 border-b border-border transition-colors
                ${activeDayIdx === i ? `bg-card border-l-2 ${cfg.bg.replace("bg-", "border-l-")}` : "hover:bg-secondary/30"}
              `}
            >
              <div className="text-[10px] text-muted-foreground mb-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>
                {day.date}（DAY {day.day}）
              </div>
              <div className="text-xs font-medium leading-tight">{day.label}</div>
              <div className="text-[10px] text-muted-foreground mt-1">
                {day.activities.length} 件
              </div>
            </button>
          ))}
        </aside>

        {/* ── Center: Schedule ──────────────────────────────────────────── */}
        <main className={`flex-1 overflow-y-auto ${mobileView === "schedule" ? "block" : "hidden"} md:block`} style={{ scrollbarWidth: "none" }}>

          {/* Mobile: horizontal day chips (replaces the desktop sidebar) */}
          <div className="md:hidden flex gap-2 overflow-x-auto px-4 py-3 border-b border-border" style={{ scrollbarWidth: "none" }}>
            {cityDays.map((day, i) => (
              <button
                key={day.day}
                onClick={() => setActiveDayIdx(i)}
                className={`shrink-0 text-left px-3 py-2 rounded border transition-colors
                  ${activeDayIdx === i ? `bg-card ${cfg.bg.replace("bg-", "border-")}` : "border-border hover:bg-secondary/30"}`}
              >
                <div className={`text-[9px] tracking-widest uppercase ${activeDayIdx === i ? cfg.accent : "text-muted-foreground"}`}
                  style={{ fontFamily: "'DM Mono', monospace" }}>
                  DAY {day.day}
                </div>
                <div className="text-[11px] font-medium mt-0.5 whitespace-nowrap">{day.date}</div>
              </button>
            ))}
          </div>

          {/* Hero */}
          <div className="relative h-24 md:h-36 overflow-hidden bg-secondary">
            <img src={heroPhoto} alt={currentDay.label} className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
            <div className="absolute inset-0 px-4 md:px-8 flex items-center">
              <div>
                <div className={`text-[10px] tracking-[0.2em] uppercase mb-1 ${cfg.accent}`}
                  style={{ fontFamily: "'DM Mono', monospace" }}>
                  {cfg.labelEn} · {currentDay.dateJa}
                </div>
                <h2 className="text-xl md:text-2xl font-bold" style={{ fontFamily: "'DM Mono', monospace" }}>
                  {currentDay.label}
                </h2>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="px-4 md:px-8 py-5 md:py-6 space-y-6 md:space-y-7">
            {slots.map((slot) => {
              const acts = currentDay.activities.filter((a) => a.slot === slot);
              if (!acts.length) return null;
              return (
                <div key={slot}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-muted-foreground`}
                      style={{ fontFamily: "'DM Mono', monospace" }}>
                      {slotIcons[slot]}
                      {slotLabel[slot]}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <div className="relative pl-5 space-y-0.5">
                    <div className="absolute left-0 top-2 bottom-2 w-px bg-border" />
                    {acts.map((act) => (
                      <div key={act.id} className="relative group">
                        <div className={`absolute -left-[4px] top-4 w-2 h-2 rounded-full border transition-all
                          ${act.highlight
                            ? `${cfg.bg} ${cfg.bg.replace("bg-", "border-")} shadow-[0_0_8px_var(--tw-shadow-color)]`
                            : "bg-background border-border group-hover:border-muted-foreground"
                          }`}
                          style={act.highlight ? { "--tw-shadow-color": "rgba(232,53,26,0.5)" } as React.CSSProperties : {}}
                        />
                        <div className={`ml-4 mb-0.5 px-4 py-3 rounded transition-colors
                          ${act.highlight ? "bg-card border border-border" : "hover:bg-secondary/20"}`}>
                          <div className="flex items-start gap-3 flex-wrap">
                            {/* Time */}
                            {act.time !== "—" && (
                              <span className="text-sm tabular-nums text-accent shrink-0 w-10"
                                style={{ fontFamily: "'DM Mono', monospace" }}>
                                {act.time}
                              </span>
                            )}
                            {/* Cat icon */}
                            <span className={`mt-0.5 shrink-0 ${categoryColors[act.category]}`}>
                              {act.category === "transport" && /フライト|到着|出発|→.*[A-Z]{3}|[A-Z]{3}.*→/.test(act.title)
                                ? <Plane size={11} />
                                : categoryIcons[act.category]}
                            </span>
                            {/* Title + meta */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium">{act.title}</span>
                                {act.highlight && <Star size={9} className="text-accent fill-accent shrink-0" />}
                              </div>
                              {act.place && (
                                <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                                  <MapPin size={9} />
                                  {act.place}
                                </div>
                              )}
                              {act.note && (
                                <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed"
                                  style={{ fontFamily: "'DM Mono', monospace" }}>
                                  // {act.note}
                                </p>
                              )}
                            </div>
                            {/* People */}
                            {act.people && (
                              <div className="flex flex-wrap gap-1 shrink-0">
                                {act.people.map((p) => (
                                  <span key={p}
                                    className={`text-[10px] px-1.5 py-0.5 rounded-sm border ${personColors[p]}`}
                                    style={{ fontFamily: "'DM Mono', monospace" }}>
                                    {p}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* ── Right: ToDo ───────────────────────────────────────────────── */}
        <aside className={`${mobileView === "checklist" ? "flex" : "hidden"} md:flex w-full md:w-72 md:border-l border-border flex-col shrink-0 overflow-hidden`}>
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <span className="text-[10px] tracking-widest text-muted-foreground uppercase"
              style={{ fontFamily: "'DM Mono', monospace" }}>
              PRE-TRIP CHECKLIST
            </span>
            <span className="text-xs text-accent" style={{ fontFamily: "'DM Mono', monospace" }}>
              {doneCount}/{todos.length}
            </span>
          </div>

          {/* Progress */}
          <div className="h-0.5 bg-secondary">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          {/* Filter */}
          <div className="flex border-b border-border">
            {(["all", "open", "done"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`flex-1 py-2 text-[10px] tracking-widest uppercase transition-colors
                  ${filter === f ? "text-foreground border-b border-primary" : "text-muted-foreground hover:text-foreground"}`}
                style={{ fontFamily: "'DM Mono', monospace" }}>
                {f === "all" ? "ALL" : f === "open" ? "OPEN" : "DONE"}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            {visibleTodos.map((todo) => (
              <div key={todo.id}
                className="group flex items-start gap-3 px-4 py-3 border-b border-border hover:bg-secondary/20 transition-colors">
                <button onClick={() => toggleTodo(todo.id)}
                  className={`mt-0.5 shrink-0 w-4 h-4 rounded-sm border flex items-center justify-center transition-all
                    ${todo.done ? "bg-primary border-primary" : "border-border hover:border-muted-foreground"}`}>
                  {todo.done && <Check size={9} className="text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs leading-relaxed ${todo.done ? "line-through text-muted-foreground" : ""}`}>
                    {todo.text}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`text-[9px] px-1 py-0.5 rounded-sm border ${todoCategoryColor[todo.category]}`}
                      style={{ fontFamily: "'DM Mono', monospace" }}>
                      {todoCategoryLabel[todo.category]}
                    </span>
                    {todo.priority === "high" && (
                      <span className="text-[9px] text-primary" style={{ fontFamily: "'DM Mono', monospace" }}>!!</span>
                    )}
                  </div>
                </div>
                <button onClick={() => removeTodo(todo.id)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all">
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>

          {/* Add */}
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTodo()}
                placeholder="タスクを追加…"
                className="flex-1 bg-secondary text-foreground text-xs px-3 py-2 rounded outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/50"
                style={{ fontFamily: "'DM Mono', monospace" }}
              />
              <button onClick={addTodo}
                className="bg-primary hover:bg-primary/80 text-white w-8 h-8 rounded flex items-center justify-center transition-colors shrink-0">
                <Plus size={13} />
              </button>
            </div>
          </div>

          {/* People Legend */}
          <div className="border-t border-border px-4 py-3">
            <div className="text-[9px] tracking-widest text-muted-foreground uppercase mb-2"
              style={{ fontFamily: "'DM Mono', monospace" }}>
              MEMBERS
            </div>
            <div className="flex flex-wrap gap-1.5">
              {cityMembers[activeCity].map((p) => (
                <span key={p} className={`text-[10px] px-2 py-0.5 rounded-sm border ${personColors[p]}`}
                  style={{ fontFamily: "'DM Mono', monospace" }}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
