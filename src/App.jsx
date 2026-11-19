import { useState, useRef, useMemo, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Scene from './Scene'
import { TOPICS } from './data'

function ResponsiveCamera() {
  const { camera, size } = useThree()

  useEffect(() => {
    const width = size.width

    if (width < 600) {
      camera.position.set(0, 9, 19)
      camera.fov = 60
    } else if (width < 900) {
      camera.position.set(0, 7, 16)
      camera.fov = 52
    } else {
      camera.position.set(0, 6, 13)
      camera.fov = 55
    }

    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [camera, size.width, size.height])

  return null
}

function Panel({ t, onClose }) {
  const [tab, setTab] = useState('d')
  const [ans, setAns] = useState({})

  const score = Object.entries(ans).filter(
    ([k, v]) => t.quiz[k][2] === v
  ).length

  return (
    <aside className="panel" style={{ '--c': t.color }}>
      <button className="close" onClick={onClose} aria-label="Fermer">×</button>
      <h2>{t.title}</h2>

      <div className="tabs">
        {[['d', 'Détails'], ['e', 'Exemple'], ['q', 'Quiz']].map(([k, l]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'd' && t.details.map((p, i) => <p key={i}>{p}</p>)}
      {tab === 'e' && <pre><code>{t.code}</code></pre>}

      {tab === 'q' && (
        <>
          {t.quiz.map(([q, opts, good, why], qi) => (
            <div className="q" key={qi}>
              <p><b>{qi + 1}. {q}</b></p>

              {opts.map((o, oi) => {
                const done = ans[qi] !== undefined
                const cls = done
                  ? (oi === good ? 'ok' : ans[qi] === oi ? 'ko' : '')
                  : ''

                return (
                  <button
                    key={oi}
                    className={'opt ' + cls}
                    disabled={done}
                    onClick={() => setAns({ ...ans, [qi]: oi })}
                  >
                    {o}
                  </button>
                )
              })}

              {ans[qi] !== undefined && (
                <small>{ans[qi] === good ? 'Correct. ' : 'Raté. '}{why}</small>
              )}
            </div>
          ))}

          {Object.keys(ans).length === t.quiz.length && (
            <p className="score">Score : {score}/{t.quiz.length}</p>
          )}
        </>
      )}
    </aside>
  )
}

function Chat() {
  const [msgs, setMsgs] = useState([
    { r: 'bot', t: 'Pose-moi une question sur le cours (ex : "différence procédure fonction", "c’est quoi un trigger ?").' }
  ])

  const [v, setV] = useState('')
  const end = useRef()

  const send = (e) => {
    e.preventDefault()
    if (!v.trim()) return

    const q = v.toLowerCase()
    let reply

    if (/diff|vs|ou /.test(q) && /proc/.test(q) && /fonc/.test(q)) {
      reply = 'Procédure : réalise une opération, RETURN non obligatoire, peut utiliser OUT. Fonction : retourne obligatoirement une valeur (RETURN) et s’utilise dans une expression.'
    } else {
      const best = TOPICS.map(t => ({
        t,
        s: t.kw.split(' ').filter(w => q.includes(w)).length +
          (q.includes(t.title.toLowerCase()) ? 2 : 0)
      })).sort((a, b) => b.s - a.s)[0]

      reply = best.s > 0
        ? `${best.t.title} : ${best.t.details.join(' ')}\n\nExemple dans la mindmap : clique sur "${best.t.title}".`
        : 'Je n’ai pas trouvé. Essaie un mot-clé : bloc, variable, boucle, procédure, fonction, curseur, trigger, exception, record, package.'
    }

    setMsgs(m => [...m, { r: 'me', t: v }, { r: 'bot', t: reply }])
    setV('')

    setTimeout(() => {
      end.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 50)
  }

  return (
    <section className="chat" id="chat">
      <h2>Une question sur le cours ?</h2>
      <div className="log">
        {msgs.map((m, i) => <p key={i} className={m.r}>{m.t}</p>)}
        <div ref={end} />
      </div>
      <form onSubmit={send}>
        <input value={v} onChange={e => setV(e.target.value)} placeholder="Ta question…" />
        <button>Envoyer</button>
      </form>
    </section>
  )
}

export default function App() {
  const [id, setId] = useState(null)
  const topic = useMemo(() => TOPICS.find(t => t.id === id), [id])

  return (
    <>
      <header className="top">
        <h1>SELECT * FROM plsql;</h1>
        <p>Clique sur une table pour ouvrir la notion. Glisse pour tourner, molette pour zoomer.</p>
      </header>

      <main className="stage">
        <Canvas
          camera={{
            position: [0, 6, 13],
            fov: 55,
            near: 0.1,
            far: 100
          }}
          dpr={[1, 1.5]}
          gl={{ antialias: true }}
          onPointerMissed={() => setId(null)}
        >
          <ResponsiveCamera />

          <Scene id={id} setId={setId} />

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            autoRotate={!id}
            autoRotateSpeed={0.8}
            minDistance={7}
            maxDistance={24}
            maxPolarAngle={Math.PI / 2.1}
          />
        </Canvas>

        {topic && (
          <Panel
            key={topic.id}
            t={topic}
            onClose={() => setId(null)}
          />
        )}

        <a className="goto" href="#chat">Poser une question</a>
      </main>

      <Chat />
    </>
  )
}
