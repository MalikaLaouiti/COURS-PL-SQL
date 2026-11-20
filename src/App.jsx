import { useState, useRef, useMemo, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Scene from "./Scene";
import { TOPICS } from "./data";
import { CHALLENGES } from "./challenges";

function Challenge({ t, solved, onSolve }) {
  const ch = CHALLENGES[t.id],
    parts = ch.code.split("___");
  const [vals, setVals] = useState(solved ? [...ch.a] : ch.a.map(() => ""));
  const [res, setRes] = useState(solved ? ch.a.map(() => true) : null);
  const [hint, setHint] = useState(false);
  const run = () => {
    const r = ch.a.map(
      (x, i) => vals[i].trim().toUpperCase() === x.toUpperCase(),
    );
    setRes(r);
    if (r.every(Boolean)) onSolve(t.id);
  };
  const good = res && res.every(Boolean);
  return (
    <>
      <p>Complète le code PL/SQL puis exécute-le pour débloquer la suite.</p>
      <pre className="challenge">
        {parts.map((p, i) => (
          <span key={i}>
            {p}
            {i < ch.a.length && (
              <input
                value={vals[i]}
                spellCheck={false}
                autoComplete="off"
                className={res ? (res[i] ? "good" : "bad") : ""}
                style={{ width: Math.max(ch.a[i].length, 4) + 2 + "ch" }}
                placeholder={
                  hint ? ch.a[i][0] + "_".repeat(ch.a[i].length - 1) : ""
                }
                onChange={(e) => {
                  const v = [...vals];
                  v[i] = e.target.value;
                  setVals(v);
                  setRes(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && run()}
              />
            )}
          </span>
        ))}
      </pre>
      <div className="row">
        <button className="run" onClick={run}>
          ▶ Exécuter
        </button>
        <button className="hintbtn" onClick={() => setHint(true)}>
          Indice
        </button>
      </div>
      {res && !good && (
        <p className="err">
          ORA-06550 : erreur de compilation. Vérifie les trous en rouge.
        </p>
      )}
      {good && (
        <>
          <pre className="out">
            {"SQL> /\n" + ch.out + "\n\nProcédure PL/SQL terminée avec succès."}
          </pre>
          <p className="score">
            Défi réussi ! La table suivante est déverrouillée.
          </p>
        </>
      )}
    </>
  );
}

function ResponsiveCamera() {
  const { camera, size } = useThree();

  useEffect(() => {
    const width = size.width;

    if (width < 600) {
      camera.position.set(0, 9, 19);
      camera.fov = 60;
    } else if (width < 900) {
      camera.position.set(0, 7, 16);
      camera.fov = 52;
    } else {
      camera.position.set(0, 6, 13);
      camera.fov = 55;
    }

    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  return null;
}

function Panel({ t, onClose, onSolve, solved }) {
  const [tab, setTab] = useState("d");
  const [ans, setAns] = useState({});

  const score = Object.entries(ans).filter(
    ([k, v]) => t.quiz[k][2] === v,
  ).length;
  const answered = Object.keys(ans).length === t.quiz.length;
  const passed = answered && score === t.quiz.length;

  // Enregistre la réponse et débloque la suite si le quiz est 100 % juste
  const answer = (qi, oi) => {
    const next = { ...ans, [qi]: oi };
    setAns(next);
    const all = Object.keys(next).length === t.quiz.length;
    if (all && t.quiz.every(([, , good], k) => next[k] === good)) onSolve(t.id);
  };
  return (
    <aside className="panel" style={{ "--c": t.color }}>
      <button className="close" onClick={onClose} aria-label="Fermer">
        ×
      </button>
      <h2>{t.title}</h2>

      <div className="tabs">
        {[
          ["d", "Détails"],
          ["e", "Exemple"],
          ["c", "Défi"],
          ["q", "Quiz"],
        ].map(([k, l]) => (
          <button
            key={k}
            className={tab === k ? "on" : ""}
            onClick={() => setTab(k)}
          >
            {l}
          </button>
        ))}
      </div>
      {tab === "d" && t.details.map((p, i) => <p key={i}>{p}</p>)}
      {tab === "e" && (
        <pre>
          <code>{t.code}</code>
        </pre>
      )}
      {tab === "c" && <Challenge t={t} solved={solved} onSolve={onSolve} />}
      {tab === "q" && (
        <>
          {t.quiz.map(([q, opts, good, why], qi) => (
            <div className="q" key={qi}>
              <p>
                <b>
                  {qi + 1}. {q}
                </b>
              </p>
              {opts.map((o, oi) => {
                const done = ans[qi] !== undefined;
                const cls = done
                  ? oi === good
                    ? "ok"
                    : ans[qi] === oi
                      ? "ko"
                      : ""
                  : "";
                return (
                  <button
                    key={oi}
                    className={"opt " + cls}
                    disabled={done}
                    onClick={() => answer(qi, oi)}
                  >
                    {o}
                  </button>
                );
              })}
              {ans[qi] !== undefined && (
                <small>
                  {ans[qi] === good ? "Correct. " : "Raté. "}
                  {why}
                </small>
              )}
            </div>
          ))}
          {answered && (
            <>
              <p className="score">Score : {score}/{t.quiz.length}</p>
              {passed ? (
                <p className="score">Quiz réussi ! La table suivante est déverrouillée.</p>
              ) : (
                <button className="run" onClick={() => setAns({})}>↻ Réessayer</button>
              )}
            </>
          )}
        </>
      )}
    </aside>
  );
}

function Chat() {
  const [msgs, setMsgs] = useState([
    {
      r: "bot",
      t: 'Pose-moi une question sur le cours (ex : "différence procédure fonction", "c’est quoi un trigger ?").',
    },
  ]);

  const [v, setV] = useState("");
  const end = useRef();

  const send = (e) => {
    e.preventDefault();
    if (!v.trim()) return;

    const q = v.toLowerCase();
    let reply;

    if (/diff|vs|ou /.test(q) && /proc/.test(q) && /fonc/.test(q)) {
      reply =
        "Procédure : réalise une opération, RETURN non obligatoire, peut utiliser OUT. Fonction : retourne obligatoirement une valeur (RETURN) et s’utilise dans une expression.";
    } else {
      const best = TOPICS.map((t) => ({
        t,
        s:
          t.kw.split(" ").filter((w) => q.includes(w)).length +
          (q.includes(t.title.toLowerCase()) ? 2 : 0),
      })).sort((a, b) => b.s - a.s)[0];

      reply =
        best.s > 0
          ? `${best.t.title} : ${best.t.details.join(" ")}\n\nExemple dans la mindmap : clique sur "${best.t.title}".`
          : "Je n’ai pas trouvé. Essaie un mot-clé : bloc, variable, boucle, procédure, fonction, curseur, trigger, exception, record, package.";
    }

    setMsgs((m) => [...m, { r: "me", t: v }, { r: "bot", t: reply }]);
    setV("");

    setTimeout(() => {
      end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  };

  return (
    <section className="chat" id="chat">
      <h2>Une question sur le cours ?</h2>
      <div className="log">
        {msgs.map((m, i) => (
          <p key={i} className={m.r}>
            {m.t}
          </p>
        ))}
        <div ref={end} />
      </div>
      <form onSubmit={send}>
        <input
          value={v}
          onChange={(e) => setV(e.target.value)}
          placeholder="Ta question…"
        />
        <button>Envoyer</button>
      </form>
    </section>
  );
}

export default function App() {
  const [id, setId] = useState(null);
  const [unlocked, setUnlocked] = useState([TOPICS[0].id])
  const [solved, setSolved] = useState([])
  const [toast, setToast] = useState('')
  const pick = (k) => {
    if (unlocked.includes(k)) return setId(k)
    const prev = TOPICS[TOPICS.findIndex(t => t.id === k) - 1]
    setToast(`🔒 Réussis le défi ou le quiz « ${prev.title} » d'abord`); setTimeout(() => setToast(''), 2500)
  }
  const onSolve = (k) => {
    if (solved.includes(k)) return
    setSolved(s => [...s, k])
    const next = TOPICS[TOPICS.findIndex(t => t.id === k) + 1]
    if (next) { setUnlocked(u => [...new Set([...u, next.id])]); setTimeout(() => setId(next.id), 1800) }
  }
  const topic = useMemo(() => TOPICS.find((t) => t.id === id), [id]);

  return (
    <>
      <header className="top">
        <h1>SELECT * FROM plsql;</h1>
        <h4>
          SQL est un langage déclarative / non procédural.</h4>
        <h4>Besoin d’un langage procédural qui inclus SQL à l’intérieur en ajoutant des variables et des boucles.</h4>
        
        <p>Progression : {solved.length}/{TOPICS.length} défis</p>
      </header>

      <main className="stage">
        <Canvas
          camera={{
            position: [0, 6, 13],
            fov: 55,
            near: 0.1,
            far: 100,
          }}
          dpr={[1, 1.5]}
          gl={{ antialias: true }}
          onPointerMissed={() => setId(null)}
        >
          <ResponsiveCamera />

          <Scene id={id} setId={pick} unlocked={unlocked} solved={solved} />

          <OrbitControls
            makeDefault
            enablePan={false}
            enableZoom={true}
            autoRotate={!id}
            autoRotateSpeed={0.8}
            minDistance={7}
            maxDistance={24}
            maxPolarAngle={Math.PI / 2.1}
          />
        </Canvas>
        {topic && <Panel key={topic.id} t={topic} onClose={() => setId(null)} onSolve={onSolve} solved={solved.includes(topic.id)} />}
        {toast && <div className="toast">{toast}</div>}
        {/* <button className="unlock" onClick={() => setUnlocked(TOPICS.map(t => t.id))}>🔓 Tout déverrouiller</button> */}
        <a className="goto" href="#chat">Poser une question</a>
      </main>

      <Chat />
    </>
  );
}
