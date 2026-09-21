import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://cgrvzbcfysmoixmvtrod.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncnZ6YmNmeXNtb2l4bXZ0cm9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NDUwOTksImV4cCI6MjA5NjAyMTA5OX0.U9YLZGNSMjEyaIduAs0e7V-ZD7QM7KEBb4G7erIP0Ks";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// UPDATE SINI TIAP GANTI BULAN (awal bulan, sebelum ada yang isi)
// ============================================================
const TEAM = [
  { name: "Pak Aldi", division: "CEO" },
  { name: "Yeni", division: "Finance" },
  { name: "Ghina", division: "PM" },
  { name: "Naila", division: "Brevet" },
  { name: "Zia", division: "MMBA" },
  { name: "Ella", division: "MMBA" },
  { name: "Hana", division: "DBE" },
  { name: "Dimas", division: "DBE" },
  { name: "Zara", division: "DBS" },
  { name: "Wesy", division: "DBS" },
  { name: "Farhan", division: "Design" },
  { name: "Zaradiva", division: "Design" },
  { name: "Fery", division: "Design" },
  { name: "Rizal", division: "Design" },
  { name: "Intan", division: "Design" },
];

const DIVISIONS = ["DBE", "MMBA", "DBS", "Brevet", "Design"];
// ============================================================

const PERSONAL_PARAMS = [
  "Tidak menyindir / tidak pasif agresif",
  "Berani menyatakan tidak/tidak bisa/butuh waktu dengan alasan rasional",
  "Menjaga nada suara profesional, netral, dan respectful",
  "Jujur tentang kebutuhan waktu, bantuan, informasi",
  "Menjaga jam kerja dan jeda",
  "Tidak defensif ketika menerima kritik",
  "Tidak mengomentari personal (fokus pada proses, bukan orang)",
  "Fokus pada perbaikan & solusi, menyampaikan data apa adanya",
  "Mengingatkan kepada kebaikan",
  "Aktif improve skill",
  "Tidak melakukan pelanggaran asertivitas",
  "Zero conflict",
  "100% clear direction (paham amanah, tidak iya-iya aja)",
];

const DIVISION_PARAMS = [
  "Improve sistem yang workable (ada perbaikan sistem kerja dari tim)",
  "Team zero stress – suasana kerja tenang dan bebas tekanan negatif",
  "Memberikan update kerja secara rutin dan jelas",
  "Saat diskusi, tidak mengganggu divisi lain",
  "Mencapai target yang ditetapkan (mingguan, bulanan, tahunan)",
  "Zero pelanggaran SOP dan kualitas",
  "Menerima saran & perubahan sistem dari divisi lain (adaptive)",
  "Pembagian sistem kerja/tugas yang sesuai",
  "Improve kompetensi",
  "Divisi lain tidak takut bertanya atau koordinasi",
  "Laporan apa adanya, tidak ditutupi",
  "Tidak ada gosip antardivisi",
  "Divisi aktif memberi pengingat positif",
  "Inisiatif tinggi dalam kolaborasi antar divisi",
  "Tidak menolak tugas lintas divisi tanpa alasan jelas",
  "Zero pasif-agresif dan zero agresif (intra & antar divisi)",
  "Zero Conflict – menyelesaikan potensi konflik dengan cepat",
];

const SCORE_LABELS = { 1: "Belum terlihat", 2: "Mulai terlihat", 3: "Terlihat tapi labil", 4: "Terlihat dan stabil", 5: "Teladan" };
const SCORE_COLORS = { 1: "#f87171", 2: "#fb923c", 3: "#fbbf24", 4: "#34d399", 5: "#818cf8" };

const T = {
  bg: "#f5fbf6",
  bgCard: "#ffffff",
  bgCardAlt: "#edf8ef",
  border: "#a8d5b5",
  borderLight: "#dcefe1",
  text: "#245237",
  textSub: "#4d8060",
  textMuted: "#8bb59a",
  purple: "#5e9f72",
  purpleDark: "#2f6b45",
  purpleLight: "#e2f3e6",
  grad: "linear-gradient(135deg, #86c99b, #5fae78, #3f8d5a)",
  gradBtn: "linear-gradient(135deg, #78bc8b, #4f9b68)",
};

const getCurrentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const getMonthLabel = (ym) => {
  const [y, m] = ym.split("-");
  const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  return `${months[parseInt(m) - 1]} ${y}`;
};

function seededRandom(seed) {
  let s = seed >>> 0;
  return function() {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

// Generate assignment — hanya dipakai kalau belum ada di Supabase
function generateAssignments(yearMonth) {
  const [y, m] = yearMonth.split("-").map(Number);
  const seed = y * 100 + m + 42;
  const rng = seededRandom(seed);
  const shuffled = [...TEAM].sort(() => rng() - 0.5);
  const n = shuffled.length;
  const assignments = {};
  shuffled.forEach((person, i) => {
    assignments[person.name] = [];
    for (let j = 1; j <= 4; j++) {
      assignments[person.name].push(shuffled[(i + j) % n].name);
    }
  });
  return assignments;
}

const STORAGE_KEY = "assertif_progress_v1";

export default function App() {
  const [view, setView] = useState("home");
  const [step, setStep] = useState(0);
  const [raterName, setRaterName] = useState("");
  const [assignment, setAssignment] = useState([]);
  const [currentRateeIdx, setCurrentRateeIdx] = useState(0);
  const [currentDivIdx, setCurrentDivIdx] = useState(0);
  const [allPersonalScores, setAllPersonalScores] = useState({});
  const [divisionScores, setDivisionScores] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [leaderboard, setLeaderboard] = useState({ persons: [], divisions: [] });
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [allMonths, setAllMonths] = useState([getCurrentMonth()]);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [divisionAlreadyDone, setDivisionAlreadyDone] = useState(false);
  const [statusList, setStatusList] = useState({ submitted: [], notSubmitted: [] });
  const [statusLoading, setStatusLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [lockedAssignments, setLockedAssignments] = useState(null); // assignment yang tersimpan di Supabase

  // Load saved progress on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.month === getCurrentMonth() && !data.done) {
          setView(data.view || "home");
          setStep(data.step || 0);
          setRaterName(data.raterName || "");
          setAssignment(data.assignment || []);
          setCurrentRateeIdx(data.currentRateeIdx || 0);
          setCurrentDivIdx(data.currentDivIdx || 0);
          setAllPersonalScores(data.allPersonalScores || {});
          setDivisionScores(data.divisionScores || {});
        }
      }
    } catch (e) { console.error(e); }
    setHydrated(true);
  }, []);

  // Save progress ke localStorage
  useEffect(() => {
    if (!hydrated) return;
    if (step === 0 && !raterName) { localStorage.removeItem(STORAGE_KEY); return; }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        month: getCurrentMonth(), view, step, raterName, assignment,
        currentRateeIdx, currentDivIdx, allPersonalScores, divisionScores, done,
      }));
    } catch (e) { console.error(e); }
  }, [hydrated, view, step, raterName, assignment, currentRateeIdx, currentDivIdx, allPersonalScores, divisionScores, done]);

  const currentMonth = getCurrentMonth();
  const raterInfo = TEAM.find(p => p.name === raterName);
  const divisionList = raterInfo ? DIVISIONS.filter(d => d !== raterInfo.division) : DIVISIONS;
  const currentRatee = assignment[currentRateeIdx];
  const currentDiv = divisionList[currentDivIdx];

  // Load locked assignments dari Supabase (biar konsisten sepanjang bulan)
  useEffect(() => {
    const loadLockedAssignments = async () => {
      const { data } = await supabase.from("monthly_assignments").select("assignments").eq("month", currentMonth).limit(1);
      if (data && data.length > 0) {
        setLockedAssignments(data[0].assignments);
      } else {
        // Belum ada — generate dan simpan ke Supabase (dikerjakan pas ada yang login pertama kali)
        const generated = generateAssignments(currentMonth);
        await supabase.from("monthly_assignments").insert({ month: currentMonth, assignments: generated });
        setLockedAssignments(generated);
      }
    };
    loadLockedAssignments();
  }, []);

  const getAssignmentFor = (name) => {
    const source = lockedAssignments || generateAssignments(currentMonth);
    return (source[name] || []).map(n => TEAM.find(p => p.name === n)).filter(Boolean);
  };

  // Preview assignment di step 0
  const previewAssignment = raterName ? getAssignmentFor(raterName) : [];

  useEffect(() => { if (view === "leaderboard") fetchLeaderboard(); }, [view, selectedMonth]);
  useEffect(() => { if (view === "status") fetchStatus(); }, [view]);

  // Cek sudah submit bulan ini
  useEffect(() => {
    if (raterName) {
      supabase.from("submissions").select("id").eq("month", currentMonth).eq("rater", raterName).limit(1)
        .then(({ data }) => setAlreadySubmitted(data && data.length > 0));
      supabase.from("division_scores").select("id").eq("month", currentMonth).eq("rater", raterName).limit(1)
        .then(({ data }) => setDivisionAlreadyDone(data && data.length > 0));
    }
  }, [raterName]);

  const fetchStatus = async () => {
    setStatusLoading(true);
    try {
      const { data } = await supabase.from("submissions").select("rater").eq("month", currentMonth);
      const submittedNames = [...new Set((data || []).map(s => s.rater))];
      const submitted = TEAM.filter(p => submittedNames.includes(p.name));
      const notSubmitted = TEAM.filter(p => !submittedNames.includes(p.name));
      setStatusList({ submitted, notSubmitted });
    } catch (e) { console.error(e); }
    setStatusLoading(false);
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data: subs } = await supabase.from("submissions").select("*").eq("month", selectedMonth);
      const { data: divs } = await supabase.from("division_scores").select("*").eq("month", selectedMonth);
      const { data: allSubs } = await supabase.from("submissions").select("month");

      const personMap = {};
      (subs || []).forEach(s => {
        if (!personMap[s.ratee]) personMap[s.ratee] = { total: 0, count: 0 };
        const vals = Object.values(s.personal_scores);
        personMap[s.ratee].total += vals.reduce((a, b) => a + b, 0) / vals.length;
        personMap[s.ratee].count++;
      });
      const persons = Object.entries(personMap)
        .map(([name, d]) => ({ name, avg: d.count ? d.total / d.count : 0, count: d.count }))
        .sort((a, b) => b.avg - a.avg);

      const divMap = {};
      (divs || []).forEach(d => {
        Object.entries(d.division_scores).forEach(([div, scores]) => {
          if (!divMap[div]) divMap[div] = { total: 0, count: 0 };
          const arr = Object.values(scores);
          divMap[div].total += arr.reduce((a, b) => a + b, 0) / arr.length;
          divMap[div].count++;
        });
      });
      const divisions = Object.entries(divMap)
        .map(([name, d]) => ({ name, avg: d.count ? d.total / d.count : 0, count: d.count }))
        .sort((a, b) => b.avg - a.avg);

      setLeaderboard({ persons, divisions });
      const months = [...new Set((allSubs || []).map(s => s.month))].sort().reverse();
      if (months.length) setAllMonths([...new Set([currentMonth, ...months])]);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const startForm = () => {
    const assign = getAssignmentFor(raterName);
    setAssignment(assign);
    const initP = {};
    assign.forEach(p => { initP[p.name] = Array(PERSONAL_PARAMS.length).fill(0); });
    setAllPersonalScores(initP);
    const initD = {};
    divisionList.forEach(d => { initD[d] = Array(DIVISION_PARAMS.length).fill(0); });
    setDivisionScores(initD);
    setCurrentRateeIdx(0); setCurrentDivIdx(0); setStep(1);
  };

  const submitAll = async () => {
    setLoading(true);
    try {
      for (const ratee of assignment) {
        const scoreObj = {};
        (allPersonalScores[ratee.name] || []).forEach((s, i) => { scoreObj[i] = s; });
        await supabase.from("submissions").insert({ month: currentMonth, rater: raterName, ratee: ratee.name, room: ratee.division, personal_scores: scoreObj });
      }
      const { data: existingDiv } = await supabase.from("division_scores").select("id").eq("month", currentMonth).eq("rater", raterName).limit(1);
      if (!existingDiv || existingDiv.length === 0) {
        const divObj = {};
        Object.entries(divisionScores).forEach(([div, scores]) => {
          const scoreObj = {};
          scores.forEach((s, i) => { scoreObj[i] = s; });
          divObj[div] = scoreObj;
        });
        await supabase.from("division_scores").insert({ month: currentMonth, rater: raterName, rater_division: raterInfo?.division || "", division_scores: divObj });
      }
      setDone(true);
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) { alert("Error: " + e.message); }
    setLoading(false);
  };

  const resetForm = () => {
    setStep(0); setRaterName(""); setAssignment([]);
    setCurrentRateeIdx(0); setCurrentDivIdx(0);
    setAllPersonalScores({}); setDivisionScores({}); setDone(false);
    setAlreadySubmitted(false); setDivisionAlreadyDone(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  const currentPersonalScores = currentRatee ? (allPersonalScores[currentRatee.name] || Array(PERSONAL_PARAMS.length).fill(0)) : [];
  const setCurrentPersonalScore = (i, val) => {
    setAllPersonalScores(prev => { const u = [...(prev[currentRatee.name] || Array(PERSONAL_PARAMS.length).fill(0))]; u[i] = val; return { ...prev, [currentRatee.name]: u }; });
  };
  const currentDivScores = currentDiv ? (divisionScores[currentDiv] || Array(DIVISION_PARAMS.length).fill(0)) : [];
  const setCurrentDivScore = (i, val) => {
    setDivisionScores(prev => { const u = [...(prev[currentDiv] || Array(DIVISION_PARAMS.length).fill(0))]; u[i] = val; return { ...prev, [currentDiv]: u }; });
  };

  const canNextPersonal = currentPersonalScores.every(s => s > 0);
  const canNextDiv = currentDivScores.every(s => s > 0);

  const NavBtn = ({ v, label }) => (
    <button onClick={() => setView(v)} style={{
      padding: "8px 16px",
      borderRadius: 20,
      fontSize: 13,
      fontWeight: 700,
      border: "none",
      cursor: "pointer",
      background: view === v ? "#a9d8b6" : "transparent",
      color: view === v ? "#ffffff" : T.textMuted,
      boxShadow: view === v ? "0 2px 8px rgba(79,155,104,0.28)" : "none",
    }}>{label}</button>
  );

  const ScoreRow = ({ label, index, scores, setScore }) => (
    <div style={{ padding: "14px 0", borderBottom: `1px solid ${T.borderLight}` }}>
      <div style={{ fontSize: 13, color: T.textSub, marginBottom: 10, lineHeight: 1.6 }}>
        <span style={{ color: T.textMuted, marginRight: 6, fontSize: 11 }}>{index + 1}.</span>{label}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {[1,2,3,4,5].map(s => (
          <button type="button" key={s} onClick={(e) => { e.preventDefault(); e.currentTarget.blur(); setScore(index, s); }} style={{
            flex: 1, padding: "11px 0", borderRadius: 10,
            border: scores[index] === s ? `2px solid ${SCORE_COLORS[s]}` : `1px solid ${T.borderLight}`,
            background: scores[index] === s ? `${SCORE_COLORS[s]}22` : T.bgCardAlt,
            color: scores[index] === s ? SCORE_COLORS[s] : T.textMuted,
            fontSize: 16, fontWeight: 800, cursor: "pointer",
          }}>{s}</button>
        ))}
      </div>
      {scores[index] > 0 && <div style={{ fontSize: 11, color: SCORE_COLORS[scores[index]], marginTop: 6, fontWeight: 600 }}>→ {SCORE_LABELS[scores[index]]}</div>}
    </div>
  );

  const RankCard = ({ item, rank }) => (
    <div style={{
      background: rank === 1 ? "linear-gradient(135deg, #f4fbf5, #e7f5eb)" : T.bgCard,
      border: `1px solid ${rank === 1 ? T.border : T.borderLight}`,
      borderRadius: 14, padding: "14px 16px", marginBottom: 8,
      display: "flex", alignItems: "center", gap: 14,
      boxShadow: rank === 1 ? "0 4px 20px rgba(79,155,104,0.14)"  : "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      <div style={{ width: 32, textAlign: "center", fontSize: rank <= 3 ? 22 : 13, color: "#c4a8d9", fontWeight: 700 }}>
        {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{item.name}</div>
        <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{item.count} penilaian masuk</div>
        <div style={{ height: 4, background: T.borderLight, borderRadius: 99, marginTop: 8, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(item.avg / 5) * 100}%`, background: T.gradBtn, borderRadius: 99, transition: "width 0.6s ease" }} />
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: T.purple, lineHeight: 1 }}>{item.avg.toFixed(1)}</div>
        <div style={{ fontSize: 10, color: T.textMuted }}>/5.0</div>
      </div>
    </div>
  );

  const PrimaryBtn = ({ onClick, disabled, children }) => (
    <button onClick={onClick} disabled={disabled} style={{
      flex: 1, width: "100%", padding: "15px", borderRadius: 14, border: "none",
      background: disabled ? T.borderLight : T.gradBtn,
      color: disabled ? T.textMuted : "#fff",
      fontSize: 15, fontWeight: 700, cursor: disabled ? "default" : "pointer",
      boxShadow: disabled ? "none" : "0 4px 16px rgba(79,155,104,0.28)",
    }}>{children}</button>
  );

  const BackBtn = ({ onClick }) => (
    <button onClick={onClick} style={{ padding: "15px 18px", borderRadius: 14, border: `1px solid ${T.border}`, background: T.bgCardAlt, color: T.textSub, fontSize: 14, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>← Back</button>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Sora', 'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "rgba(253,246,255,0.92)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${T.borderLight}`, padding: "14px 20px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 800, background: T.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>✦ Assertif Award</div>
          <div style={{ display: "flex", gap: 4 }}>
            <NavBtn v="home" label="Home" />
            <NavBtn v="form" label="Nilai" />
            <NavBtn v="leaderboard" label="Ranking" />
            <NavBtn v="status" label="Status" />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px 100px" }}>

        {/* HOME */}
        {view === "home" && (
          <div>
            <div style={{ textAlign: "center", padding: "44px 0 36px" }}>
              <div style={{ width: 80, height: 80, borderRadius: 24, background: T.grad, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, boxShadow: "0 8px 32px rgba(196,181,253,0.4)" }}>🏆</div>
              <h1 style={{ fontSize: 30, fontWeight: 900, margin: "0 0 10px", letterSpacing: "-1px", background: T.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Assertif Award</h1>
              <p style={{ color: T.textSub, fontSize: 14, margin: "0 0 16px" }}>Penilaian asertivitas bulanan tim</p>
              <span style={{ display: "inline-block", padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: T.purpleLight, color: T.purple, border: `1px solid ${T.border}` }}>
                🗓 {getMonthLabel(currentMonth)}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[["16", "Anggota", "👥"], ["5", "Divisi", "🏢"], ["4", "Dinilai/orang", "⭐"]].map(([n, l, icon]) => (
                <div key={l} style={{ background: T.bgCard, border: `1px solid ${T.borderLight}`, borderRadius: 14, padding: "16px 8px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: T.purple }}>{n}</div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>

            <div style={{ background: T.bgCard, border: `1px solid ${T.borderLight}`, borderRadius: 16, padding: "20px", marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16 }}>Cara Kerja</div>
              {[
                ["🗓️", "Assignment berputar tiap bulan", "Sistem otomatis tentukan siapa yang kamu nilai — 4 orang, beda tiap bulan, semua dapat penilaian yang sama"],
                ["⭐", "Nilai 1–5 per parameter", "13 parameter personal + 17 parameter divisi"],
                ["⚖️", "Fair & konsisten", "Semua orang dinilai oleh tepat 4 orang, dinormalisasi di leaderboard"],
                ["📊", "Ranking real-time", "Lihat leaderboard person & divisi terbaik tiap bulan"],
              ].map(([icon, title, desc]) => (
                <div key={title} style={{ display: "flex", gap: 14, marginBottom: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: T.purpleLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{title}</div>
                    <div style={{ fontSize: 12, color: T.textSub, marginTop: 2, lineHeight: 1.5 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setView("form")} style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", background: T.gradBtn, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(79,155,104,0.28)" }}>
              Mulai Nilai Sekarang 🌸
            </button>
          </div>
        )}

        {/* FORM */}
        {view === "form" && (
          <div>
            {done ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
                <h2 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 10px", color: T.text }}>Selesai!</h2>
                <p style={{ color: T.textSub, marginBottom: 6 }}>Kamu menilai <strong style={{ color: T.purple }}>{assignment.length} orang</strong></p>
                <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 32 }}>Sampai bulan depan! 🙌</p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={resetForm} style={{ flex: 1, padding: "15px", borderRadius: 14, border: `1px solid ${T.border}`, background: T.bgCardAlt, color: T.textSub, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Kembali</button>
                  <button onClick={() => setView("leaderboard")} style={{ flex: 1, padding: "15px", borderRadius: 14, border: "none", background: T.gradBtn, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(79,155,104,0.28)" }}>Lihat Ranking →</button>
                </div>
              </div>

            ) : step === 0 ? (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 6, color: T.text }}>Halo! Siapa kamu? 👋</h2>
                <p style={{ color: T.textSub, fontSize: 13, marginBottom: 24 }}>Pilih namamu untuk lihat assignment bulan {getMonthLabel(currentMonth)}</p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                  {TEAM.map(p => (
                    <button key={p.name} onClick={() => setRaterName(p.name)} style={{
                      padding: "9px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer",
                      border: raterName === p.name ? `2px solid ${T.purple}` : `1px solid ${T.borderLight}`,
                      background: raterName === p.name ? T.purpleLight : T.bgCard,
                      color: raterName === p.name ? T.purpleDark : T.textSub,
                      boxShadow: raterName === p.name ? "0 2px 8px rgba(79,155,104,0.22)" : "none",
                    }}>{p.name}</button>
                  ))}
                </div>

                {raterName && (
                  <div style={{ background: "linear-gradient(135deg, #f4fbf5, #e7f5eb)", border: `1px solid ${T.border}`, borderRadius: 14, padding: "16px", marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: T.purple, fontWeight: 700, marginBottom: 10 }}>
                      ✨ Assignment {getMonthLabel(currentMonth)} untuk {raterName}:
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {previewAssignment.map(p => (
                        <span key={p.name} style={{ fontSize: 12, padding: "4px 12px", background: "#fff", border: `1px solid ${T.borderLight}`, borderRadius: 20, color: T.textSub }}>
                          {p.name} <span style={{ color: T.textMuted, fontSize: 10 }}>({p.division})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {alreadySubmitted && raterName && (
                  <div style={{ background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#92400e", fontWeight: 600 }}>
                    ⚠️ Kamu sudah mengisi penilaian bulan {getMonthLabel(currentMonth)}!
                  </div>
                )}

                <button disabled={!raterName || alreadySubmitted} onClick={startForm} style={{
                  width: "100%", padding: "15px", borderRadius: 14, border: "none",
                  background: (!raterName || alreadySubmitted) ? T.borderLight : T.gradBtn,
                  color: (!raterName || alreadySubmitted) ? T.textMuted : "#fff",
                  fontSize: 15, fontWeight: 700, cursor: (!raterName || alreadySubmitted) ? "default" : "pointer",
                  boxShadow: (!raterName || alreadySubmitted) ? "none" : "0 4px 16px rgba(79,155,104,0.28)",
                }}>
                  {alreadySubmitted ? "Sudah diisi bulan ini ✓" : "Lanjut →"}
                </button>
              </div>

            ) : step === 1 ? (
              <div>
                <div style={{ background: "linear-gradient(135deg, #f4fbf5, #e7f5eb)", border: `1px solid ${T.border}`, borderRadius: 14, padding: "16px", marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>Penilaian Personal {currentRateeIdx + 1} / {assignment.length}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: T.text }}>{currentRatee?.name}</div>
                  <div style={{ fontSize: 12, color: T.textSub, marginTop: 2 }}>{currentRatee?.division}</div>
                  <div style={{ height: 6, background: T.borderLight, borderRadius: 99, marginTop: 12, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(currentPersonalScores.filter(s => s > 0).length / PERSONAL_PARAMS.length) * 100}%`, background: T.gradBtn, borderRadius: 99, transition: "width 0.2s" }} />
                  </div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 6 }}>{currentPersonalScores.filter(s => s > 0).length}/{PERSONAL_PARAMS.length} parameter dinilai</div>
                </div>
                {PERSONAL_PARAMS.map((p, i) => <ScoreRow key={i} label={p} index={i} scores={currentPersonalScores} setScore={setCurrentPersonalScore} />)}
                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  <BackBtn onClick={() => currentRateeIdx > 0 ? setCurrentRateeIdx(currentRateeIdx - 1) : setStep(0)} />
                  <PrimaryBtn disabled={!canNextPersonal || loading} onClick={() => {
                    if (currentRateeIdx < assignment.length - 1) { setCurrentRateeIdx(currentRateeIdx + 1); return; }
                    if (divisionAlreadyDone) { submitAll(); } else { setStep(2); }
                  }}>
                    {loading ? "Menyimpan... 🌸" : currentRateeIdx < assignment.length - 1 ? `Orang ${currentRateeIdx + 2}/${assignment.length} →` : (divisionAlreadyDone ? "Kirim ✓ (Divisi sudah tersimpan)" : "Lanjut ke Divisi →")}
                  </PrimaryBtn>
                </div>
              </div>

            ) : step === 2 ? (
              <div>
                <div style={{ background: "linear-gradient(135deg, #f0fdf4, #e7f5eb)", border: "1px solid #bbf7d0", borderRadius: 14, padding: "16px", marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>Penilaian Divisi {currentDivIdx + 1} / {divisionList.length}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: T.text }}>Divisi {currentDiv}</div>
                  <div style={{ fontSize: 12, color: T.textSub, marginTop: 2 }}>Nilai perilaku tim secara keseluruhan</div>
                  <div style={{ height: 6, background: T.borderLight, borderRadius: 99, marginTop: 12, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(currentDivScores.filter(s => s > 0).length / DIVISION_PARAMS.length) * 100}%`, background: "linear-gradient(90deg, #34d399, #818cf8)", borderRadius: 99, transition: "width 0.2s" }} />
                  </div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 6 }}>{currentDivScores.filter(s => s > 0).length}/{DIVISION_PARAMS.length} parameter dinilai</div>
                </div>
                {DIVISION_PARAMS.map((p, i) => <ScoreRow key={i} label={p} index={i} scores={currentDivScores} setScore={setCurrentDivScore} />)}
                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  <BackBtn onClick={() => currentDivIdx > 0 ? setCurrentDivIdx(currentDivIdx - 1) : setStep(1)} />
                  <PrimaryBtn disabled={!canNextDiv || loading} onClick={() => currentDivIdx < divisionList.length - 1 ? setCurrentDivIdx(currentDivIdx + 1) : submitAll()}>
                    {loading ? "Menyimpan... 🌸" : currentDivIdx < divisionList.length - 1 ? `Divisi ${currentDivIdx + 2}/${divisionList.length} →` : "Kirim Semua ✓"}
                  </PrimaryBtn>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* LEADERBOARD */}
        {view === "leaderboard" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: T.text }}>🏆 Ranking</h2>
              <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.textSub, fontSize: 12, fontWeight: 600 }}>
                {allMonths.map(m => <option key={m} value={m}>{getMonthLabel(m)}</option>)}
              </select>
            </div>
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: T.textMuted }}>Memuat... 🌸</div>
            ) : (
              <>
                <div style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>👤 Most Assertive Person</div>
                {leaderboard.persons.length === 0
                  ? <div style={{ background: T.bgCard, border: `1px solid ${T.borderLight}`, borderRadius: 14, padding: 32, textAlign: "center", color: T.textMuted, marginBottom: 28, fontSize: 13 }}>Belum ada data bulan ini</div>
                  : leaderboard.persons.map((p, i) => <RankCard key={p.name} item={p} rank={i + 1} />)
                }
                <div style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", letterSpacing: 1.5, margin: "28px 0 12px" }}>🏢 Most Assertive Division</div>
                {leaderboard.divisions.length === 0
                  ? <div style={{ background: T.bgCard, border: `1px solid ${T.borderLight}`, borderRadius: 14, padding: 32, textAlign: "center", color: T.textMuted, fontSize: 13 }}>Belum ada data bulan ini</div>
                  : leaderboard.divisions.map((d, i) => <RankCard key={d.name} item={d} rank={i + 1} />)
                }
                <div style={{ marginTop: 20, padding: 14, borderRadius: 12, background: T.purpleLight, border: `1px solid ${T.border}`, fontSize: 12, color: T.textSub, textAlign: "center" }}>
                  ✨ Tiap orang dinilai oleh 4 orang — fair & terkonsisten
                </div>
              </>
            )}
          </div>
        )}

        {/* STATUS */}
        {view === "status" && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 6px", color: T.text }}>📋 Status Pengisian</h2>
            <p style={{ color: T.textSub, fontSize: 13, marginBottom: 20 }}>Siapa yang sudah & belum isi bulan {getMonthLabel(currentMonth)}</p>
            {statusLoading ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: T.textMuted }}>Memuat... 🌸</div>
            ) : (
              <>
                <div style={{ background: T.bgCard, border: `1px solid ${T.borderLight}`, borderRadius: 16, padding: "20px", marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Progress</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: T.purple }}>{statusList.submitted.length}/{TEAM.length}</span>
                  </div>
                  <div style={{ height: 10, background: T.borderLight, borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(statusList.submitted.length / TEAM.length) * 100}%`, background: T.gradBtn, borderRadius: 99, transition: "width 0.6s ease" }} />
                  </div>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#34d399", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>✅ Sudah Isi ({statusList.submitted.length})</div>
                  {statusList.submitted.length === 0
                    ? <div style={{ background: T.bgCard, border: `1px solid ${T.borderLight}`, borderRadius: 14, padding: 20, textAlign: "center", color: T.textMuted, fontSize: 13 }}>Belum ada yang isi</div>
                    : <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {statusList.submitted.map(p => (
                          <span key={p.name} style={{ fontSize: 12, padding: "6px 14px", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 20, color: "#047857", fontWeight: 600 }}>✓ {p.name}</span>
                        ))}
                      </div>
                  }
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#f87171", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>⏳ Belum Isi ({statusList.notSubmitted.length})</div>
                  {statusList.notSubmitted.length === 0
                    ? <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 14, padding: 20, textAlign: "center", color: "#047857", fontSize: 13, fontWeight: 700 }}>🎉 Semua sudah isi!</div>
                    : <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {statusList.notSubmitted.map(p => (
                          <span key={p.name} style={{ fontSize: 12, padding: "6px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 20, color: "#b91c1c", fontWeight: 600 }}>{p.name}</span>
                        ))}
                      </div>
                  }
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
