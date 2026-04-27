import { useEffect, useState } from "react";
import "./App.css";
import logo from "./logo.png";

import { auth, db } from "./firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";

function App() {
  const challenges = [
    "Día 1: Define tu meta principal",
    "Día 2: Estudia 15 minutos sin distracciones",
    "Día 3: Organiza tu espacio de estudio",
    "Día 4: Usa la técnica Pomodoro\n25 min de estudio + 5 min de descanso\nRepite 4 veces y toma un descanso largo",
    "Día 5: Elimina 1 distracción importante",
    "Día 6: Haz un resumen de lo aprendido",
    "Día 7: Evalúa tu semana",
    "Día 8: Prueba mapas mentales",
    "Día 9: Estudia enseñando",
    "Día 10: Técnica Feynman\nExplica el tema con palabras simples\nSi no puedes, vuelve a estudiar",
    "Día 11: Haz preguntas sobre el tema",
    "Día 12: Practica con ejercicios",
    "Día 13: Repaso activo",
    "Día 14: Test rápido",
    "Día 15: Estudia aunque no tengas motivación",
    "Día 16: Bloquea redes sociales",
    "Día 17: Haz 2 sesiones Pomodoro",
    "Día 18: Estudia a la misma hora",
    "Día 19: Identifica tu mejor horario",
    "Día 20: Estudia un tema difícil primero",
    "Día 21: Recompénsate por cumplir",
    "Día 22: Planifica tu semana completa",
    "Día 23: Estudio profundo 45 min",
    "Día 24: Simula una prueba",
    "Día 25: Corrige errores",
    "Día 26: Enseña a alguien",
    "Día 27: Revisa todo el progreso",
    "Día 28: Optimiza tu método",
    "Día 29: Estudia con máxima concentración",
    "Día 30: Reflexión final + nuevos objetivos",
  ];

  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const [completedDays, setCompletedDays] = useState([]);
  const [ranking, setRanking] = useState([]);

  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        await loadProgress(currentUser.uid);
        await loadRanking();
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let timer;

    if (running && seconds > 0) {
      timer = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    }

    if (seconds === 0) {
      setRunning(false);
      alert("¡Pomodoro terminado! ☕");
    }

    return () => clearInterval(timer);
  }, [running, seconds]);

  const register = async () => {
    if (!email || !password || !name) {
      alert("Completa todos los campos");
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "students", res.user.uid), {
        name: name,
        email: email,
        completedDays: [],
        progress: 0,
      });

      alert("Cuenta creada");
      setIsRegistering(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const login = async () => {
    if (!email || !password) {
      alert("Completa los campos");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Bienvenido");
    } catch (error) {
      alert(error.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const loadProgress = async (uid) => {
    const ref = doc(db, "students", uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      setCompletedDays(snap.data().completedDays || []);
    }
  };

  const saveProgress = async (newDays) => {
    if (!user) return;

    const ref = doc(db, "students", user.uid);
    const snap = await getDoc(ref);

    const data = snap.data();

    await setDoc(ref, {
      ...data,
      completedDays: newDays,
      progress: newDays.length,
    });

    await loadRanking();
  };

  const loadRanking = async () => {
    const snapshot = await getDocs(collection(db, "students"));
    const list = snapshot.docs.map((doc) => doc.data());

    const sorted = list.sort((a, b) => b.progress - a.progress);
    setRanking(sorted);
  };

  const toggleChallenge = async (index) => {
    let updated;

    if (completedDays.includes(index)) {
      updated = completedDays.filter((d) => d !== index);
    } else {
      updated = [...completedDays, index];
    }

    setCompletedDays(updated);
    await saveProgress(updated);
  };

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (!user) {
    return (
      <div className="app">
        <div className="login-box">
          <img src={logo} alt="logo" className="logo" />
          <h1>DailyStudyBoost</h1>

          {isRegistering && (
            <input
              type="text"
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <input
            type="email"
            placeholder="Correo"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            onChange={(e) => setPassword(e.target.value)}
          />

          {isRegistering ? (
            <>
              <button onClick={register}>Crear cuenta</button>
              <button onClick={() => setIsRegistering(false)}>
                Ya tengo cuenta
              </button>
            </>
          ) : (
            <>
              <button onClick={login}>Iniciar sesión</button>
              <button onClick={() => setIsRegistering(true)}>
                Registrarse
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <img src={logo} alt="logo" className="logo" />
        <h1>DailyStudyBoost</h1>
        <p>{user.email}</p>
        <button onClick={logout}>Cerrar sesión</button>
      </header>

      <section className="summary">
        <h2>Progreso</h2>
        <p>{completedDays.length}/30 días</p>
      </section>

      <section className="pomodoro">
        <h2>Pomodoro</h2>
        <p className="timer">
          {minutes}:{secs.toString().padStart(2, "0")}
        </p>

        <button onClick={() => setRunning(!running)}>
          {running ? "Pausar" : "Iniciar"}
        </button>

        <button
          onClick={() => {
            setRunning(false);
            setSeconds(25 * 60);
          }}
        >
          Reiniciar
        </button>
      </section>

      <section className="tasks">
        <h2>Desafío 30 días</h2>
        <ul>
          {challenges.map((c, i) => (
            <li
              key={i}
              onClick={() => toggleChallenge(i)}
              className={completedDays.includes(i) ? "done" : ""}
            >
              {c}
            </li>
          ))}
        </ul>
      </section>

      <section className="ranking">
        <h2>Ranking</h2>

        <div className="ranking-list">
          {ranking.map((student, index) => {
            const medals = ["🥇", "🥈", "🥉"];

            return (
              <div className="ranking-card" key={index}>
                <div className="rank-position">
                  {medals[index] || "#" + (index + 1)}
                </div>

                <div className="rank-info">
                  <p className="rank-name">
                    {student.name || student.email}
                  </p>
                  <p className="rank-progress">
                    {student.progress || 0} días completados
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default App;

