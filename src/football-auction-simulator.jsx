
import React, { useState, useEffect, useRef } from "react";
import {
  Users, History, BarChart3, Pause, Play,
  SkipForward, Gauge, ShieldCheck, Flame, Gem, ChevronLeft, X
} from "lucide-react";

/* =========================================================
   STATIC DATA
   ========================================================= */

const CATEGORY_ORDER = ["GK", "DEF", "MID", "WING", "ST"];
const CATEGORY_LABEL = {
  GK: "Goalkeepers", DEF: "Defenders", MID: "Midfielders",
  WING: "Wingers", ST: "Strikers",
};
const POS_COLOR = {
  GK: "#2DD4BF", DEF: "#60A5FA", MID: "#4ADE80", WING: "#C084FC", ST: "#FB923C",
};
const RECOMMENDED = { GK: [2, 3], DEF: [6, 8], MID: [6, 8], WING: [2, 3], ST: [2, 3] };
const MAX_PER_CATEGORY = { GK: 4, DEF: 9, MID: 9, WING: 4, ST: 4 };
const MIN_SQUAD = 18;
const MAX_SQUAD = 25;
const START_BUDGET = 300;

const NAT_FLAG = {
  France: "🇫🇷", Brazil: "🇧🇷", Belgium: "🇧🇪", Germany: "🇩🇪", Italy: "🇮🇹",
  Morocco: "🇲🇦", Argentina: "🇦🇷", England: "🏴", Netherlands: "🇳🇱",
  Portugal: "🇵🇹", Croatia: "🇭🇷", Slovakia: "🇸🇰", Uruguay: "🇺🇾", Spain: "🇪🇸",
  Norway: "🇳🇴", Ecuador: "🇪🇨", Egypt: "🇪🇬", Sweden: "🇸🇪", Nigeria: "🇳🇬",
  Poland: "🇵🇱", Denmark: "🇩🇰", Guinea: "🇬🇳", Serbia: "🇷🇸", Slovenia: "🇸🇮",
  Canada: "🇨🇦",
};

const CLUBS_DB = [
  { id: "barca", name: "FC Barcelona", short: "BAR", color: "#A50044", strategy: "balanced", label: "Balanced Squad Building" },
  { id: "real", name: "Real Madrid", short: "RMA", color: "#E8C547", strategy: "superstar", label: "Superstar Collection" },
  { id: "mancity", name: "Manchester City", short: "MCI", color: "#6CADDF", strategy: "aggressive", label: "Build The Strongest Squad" },
  { id: "liverpool", name: "Liverpool", short: "LIV", color: "#E4483C", strategy: "balanced", label: "Balanced & Data-Driven" },
  { id: "bayern", name: "Bayern Munich", short: "BAY", color: "#EF4B57", strategy: "balanced", label: "Balanced Squad Building" },
  { id: "psg", name: "Paris Saint-Germain", short: "PSG", color: "#4E6FE0", strategy: "superstar", label: "Star-Studded Project" },
  { id: "arsenal", name: "Arsenal", short: "ARS", color: "#EF5350", strategy: "youth", label: "Youth-Focused Development" },
  { id: "inter", name: "Inter Milan", short: "INT", color: "#5C8DF6", strategy: "budget", label: "Smart Value Signings" },
];

const RAW_PLAYERS = [
  ["Alisson Becker","GK","GK",31,"Brazil","Liverpool",89,55],
  ["Thibaut Courtois","GK","GK",32,"Belgium","Real Madrid",90,60],
  ["Ederson","GK","GK",30,"Brazil","Manchester City",87,45],
  ["Marc-André ter Stegen","GK","GK",32,"Germany","Barcelona",86,40],
  ["Gianluigi Donnarumma","GK","GK",25,"Italy","PSG",88,65],
  ["Yassine Bounou","GK","GK",33,"Morocco","Al-Hilal",83,20],
  ["Emiliano Martínez","GK","GK",32,"Argentina","Aston Villa",86,35],
  ["Mike Maignan","GK","GK",29,"France","AC Milan",87,50],

  ["Virgil van Dijk","CB","DEF",33,"Netherlands","Liverpool",89,40],
  ["Rúben Dias","CB","DEF",27,"Portugal","Manchester City",89,90],
  ["William Saliba","CB","DEF",23,"France","Arsenal",87,80],
  ["Antonio Rüdiger","CB","DEF",31,"Germany","Real Madrid",86,30],
  ["Achraf Hakimi","RB","DEF",25,"Morocco","PSG",87,70],
  ["Trent Alexander-Arnold","RB","DEF",27,"England","Real Madrid",87,65],
  ["Theo Hernández","LB","DEF",26,"France","AC Milan",86,60],
  ["Alphonso Davies","LB","DEF",23,"Canada","Bayern Munich",85,70],
  ["Jules Koundé","CB","DEF",25,"France","Barcelona",85,55],
  ["Josko Gvardiol","CB","DEF",22,"Croatia","Manchester City",85,75],
  ["Dayot Upamecano","CB","DEF",25,"France","Bayern Munich",84,50],
  ["Marquinhos","CB","DEF",30,"Brazil","PSG",86,45],
  ["Kyle Walker","RB","DEF",34,"England","Manchester City",83,15],
  ["Milan Škriniar","CB","DEF",29,"Slovakia","PSG",83,35],
  ["Gabriel Magalhães","CB","DEF",26,"Brazil","Arsenal",85,65],
  ["Ronald Araújo","CB","DEF",25,"Uruguay","Barcelona",85,60],
  ["Ben White","RB","DEF",26,"England","Arsenal",83,50],
  ["John Stones","CB","DEF",30,"England","Manchester City",83,30],
  ["Nicolás Otamendi","CB","DEF",36,"Argentina","Benfica",78,5],
  ["Lucas Hernández","LB","DEF",28,"France","PSG",82,25],

  ["Kevin De Bruyne","CM","MID",33,"Belgium","Manchester City",90,40],
  ["Jude Bellingham","CM","MID",21,"England","Real Madrid",91,180],
  ["Rodri","CDM","MID",28,"Spain","Manchester City",91,110],
  ["Federico Valverde","CM","MID",26,"Uruguay","Real Madrid",88,110],
  ["Pedri","CM","MID",21,"Spain","Barcelona",87,100],
  ["Gavi","CM","MID",20,"Spain","Barcelona",85,90],
  ["Martin Ødegaard","CAM","MID",25,"Norway","Arsenal",87,100],
  ["Bruno Fernandes","CAM","MID",29,"Portugal","Manchester United",86,65],
  ["Declan Rice","CDM","MID",25,"England","Arsenal",86,90],
  ["Jamal Musiala","CAM","MID",21,"Germany","Bayern Munich",88,130],
  ["Vitinha","CM","MID",24,"Portugal","PSG",85,80],
  ["Aurélien Tchouaméni","CDM","MID",24,"France","Real Madrid",85,75],
  ["Enzo Fernández","CM","MID",23,"Argentina","Chelsea",85,70],
  ["Warren Zaïre-Emery","CM","MID",20,"France","PSG",83,90],
  ["Frenkie de Jong","CM","MID",27,"Netherlands","Barcelona",85,60],
  ["İlkay Gündoğan","CM","MID",33,"Germany","Barcelona",84,10],
  ["Eduardo Camavinga","CM","MID",21,"France","Real Madrid",84,90],
  ["Marco Verratti","CM","MID",31,"Italy","Al-Arabi",82,15],
  ["Moisés Caicedo","CDM","MID",22,"Ecuador","Chelsea",83,90],
  ["Mason Mount","CM","MID",27,"England","Manchester United",79,30],

  ["Kylian Mbappé","LW","WING",27,"France","Real Madrid",91,180],
  ["Lamine Yamal","RW","WING",18,"Spain","Barcelona",89,180],
  ["Vinícius Júnior","LW","WING",24,"Brazil","Real Madrid",91,180],
  ["Mohamed Salah","RW","WING",32,"Egypt","Liverpool",88,45],
  ["Bukayo Saka","RW","WING",23,"England","Arsenal",89,140],
  ["Rafael Leão","LW","WING",25,"Portugal","AC Milan",85,80],
  ["Raheem Sterling","LW","WING",29,"England","Chelsea",80,25],
  ["Nico Williams","LW","WING",22,"Spain","Athletic Bilbao",85,70],
  ["Michael Olise","RW","WING",23,"France","Bayern Munich",84,60],
  ["Leroy Sané","RW","WING",28,"Germany","Bayern Munich",83,40],
  ["Ousmane Dembélé","RW","WING",27,"France","PSG",86,70],
  ["Jeremy Doku","RW","WING",22,"Belgium","Manchester City",83,60],

  ["Erling Haaland","ST","ST",25,"Norway","Manchester City",91,180],
  ["Harry Kane","ST","ST",31,"England","Bayern Munich",90,75],
  ["Robert Lewandowski","ST","ST",36,"Poland","Barcelona",87,15],
  ["Victor Osimhen","ST","ST",26,"Nigeria","Al-Hilal",87,80],
  ["Lautaro Martínez","ST","ST",27,"Argentina","Inter Milan",88,110],
  ["Alexander Isak","ST","ST",25,"Sweden","Newcastle",87,120],
  ["Julián Álvarez","ST","ST",24,"Argentina","Atlético Madrid",86,90],
  ["Randal Kolo Muani","ST","ST",26,"France","PSG",83,45],
  ["Darwin Núñez","ST","ST",25,"Uruguay","Liverpool",82,55],
  ["Rasmus Højlund","ST","ST",22,"Denmark","Manchester United",80,45],
  ["Serhou Guirassy","ST","ST",28,"Guinea","Borussia Dortmund",83,35],
  ["Viktor Gyökeres","ST","ST",27,"Sweden","Sporting CP",85,75],
  ["Dušan Vlahović","ST","ST",25,"Serbia","Juventus",83,40],
  ["Benjamin Šeško","ST","ST",22,"Slovenia","RB Leipzig",82,65],
];

const PLAYERS_DB = RAW_PLAYERS.map((r, i) => {
  const [name, pos, category, age, nat, club, rating, marketValue] = r;
  const basePrice = Math.max(3, Math.round(marketValue * 0.32));
  return { id: i + 1, name, pos, category, age, nat, club, rating, marketValue, basePrice };
});

/* =========================================================
   HELPERS
   ========================================================= */

function fmtM(v) {
  const n = Math.round(v * 10) / 10;
  return `€${n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)}M`;
}
function increment(current) {
  if (current < 10) return 0.5;
  if (current < 50) return 2;
  if (current < 100) return 5;
  if (current < 200) return 10;
  return 20;
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function initials(name) {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}
function categoryCount(club, category) {
  return club.squad.filter(p => p.category === category).length;
}
function needFactor(club, category) {
  const count = categoryCount(club, category);
  const [min, max] = RECOMMENDED[category];
  if (count < min) return 1.25;
  if (count >= max) return 0.35;
  return 0.9;
}
function canBidCategory(club, category) {
  return categoryCount(club, category) < MAX_PER_CATEGORY[category] && club.squad.length < MAX_SQUAD;
}
const CAP_RATIO = { aggressive: 0.45, superstar: 0.5, balanced: 0.35, budget: 0.22, youth: 0.32 };
function baseMultiplier(strategyType, player) {
  switch (strategyType) {
    case "aggressive": return 1.15;
    case "superstar": return player.rating >= 87 ? 1.3 : 0.5;
    case "budget": return 0.5;
    case "youth": return player.age <= 23 ? 1.2 : 0.45;
    default: return 0.95;
  }
}
function maxWillingness(club, player) {
  const strategyType = club.strategyType;
  const mult = baseMultiplier(strategyType, player);
  const need = needFactor(club, player.category);
  const rand = 0.9 + Math.random() * 0.3;
  const willingness = player.marketValue * mult * need * rand;
  const cap = club.budget * CAP_RATIO[strategyType];
  return Math.min(willingness, cap);
}
function positionPriority(club, category, remainingInPool) {
  const count = categoryCount(club, category);
  const [min, max] = RECOMMENDED[category];
  if (count < min && remainingInPool <= 3) return "CRITICAL";
  if (count < min) return "HIGH";
  if (count < max) return "MEDIUM";
  return "LOW";
}
function squadRating(squad) {
  const groups = { GK: [], DEF: [], MID: [], WING: [], ST: [] };
  squad.forEach(p => groups[p.category].push(p.rating));
  const avg = arr => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 68);
  const gk = avg(groups.GK);
  const def = avg(groups.DEF);
  const mid = avg(groups.MID);
  const att = avg([...groups.WING, ...groups.ST]);
  const completeness = Math.min(1, squad.length / MIN_SQUAD);
  const overall = ((gk + def + mid + att) / 4) * (0.75 + completeness * 0.25);
  return { gk: Math.round(gk), def: Math.round(def), mid: Math.round(mid), att: Math.round(att), overall: Math.round(overall * 10) / 10 };
}

/* =========================================================
   AUCTIONEER LINES
   ========================================================= */
function bidLine(clubName, amount) {
  const lines = [
    `€${fmtM(amount).slice(1)} with ${clubName}.`,
    `${clubName} comes in at ${fmtM(amount)}.`,
    `We have ${fmtM(amount)} from ${clubName}!`,
    `${clubName} raises it to ${fmtM(amount)}.`,
  ];
  return lines[Math.floor(Math.random() * lines.length)];
}

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

const TIMERS = {
  normal: { bidding: 10, going: 3, intro: 3, sold: 4, unsold: 3 },
  fast: { bidding: 5, going: 2, intro: 2, sold: 3, unsold: 2 },
};

export default function App() {
  const [screen, setScreen] = useState("setup");
  const [pendingClub, setPendingClub] = useState(null);
  const [speed, setSpeed] = useState("normal");
  const [auction, setAuction] = useState(null);
  const [activeTab, setActiveTab] = useState("auction");
  const [expandedClub, setExpandedClub] = useState(null);
  const [playerFilter, setPlayerFilter] = useState("ALL");
  const [historyFilter, setHistoryFilter] = useState({ club: "ALL", category: "ALL" });
  const intervalRef = useRef(null);

  /* ---------- init ---------- */
  function startAuction() {
    const clubs = CLUBS_DB.map(c => ({
      ...c,
      strategyType: c.strategy,
      isUser: c.id === pendingClub,
      budget: START_BUDGET,
      spent: 0,
      squad: [],
      bids: 0,
    }));
    const firstCategory = CATEGORY_ORDER[0];
    const firstQueue = shuffle(PLAYERS_DB.filter(p => p.category === firstCategory).map(p => p.id));
    const firstId = firstQueue.shift();
    setAuction({
      clubs,
      roundIndex: 0,
      isFinalRound: false,
      queue: firstQueue,
      currentPlayer: { ...PLAYERS_DB.find(p => p.id === firstId) },
      phase: "intro",
      timer: TIMERS[speed].intro,
      currentBid: 0,
      leadingClub: null,
      log: [{ id: 0, text: "Welcome to the auction room. First player coming up..." }],
      transferHistory: [],
      unsoldPool: [],
      soldFlash: null,
      paused: false,
      speed,
    });
    setScreen("auction");
    setActiveTab("auction");
  }

  /* ---------- bid application ---------- */
  function applyBid(state, clubId) {
    const club = state.clubs.find(c => c.id === clubId);
    const player = state.currentPlayer;
    const amount = state.leadingClub === null ? player.basePrice : state.currentBid + increment(state.currentBid);
    if (amount > club.budget - club.spent) return state;
    if (!canBidCategory(club, player.category)) return state;
    const clubs = state.clubs.map(c => c.id === clubId ? { ...c, bids: c.bids + 1 } : c);
    const log = [{ id: Date.now() + Math.random(), text: bidLine(club.name, amount) }, ...state.log].slice(0, 40);
    return {
      ...state,
      clubs,
      currentBid: amount,
      leadingClub: clubId,
      phase: "bidding",
      timer: TIMERS[state.speed].bidding,
      log,
    };
  }

  function userBid() {
    setAuction(prev => {
      if (!prev || prev.paused) return prev;
      if (prev.phase !== "bidding" && prev.phase !== "goingOnce" && prev.phase !== "goingTwice") return prev;
      return applyBid(prev, prev.clubs.find(c => c.isUser).id);
    });
  }

  function togglePause() {
    setAuction(prev => prev ? { ...prev, paused: !prev.paused } : prev);
  }
  function skipPlayer() {
    setAuction(prev => {
      if (!prev) return prev;
      if (prev.phase === "sold" || prev.phase === "unsold") return prev;
      return { ...prev, phase: "unsold", timer: 1 };
    });
  }
  function toggleSpeed() {
    setSpeed(s => s === "normal" ? "fast" : "normal");
    setAuction(prev => prev ? { ...prev, speed: speed === "normal" ? "fast" : "normal" } : prev);
  }

  /* ---------- next player / round progression ---------- */
  function buildNextState(state) {
    let { queue, roundIndex, isFinalRound, unsoldPool } = state;
    let nextId = null;
    queue = queue.slice();
    if (queue.length > 0) {
      nextId = queue.shift();
    } else if (!isFinalRound && roundIndex < CATEGORY_ORDER.length - 1) {
      roundIndex += 1;
      const cat = CATEGORY_ORDER[roundIndex];
      queue = shuffle(PLAYERS_DB.filter(p => p.category === cat).map(p => p.id));
      nextId = queue.shift();
    } else if (!isFinalRound && unsoldPool.length > 0) {
      isFinalRound = true;
      queue = shuffle(unsoldPool.map(p => p.id));
      nextId = queue.shift();
    } else {
      return { ...state, screen: "__finish__" };
    }
    if (nextId === null) return { ...state, screen: "__finish__" };
    const base = PLAYERS_DB.find(p => p.id === nextId);
    const player = isFinalRound
      ? { ...base, basePrice: Math.max(2, Math.round(base.basePrice * 0.6)) }
      : { ...base };
    return {
      ...state,
      queue, roundIndex, isFinalRound,
      currentPlayer: player,
      phase: "intro",
      timer: TIMERS[state.speed].intro,
      currentBid: 0,
      leadingClub: null,
      soldFlash: null,
    };
  }

  /* ---------- the ticking engine ---------- */
  useEffect(() => {
    if (!auction) return;
    intervalRef.current = setInterval(() => {
      setAuction(prev => {
        if (!prev || prev.paused) return prev;
        const t = TIMERS[prev.speed];

        // ---- SOLD display countdown ----
        if (prev.phase === "sold") {
          if (prev.timer <= 1) {
            const next = buildNextState(prev);
            if (next.screen === "__finish__") { setScreen("results"); return prev; }
            return next;
          }
          return { ...prev, timer: prev.timer - 1 };
        }
        // ---- UNSOLD display countdown ----
        if (prev.phase === "unsold") {
          if (prev.timer <= 1) {
            const withPool = prev.isFinalRound
              ? prev
              : { ...prev, unsoldPool: [...prev.unsoldPool, prev.currentPlayer] };
            const next = buildNextState(withPool);
            if (next.screen === "__finish__") { setScreen("results"); return prev; }
            return next;
          }
          return { ...prev, timer: prev.timer - 1 };
        }
        // ---- INTRO countdown ----
        if (prev.phase === "intro") {
          if (prev.timer <= 1) {
            return { ...prev, phase: "bidding", timer: t.bidding };
          }
          return { ...prev, timer: prev.timer - 1 };
        }
        // ---- BIDDING / GOING ONCE / GOING TWICE : AI may act ----
        if (prev.phase === "bidding" || prev.phase === "goingOnce" || prev.phase === "goingTwice") {
          const player = prev.currentPlayer;
          const acting = shuffle(prev.clubs.filter(c => !c.isUser && c.id !== prev.leadingClub));
          const prob = prev.phase === "bidding" ? 0.55 : 0.32;
          for (const club of acting) {
            if (!canBidCategory(club, player.category)) continue;
            const nextAmt = prev.leadingClub === null ? player.basePrice : prev.currentBid + increment(prev.currentBid);
            if (nextAmt > club.budget - club.spent) continue;
            const willAfford = nextAmt <= maxWillingness(club, player);
            if (willAfford && Math.random() < prob) {
              return applyBid(prev, club.id);
            }
          }
          // no bid this tick -> countdown
          if (prev.timer <= 1) {
            if (prev.phase === "bidding") {
              if (prev.leadingClub === null) {
                return { ...prev, phase: "unsold", timer: t.unsold, log: [{ id: Date.now(), text: `No bids for ${player.name}. Unsold.` }, ...prev.log] };
              }
              return { ...prev, phase: "goingOnce", timer: t.going, log: [{ id: Date.now(), text: "Going once..." }, ...prev.log] };
            }
            if (prev.phase === "goingOnce") {
              return { ...prev, phase: "goingTwice", timer: t.going, log: [{ id: Date.now(), text: "Going twice..." }, ...prev.log] };
            }
            if (prev.phase === "goingTwice") {
              const club = prev.clubs.find(c => c.id === prev.leadingClub);
              const soldPlayer = { ...player, pricePaid: prev.currentBid, soldTo: club.name };
              const clubs = prev.clubs.map(c => c.id === club.id
                ? { ...c, spent: c.spent + prev.currentBid, squad: [...c.squad, soldPlayer] }
                : c);
              const record = {
                id: Date.now() + Math.random(),
                player: player.name, pos: player.pos, category: player.category,
                from: player.club, to: club.name, fee: prev.currentBid,
                round: prev.isFinalRound ? "Final Round" : CATEGORY_LABEL[player.category],
              };
              return {
                ...prev,
                clubs,
                phase: "sold",
                timer: t.sold,
                transferHistory: [record, ...prev.transferHistory],
                soldFlash: { player, club, price: prev.currentBid, isStar: player.rating >= 88 },
                log: [{ id: Date.now(), text: `SOLD! ${player.name} to ${club.name} for ${fmtM(prev.currentBid)}.` }, ...prev.log],
              };
            }
          }
          return { ...prev, timer: prev.timer - 1 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [auction ? true : false, speed]);

  /* ---------- resetting the game ---------- */
  function newGame() {
    setAuction(null);
    setScreen("setup");
    setPendingClub(null);
    setActiveTab("auction");
    setExpandedClub(null);
  }

  /* =========================================================
     RENDER: SETUP
     ========================================================= */
  if (screen === "setup") {
    return <SetupScreen pendingClub={pendingClub} setPendingClub={setPendingClub} speed={speed} setSpeed={setSpeed} onStart={startAuction} />;
  }

  if (screen === "results") {
    return <ResultsScreen clubs={auction.clubs} history={auction.transferHistory} onRestart={newGame} />;
  }

  if (!auction) return null;

  const userClub = auction.clubs.find(c => c.isUser);
  const player = auction.currentPlayer;

  const remainingInCategory = auction.queue.filter(id => PLAYERS_DB.find(p => p.id === id)?.category === player.category).length;
  const priority = userClub ? positionPriority(userClub, player.category, remainingInCategory) : "LOW";

  const nextBidAmount = auction.leadingClub === null ? player.basePrice : auction.currentBid + increment(auction.currentBid);
  const canUserBid = userClub &&
    ["bidding", "goingOnce", "goingTwice"].includes(auction.phase) &&
    auction.leadingClub !== userClub.id &&
    nextBidAmount <= userClub.budget - userClub.spent &&
    canBidCategory(userClub, player.category);

  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif" }} className="min-h-screen w-full bg-[#0A0E1A] text-slate-100 pb-20 md:pb-0">
      <GlobalStyle />
      <TopBar
        auction={auction}
        onPause={togglePause}
        onSkip={skipPlayer}
        onSpeed={toggleSpeed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="max-w-7xl mx-auto px-3 md:px-6 pt-4">
        {activeTab === "auction" && (
          <AuctionTab
            auction={auction}
            player={player}
            userClub={userClub}
            priority={priority}
            nextBidAmount={nextBidAmount}
            canUserBid={canUserBid}
            onBid={userBid}
            onExpandClub={setExpandedClub}
          />
        )}
        {activeTab === "squad" && userClub && <SquadTab club={userClub} />}
        {activeTab === "players" && (
          <PlayersTab
            auction={auction}
            filter={playerFilter}
            setFilter={setPlayerFilter}
          />
        )}
        {activeTab === "history" && (
          <HistoryTab
            history={auction.transferHistory}
            filter={historyFilter}
            setFilter={setHistoryFilter}
            clubs={auction.clubs}
          />
        )}
        {activeTab === "stats" && <StatsTab auction={auction} />}
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {expandedClub && (
        <ClubModal club={auction.clubs.find(c => c.id === expandedClub)} onClose={() => setExpandedClub(null)} />
      )}
    </div>
  );
}

/* =========================================================
   GLOBAL STYLE
   ========================================================= */
function GlobalStyle() {
  return (
    <style>{`
      @keyframes floodPulse { 0%,100% { opacity:.55 } 50% { opacity:1 } }
      @keyframes ringSpin { to { transform: rotate(360deg) } }
      @keyframes popIn { 0% { transform:scale(.4); opacity:0 } 60% { transform:scale(1.08); opacity:1 } 100% { transform:scale(1) } }
      @keyframes slideUp { 0% { transform:translateY(16px); opacity:0 } 100% { transform:translateY(0); opacity:1 } }
      @keyframes confettiFall { 0% { transform:translateY(-40px) rotate(0deg); opacity:1 } 100% { transform:translateY(340px) rotate(340deg); opacity:0 } }
      @keyframes shimmerGold { 0%,100% { text-shadow:0 0 18px rgba(232,197,71,.55) } 50% { text-shadow:0 0 32px rgba(232,197,71,.9) } }
      ::-webkit-scrollbar { width:6px; height:6px }
      ::-webkit-scrollbar-thumb { background:#243049; border-radius:4px }
    `}</style>
  );
}

/* =========================================================
   SETUP SCREEN
   ========================================================= */
function SetupScreen({ pendingClub, setPendingClub, speed, setSpeed, onStart }) {
  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif" }} className="min-h-screen bg-[#0A0E1A] text-slate-100 flex flex-col items-center px-4 py-10 md:py-16">
      <GlobalStyle />
      <div className="w-full max-w-4xl text-center">
        <div className="inline-block px-3 py-1 rounded-full border border-[#E8C547]/30 text-[#E8C547] text-xs tracking-wide mb-5" style={{ letterSpacing: "0.08em" }}>
          Transfer Window · Live Auction Room
        </div>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight" style={{ fontStretch: "condensed" }}>
          Football Player Auction
        </h1>
        <p className="text-slate-400 mt-4 max-w-xl mx-auto">
          Take a seat as sporting director. Pick your club, compete against seven rival boardrooms,
          and build a squad under real transfer-window pressure.
        </p>
      </div>

      <div className="w-full max-w-4xl mt-10">
        <h2 className="text-sm uppercase tracking-wide text-slate-500 mb-3">Choose your club</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CLUBS_DB.map(c => (
            <button
              key={c.id}
              onClick={() => setPendingClub(c.id)}
              className="text-left rounded-xl p-4 border transition-all"
              style={{
                borderColor: pendingClub === c.id ? c.color : "#1C2740",
                background: pendingClub === c.id ? `${c.color}14` : "#0F1626",
                boxShadow: pendingClub === c.id ? `0 0 0 1px ${c.color}55` : "none",
              }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-3"
                style={{ background: c.color, color: "#0A0E1A" }}>
                {c.short}
              </div>
              <div className="font-semibold text-sm">{c.name}</div>
              <div className="text-xs text-slate-500 mt-1">Budget €{START_BUDGET}M</div>
              {pendingClub === c.id && (
                <div className="text-[11px] mt-2 font-medium" style={{ color: c.color }}>You are in control</div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-4xl mt-8 flex items-center justify-between rounded-xl border border-[#1C2740] bg-[#0F1626] p-4">
        <div>
          <div className="text-sm font-medium">Auction pace</div>
          <div className="text-xs text-slate-500">Fast mode shortens timers for a quicker demo run.</div>
        </div>
        <div className="flex rounded-lg border border-[#1C2740] overflow-hidden">
          <button onClick={() => setSpeed("normal")} className="px-4 py-2 text-sm" style={{ background: speed === "normal" ? "#1C2740" : "transparent" }}>Normal</button>
          <button onClick={() => setSpeed("fast")} className="px-4 py-2 text-sm" style={{ background: speed === "fast" ? "#1C2740" : "transparent" }}>Fast</button>
        </div>
      </div>

      <button
        disabled={!pendingClub}
        onClick={onStart}
        className="mt-8 px-8 py-3 rounded-full font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        style={{ background: "#E8C547", color: "#0A0E1A" }}
      >
        Enter the Auction Room
      </button>

      <p className="text-xs text-slate-600 mt-6 max-w-md text-center">
        74 players across five rounds — goalkeepers, defenders, midfielders, wingers and strikers —
        followed by a final unsold-players round.
      </p>
    </div>
  );
}

/* =========================================================
   TOP BAR
   ========================================================= */
function TopBar({ auction, onPause, onSkip, onSpeed, activeTab, setActiveTab }) {
  const roundLabel = auction.isFinalRound ? "Final Round · Unsold Players" : `Round ${auction.roundIndex + 1} · ${CATEGORY_LABEL[CATEGORY_ORDER[auction.roundIndex]]}`;
  const playedSoFar = auction.transferHistory.length + auction.unsoldPool.length + 1;
  return (
    <div className="sticky top-0 z-30 border-b border-[#1C2740] bg-[#0A0E1A]/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-[#E8C547]" style={{ letterSpacing: "0.12em" }}>Football Player Auction</div>
          <div className="text-sm text-slate-400">{roundLabel} · Player {Math.min(playedSoFar, PLAYERS_DB.length)} of {PLAYERS_DB.length}</div>
        </div>
        <div className="hidden md:flex items-center gap-1 bg-[#0F1626] border border-[#1C2740] rounded-full p-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors"
              style={{ background: activeTab === t.id ? "#1C2740" : "transparent", color: activeTab === t.id ? "#fff" : "#8896B3" }}>
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onSpeed} title="Toggle speed" className="p-2 rounded-full border border-[#1C2740] hover:bg-[#141C30]"><Gauge size={15} /></button>
          <button onClick={onSkip} title="Skip player" className="p-2 rounded-full border border-[#1C2740] hover:bg-[#141C30]"><SkipForward size={15} /></button>
          <button onClick={onPause} title="Pause/Resume" className="p-2 rounded-full border border-[#1C2740] hover:bg-[#141C30]">
            {auction.paused ? <Play size={15} /> : <Pause size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}

const TABS = [
  { id: "auction", label: "Auction", icon: Flame },
  { id: "squad", label: "Squad", icon: Users },
  { id: "players", label: "Players", icon: ShieldCheck },
  { id: "history", label: "History", icon: History },
  { id: "stats", label: "Stats", icon: BarChart3 },
];

function BottomNav({ activeTab, setActiveTab }) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-[#1C2740] bg-[#0A0E1A]/98 backdrop-blur flex">
      {TABS.map(t => (
        <button key={t.id} onClick={() => setActiveTab(t.id)}
          className="flex-1 py-2.5 flex flex-col items-center gap-1"
          style={{ color: activeTab === t.id ? "#E8C547" : "#63708C" }}>
          <t.icon size={17} />
          <span className="text-[10px]">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

/* =========================================================
   AUCTION TAB
   ========================================================= */
function AuctionTab({ auction, player, userClub, priority, nextBidAmount, canUserBid, onBid, onExpandClub }) {
  const leadingClub = auction.leadingClub ? auction.clubs.find(c => c.id === auction.leadingClub) : null;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_280px] gap-4">
      {/* Auctioneer panel */}
      <div className="order-3 lg:order-1 rounded-xl border border-[#1C2740] bg-[#0F1626] p-4 flex flex-col h-fit lg:sticky lg:top-20">
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Auctioneer</div>
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {auction.log.slice(0, 12).map((l, i) => (
            <div key={l.id} className="text-sm" style={{ color: i === 0 ? "#E8C547" : "#8896B3", fontWeight: i === 0 ? 600 : 400 }}>
              {l.text}
            </div>
          ))}
        </div>
        {userClub && (
          <div className="mt-4 pt-4 border-t border-[#1C2740]">
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Position Priority</div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">{CATEGORY_LABEL[player.category]}</span>
              <PriorityBadge level={priority} />
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              You have {userClub.squad.filter(p => p.category === player.category).length} {CATEGORY_LABEL[player.category].toLowerCase()} · recommended {RECOMMENDED[player.category][0]}–{RECOMMENDED[player.category][1]}
            </div>
          </div>
        )}
      </div>

      {/* Center stage */}
      <div className="order-1 lg:order-2">
        <PlayerStage
          auction={auction}
          player={player}
          leadingClub={leadingClub}
          nextBidAmount={nextBidAmount}
          canUserBid={canUserBid}
          onBid={onBid}
          userClub={userClub}
        />
      </div>

      {/* Clubs table */}
      <div className="order-2 lg:order-3 rounded-xl border border-[#1C2740] bg-[#0F1626] p-4 h-fit lg:sticky lg:top-20">
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-3">Clubs at the Table</div>
        <div className="space-y-2">
          {auction.clubs.map(c => (
            <ClubRow key={c.id} club={c} leading={auction.leadingClub === c.id} onClick={() => onExpandClub(c.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PriorityBadge({ level }) {
  const map = {
    CRITICAL: { bg: "#3B1220", fg: "#FF6B81", label: "CRITICAL" },
    HIGH: { bg: "#3A2410", fg: "#FDBA74", label: "HIGH" },
    MEDIUM: { bg: "#132A1E", fg: "#4ADE80", label: "MEDIUM" },
    LOW: { bg: "#151C2B", fg: "#8896B3", label: "LOW" },
  }[level];
  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: map.bg, color: map.fg }}>
      {map.label}
    </span>
  );
}

function ClubRow({ club, leading, onClick }) {
  const pct = Math.round(((club.budget - club.spent) / club.budget) * 100);
  return (
    <button onClick={onClick} className="w-full text-left rounded-lg p-2.5 border transition-all"
      style={{
        borderColor: leading ? club.color : "#1C2740",
        background: leading ? `${club.color}18` : "#0B111E",
        boxShadow: leading ? `0 0 0 1px ${club.color}66` : "none",
      }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: club.color, color: "#0A0E1A" }}>{club.short}</div>
          <div className="min-w-0">
            <div className="text-xs font-medium truncate flex items-center gap-1">
              {club.name} {club.isUser && <span className="text-[9px] text-[#E8C547]">(You)</span>}
            </div>
            <div className="text-[10px] text-slate-500">{club.squad.length}/{MAX_SQUAD} squad</div>
          </div>
        </div>
        {leading && <span className="text-[10px] font-semibold" style={{ color: club.color }}>BIDDING</span>}
      </div>
      <div className="mt-1.5 h-1 rounded-full bg-[#1C2740] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: club.color }} />
      </div>
      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
        <span>{fmtM(club.budget - club.spent)} left</span>
        <span>{club.bids} bids</span>
      </div>
    </button>
  );
}

/* =========================================================
   PLAYER STAGE (center)
   ========================================================= */
function PlayerStage({ auction, player, leadingClub, nextBidAmount, canUserBid, onBid, userClub }) {
  const phase = auction.phase;
  const accent = POS_COLOR[player.category];

  return (
    <div className="relative rounded-2xl border border-[#1C2740] overflow-hidden" style={{ background: "radial-gradient(ellipse at top, #131B2E 0%, #0A0E1A 70%)" }}>
      {/* floodlight glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${accent}22, transparent 60%)`, animation: "floodPulse 3.5s ease-in-out infinite" }} />

      {phase === "intro" && (
        <div className="relative py-14 px-6 text-center" style={{ animation: "popIn .4s ease" }}>
          <div className="text-xs uppercase tracking-widest text-slate-500 mb-3" style={{ letterSpacing: "0.15em" }}>Next Player</div>
          <div className="text-3xl md:text-4xl font-bold">{NAT_FLAG[player.nat] || "🏳️"} {player.name}</div>
          <div className="text-sm text-slate-400 mt-2">{player.pos} · {player.club}</div>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm">
            <Stat label="Overall" value={player.rating} />
            <Stat label="Age" value={player.age} />
            <Stat label="Market Value" value={fmtM(player.marketValue)} />
          </div>
          <div className="mt-6 text-xs text-slate-500">Starting price {fmtM(player.basePrice)}</div>
        </div>
      )}

      {(phase === "bidding" || phase === "goingOnce" || phase === "goingTwice") && (
        <div className="relative py-10 px-6">
          <PlayerHeader player={player} accent={accent} />
          <div className="text-center mt-6">
            <div className="text-xs uppercase tracking-wide text-slate-500">Current Bid</div>
            <div className="text-5xl font-bold mt-1" style={{ color: accent }}>{auction.leadingClub ? fmtM(auction.currentBid) : fmtM(player.basePrice)}</div>
            <div className="text-sm text-slate-400 mt-1">
              {leadingClub ? <>with <span style={{ color: leadingClub.color }} className="font-semibold">{leadingClub.name}</span></> : "awaiting first bid"}
            </div>
          </div>

          <TimerRing seconds={auction.timer} max={phase === "bidding" ? TIMERS[auction.speed].bidding : TIMERS[auction.speed].going} phase={phase} />

          {(phase === "goingOnce" || phase === "goingTwice") && (
            <div className="text-center mt-2">
              <span className="text-xl font-bold tracking-wide" style={{ color: "#FDBA74", animation: "shimmerGold 1s ease-in-out infinite" }}>
                {phase === "goingOnce" ? "GOING ONCE..." : "GOING TWICE..."}
              </span>
            </div>
          )}

          <div className="mt-6 flex flex-col items-center gap-2">
            <button
              disabled={!canUserBid}
              onClick={onBid}
              className="px-8 py-3.5 rounded-full font-bold text-sm disabled:opacity-25 disabled:cursor-not-allowed transition-all active:scale-95"
              style={{ background: userClub ? userClub.color : "#E8C547", color: "#0A0E1A" }}
            >
              {userClub ? `Bid ${fmtM(nextBidAmount)} — ${userClub.name}` : "No club selected"}
            </button>
            {userClub && !canUserBid && (
              <div className="text-[11px] text-slate-500">
                {auction.leadingClub === userClub.id ? "You are currently leading the bid." :
                  nextBidAmount > userClub.budget - userClub.spent ? "Insufficient budget for this bid." :
                    "Squad requirement reached for this position."}
              </div>
            )}
          </div>
        </div>
      )}

      {phase === "sold" && auction.soldFlash && (
        <SoldFlash flash={auction.soldFlash} />
      )}

      {phase === "unsold" && (
        <div className="relative py-16 px-6 text-center" style={{ animation: "popIn .3s ease" }}>
          <div className="text-4xl font-bold text-slate-500">UNSOLD</div>
          <div className="text-lg mt-2">{player.name}</div>
          <div className="text-sm text-slate-500 mt-1">
            {auction.isFinalRound ? "Leaves the auction without a buyer." : "Returns in the final round at a reduced price."}
          </div>
        </div>
      )}
    </div>
  );
}

function PlayerHeader({ player, accent }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${accent}, #0A0E1A)`, border: `2px solid ${accent}` }}>
        {initials(player.name)}
      </div>
      <div className="min-w-0">
        <div className="text-xl font-bold truncate">{NAT_FLAG[player.nat] || "🏳️"} {player.name}</div>
        <div className="text-xs text-slate-500">{player.pos} · {player.club} · Age {player.age}</div>
        <div className="flex items-center gap-3 mt-1 text-[11px]">
          <span className="px-1.5 py-0.5 rounded" style={{ background: `${accent}22`, color: accent }}>OVR {player.rating}</span>
          <span className="text-slate-500">Value {fmtM(player.marketValue)}</span>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}

function TimerRing({ seconds, max, phase }) {
  const pct = Math.max(0, seconds / max);
  const urgent = seconds <= 3;
  const circumference = 2 * Math.PI * 34;
  return (
    <div className="flex justify-center mt-5">
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
          <circle cx="40" cy="40" r="34" fill="none" stroke="#1C2740" strokeWidth="6" />
          <circle cx="40" cy="40" r="34" fill="none" stroke={urgent ? "#EF4444" : "#E8C547"} strokeWidth="6"
            strokeDasharray={circumference} strokeDashoffset={circumference * (1 - pct)} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s linear" }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xl font-bold" style={{ color: urgent ? "#EF4444" : "#fff" }}>
          {seconds}
        </div>
      </div>
    </div>
  );
}

function SoldFlash({ flash }) {
  const { player, club, price, isStar } = flash;
  const premium = ((price - player.marketValue) / player.marketValue) * 100;
  return (
    <div className="relative py-14 px-6 text-center overflow-hidden" style={{ animation: "popIn .35s ease" }}>
      {isStar && Array.from({ length: 18 }).map((_, i) => (
        <span key={i} className="absolute text-lg" style={{
          left: `${(i * 53) % 100}%`, top: "-20px",
          animation: `confettiFall ${1.6 + (i % 5) * 0.2}s ease-in ${i * 0.05}s forwards`,
        }}>{["🎉", "⭐", "🏆", "🔥"][i % 4]}</span>
      ))}
      <div className="text-5xl font-black tracking-tight" style={{ color: "#E8C547", animation: "shimmerGold 1.2s ease-in-out infinite" }}>SOLD!</div>
      <div className="text-2xl font-bold mt-3">{player.name}</div>
      <div className="text-3xl font-bold mt-1" style={{ color: club.color }}>{fmtM(price)}</div>
      <div className="text-sm text-slate-400 mt-1">to {club.name}</div>
      <div className="mt-4 inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full" style={{ background: premium >= 0 ? "#3A2410" : "#0E2A1C", color: premium >= 0 ? "#FDBA74" : "#4ADE80" }}>
        {premium >= 0 ? <Flame size={12} /> : <Gem size={12} />}
        {premium >= 0 ? `Overpaid by ${premium.toFixed(0)}%` : `Great deal, ${Math.abs(premium).toFixed(0)}% under value`}
      </div>
    </div>
  );
}

/* =========================================================
   SQUAD TAB
   ========================================================= */
function SquadTab({ club }) {
  const remaining = club.budget - club.spent;
  const avgPrice = club.squad.length ? club.spent / club.squad.length : 0;
  const highest = club.squad.reduce((m, p) => Math.max(m, p.pricePaid), 0);
  const slotsLeft = Math.max(1, MAX_SQUAD - club.squad.length);
  const rating = squadRating(club.squad);

  return (
    <div className="space-y-5 pb-6">
      <div className="rounded-xl border border-[#1C2740] bg-[#0F1626] p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold" style={{ background: club.color, color: "#0A0E1A" }}>{club.short}</div>
            <div>
              <div className="text-lg font-bold">{club.name}</div>
              <div className="text-xs text-slate-500">{club.squad.length}/{MAX_SQUAD} players · min {MIN_SQUAD}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: "#E8C547" }}>{rating.overall}</div>
            <div className="text-[10px] uppercase text-slate-500">Squad Rating</div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5">
          <MiniStat label="Remaining Budget" value={fmtM(remaining)} />
          <MiniStat label="Total Spent" value={fmtM(club.spent)} />
          <MiniStat label="Avg Player Price" value={fmtM(avgPrice)} />
          <MiniStat label="Highest Buy" value={fmtM(highest)} />
          <MiniStat label="Budget / Slot" value={fmtM(remaining / slotsLeft)} />
        </div>
        <div className="grid grid-cols-4 gap-2 mt-4">
          {["gk", "def", "mid", "att"].map(k => (
            <div key={k} className="text-center rounded-lg bg-[#0B111E] py-2">
              <div className="text-sm font-semibold">{rating[k]}</div>
              <div className="text-[10px] text-slate-500 uppercase">{k}</div>
            </div>
          ))}
        </div>
      </div>

      {CATEGORY_ORDER.map(cat => {
        const players = club.squad.filter(p => p.category === cat);
        const [min, max] = RECOMMENDED[cat];
        const ok = players.length >= min;
        return (
          <div key={cat} className="rounded-xl border border-[#1C2740] bg-[#0F1626] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: POS_COLOR[cat] }} />
                {CATEGORY_LABEL[cat]} <span className="text-slate-500 font-normal">({players.length})</span>
              </div>
              {!ok && <span className="text-[11px] text-[#FF6B81]">Below recommended {min}–{max}</span>}
            </div>
            {players.length === 0 ? (
              <div className="text-xs text-slate-600 italic">No {CATEGORY_LABEL[cat].toLowerCase()} signed yet.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {players.map(p => (
                  <div key={p.id} className="rounded-lg bg-[#0B111E] border border-[#1C2740] p-2.5">
                    <div className="text-xs font-medium truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-500">{p.pos} · Age {p.age} · OVR {p.rating}</div>
                    <div className="text-[11px] mt-1 font-semibold" style={{ color: "#E8C547" }}>{fmtM(p.pricePaid)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-lg bg-[#0B111E] p-2.5">
      <div className="text-sm font-semibold">{value}</div>
      <div className="text-[10px] text-slate-500">{label}</div>
    </div>
  );
}

/* =========================================================
   PLAYERS TAB
   ========================================================= */
function PlayersTab({ auction, filter, setFilter }) {
  const soldMap = {};
  auction.transferHistory.forEach(r => { soldMap[r.player] = r; });
  const unsoldNames = new Set(auction.unsoldPool.map(p => p.name));

  const list = PLAYERS_DB.filter(p => filter === "ALL" || p.category === filter);

  return (
    <div className="pb-6">
      <div className="flex gap-2 overflow-x-auto pb-3">
        {["ALL", ...CATEGORY_ORDER].map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className="px-3 py-1.5 rounded-full text-xs whitespace-nowrap border"
            style={{ borderColor: filter === c ? "#E8C547" : "#1C2740", color: filter === c ? "#E8C547" : "#8896B3", background: filter === c ? "#E8C54718" : "transparent" }}>
            {c === "ALL" ? "All Players" : CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {list.map(p => {
          const sold = soldMap[p.name];
          const unsold = unsoldNames.has(p.name);
          return (
            <div key={p.id} className="rounded-lg border border-[#1C2740] bg-[#0F1626] p-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{NAT_FLAG[p.nat] || ""} {p.name}</div>
                <div className="text-[11px] text-slate-500">{p.pos} · OVR {p.rating} · {fmtM(p.marketValue)} value</div>
              </div>
              {sold ? (
                <span className="text-[10px] px-2 py-1 rounded-full flex-shrink-0" style={{ background: "#132A1E", color: "#4ADE80" }}>SOLD {fmtM(sold.fee)}</span>
              ) : unsold ? (
                <span className="text-[10px] px-2 py-1 rounded-full flex-shrink-0" style={{ background: "#1C2740", color: "#8896B3" }}>UNSOLD</span>
              ) : (
                <span className="text-[10px] px-2 py-1 rounded-full flex-shrink-0" style={{ background: "#0B111E", color: "#63708C" }}>IN POOL</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   HISTORY TAB
   ========================================================= */
function HistoryTab({ history, filter, setFilter, clubs }) {
  const filtered = history.filter(r =>
    (filter.club === "ALL" || r.to === filter.club) &&
    (filter.category === "ALL" || r.category === filter.category)
  );
  return (
    <div className="pb-6">
      <div className="flex flex-wrap gap-2 mb-4">
        <select value={filter.club} onChange={e => setFilter(f => ({ ...f, club: e.target.value }))}
          className="bg-[#0F1626] border border-[#1C2740] rounded-lg text-xs px-3 py-2 text-slate-300">
          <option value="ALL">All Clubs</option>
          {clubs.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <select value={filter.category} onChange={e => setFilter(f => ({ ...f, category: e.target.value }))}
          className="bg-[#0F1626] border border-[#1C2740] rounded-lg text-xs px-3 py-2 text-slate-300">
          <option value="ALL">All Positions</option>
          {CATEGORY_ORDER.map(c => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
        </select>
      </div>
      <div className="rounded-xl border border-[#1C2740] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0F1626] text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-3 py-2">Player</th>
              <th className="text-left px-3 py-2 hidden sm:table-cell">From</th>
              <th className="text-left px-3 py-2">To</th>
              <th className="text-right px-3 py-2">Fee</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="text-center py-6 text-slate-600 text-xs">No transfers recorded yet.</td></tr>
            )}
            {filtered.map(r => (
              <tr key={r.id} className="border-t border-[#1C2740]">
                <td className="px-3 py-2">{r.player} <span className="text-slate-600 text-xs">{r.pos}</span></td>
                <td className="px-3 py-2 hidden sm:table-cell text-slate-500">{r.from}</td>
                <td className="px-3 py-2">{r.to}</td>
                <td className="px-3 py-2 text-right font-semibold" style={{ color: "#E8C547" }}>{fmtM(r.fee)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================
   STATS TAB
   ========================================================= */
function StatsTab({ auction }) {
  const history = auction.transferHistory;
  if (history.length === 0) {
    return <div className="text-center py-16 text-slate-600 text-sm">Statistics will appear once players start selling.</div>;
  }
  const mostExpensive = history.reduce((m, r) => r.fee > m.fee ? r : m, history[0]);
  const byClub = {};
  history.forEach(r => { byClub[r.to] = (byClub[r.to] || 0) + r.fee; });
  const highestSpender = Object.entries(byClub).sort((a, b) => b[1] - a[1])[0];
  const bargain = history.reduce((m, r) => {
    const player = PLAYERS_DB.find(p => p.name === r.player);
    const premium = (r.fee - player.marketValue) / player.marketValue;
    return premium < m.premium ? { r, premium } : m;
  }, { r: history[0], premium: Infinity });
  const mostActive = auction.clubs.reduce((m, c) => c.bids > m.bids ? c : m, auction.clubs[0]);
  const byCategory = {};
  history.forEach(r => { byCategory[r.category] = (byCategory[r.category] || 0) + r.fee; });
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  const totalSpent = history.reduce((s, r) => s + r.fee, 0);
  const avgPrice = totalSpent / history.length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-6">
      <StatCard label="Most Expensive Player" value={mostExpensive.player} sub={fmtM(mostExpensive.fee)} />
      <StatCard label="Highest Spending Club" value={highestSpender[0]} sub={fmtM(highestSpender[1])} />
      <StatCard label="Biggest Bargain" value={bargain.r.player} sub={`${Math.abs(bargain.premium * 100).toFixed(0)}% under value`} />
      <StatCard label="Most Active Club" value={mostActive.name} sub={`${mostActive.bids} bids placed`} />
      <StatCard label="Most Expensive Position" value={CATEGORY_LABEL[topCategory[0]]} sub={fmtM(topCategory[1])} />
      <StatCard label="Average Player Price" value={fmtM(avgPrice)} sub={`${history.length} sold`} />
      <StatCard label="Total Money Spent" value={fmtM(totalSpent)} sub="across all clubs" />
      <StatCard label="Unsold Players" value={auction.unsoldPool.length} sub={auction.isFinalRound ? "in final round" : "awaiting final round"} />
      <StatCard label="Players Remaining" value={auction.queue.length} sub="left in current round" />
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-[#1C2740] bg-[#0F1626] p-4">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-lg font-bold mt-1 truncate">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
    </div>
  );
}

/* =========================================================
   CLUB MODAL
   ========================================================= */
function ClubModal({ club, onClose }) {
  if (!club) return null;
  const rating = squadRating(club.squad);
  return (
    <div className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-[#1C2740] bg-[#0F1626] p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ background: club.color, color: "#0A0E1A" }}>{club.short}</div>
            <div>
              <div className="font-bold">{club.name}</div>
              <div className="text-xs text-slate-500">{club.label}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18} /></button>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <MiniStat label="Remaining" value={fmtM(club.budget - club.spent)} />
          <MiniStat label="Spent" value={fmtM(club.spent)} />
          <MiniStat label="Rating" value={rating.overall} />
        </div>
        <div className="space-y-1.5">
          {club.squad.length === 0 && <div className="text-xs text-slate-600 italic">No players signed yet.</div>}
          {club.squad.map(p => (
            <div key={p.id} className="flex justify-between text-sm py-1.5 border-b border-[#1C2740]">
              <span>{p.name} <span className="text-slate-600 text-xs">{p.pos}</span></span>
              <span style={{ color: "#E8C547" }}>{fmtM(p.pricePaid)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   RESULTS SCREEN
   ========================================================= */
function ResultsScreen({ clubs, history, onRestart }) {
  const ranked = clubs.map(c => ({
    ...c,
    rating: squadRating(c.squad),
    squadValue: c.squad.reduce((s, p) => s + p.marketValue, 0),
  })).sort((a, b) => b.rating.overall - a.rating.overall);

  const [expanded, setExpanded] = useState(null);

  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif" }} className="min-h-screen bg-[#0A0E1A] text-slate-100 px-4 py-10">
      <GlobalStyle />
      <div className="max-w-3xl mx-auto text-center mb-8">
        <div className="text-xs uppercase tracking-widest text-[#E8C547] mb-2" style={{ letterSpacing: "0.12em" }}>Transfer Window Closed</div>
        <h1 className="text-4xl font-bold">Auction Complete</h1>
        <p className="text-slate-400 mt-2 text-sm">{history.length} players sold across the window.</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {ranked.map((c, i) => {
          const medal = ["🥇", "🥈", "🥉"][i] || `#${i + 1}`;
          const below = c.squad.length < MIN_SQUAD;
          return (
            <div key={c.id} className="rounded-xl border border-[#1C2740] bg-[#0F1626] overflow-hidden">
              <button onClick={() => setExpanded(expanded === c.id ? null : c.id)} className="w-full text-left p-4 flex items-center gap-4">
                <div className="text-2xl w-10 text-center">{medal}</div>
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0" style={{ background: c.color, color: "#0A0E1A" }}>{c.short}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold flex items-center gap-2 truncate">
                    {c.name} {c.isUser && <span className="text-[10px] text-[#E8C547]">(You)</span>}
                  </div>
                  <div className="text-xs text-slate-500">
                    Squad Value {fmtM(c.squadValue)} · Spent {fmtM(c.spent)} · {c.squad.length} players
                    {below && <span className="text-[#FF6B81]"> · squad requirement not fulfilled (min {MIN_SQUAD})</span>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xl font-bold" style={{ color: "#E8C547" }}>{c.rating.overall}</div>
                  <div className="text-[10px] text-slate-500">Rating</div>
                </div>
              </button>
              {expanded === c.id && (
                <div className="px-4 pb-4 border-t border-[#1C2740] pt-3">
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {["gk", "def", "mid", "att"].map(k => (
                      <div key={k} className="text-center rounded-lg bg-[#0B111E] py-2">
                        <div className="text-sm font-semibold">{c.rating[k]}</div>
                        <div className="text-[10px] text-slate-500 uppercase">{k}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1 max-h-56 overflow-y-auto">
                    {c.squad.map(p => (
                      <div key={p.id} className="flex justify-between text-sm py-1">
                        <span>{p.name} <span className="text-slate-600 text-xs">{p.pos}</span></span>
                        <span className="text-slate-400">{fmtM(p.pricePaid)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center mt-10">
        <button onClick={onRestart} className="px-6 py-3 rounded-full font-semibold text-sm inline-flex items-center gap-2" style={{ background: "#E8C547", color: "#0A0E1A" }}>
          <ChevronLeft size={15} /> Start a New Auction
        </button>
      </div>
    </div>
  );
}
