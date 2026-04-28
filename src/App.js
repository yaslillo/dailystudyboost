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

import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";

function App() {
  const challenges = [
    "Día 1: Define tu meta principal",
    "Día 2: Estudia 15 minutos sin distracciones",
    "Día 3: Organiza tu espacio de estudio",
    "Día 4: Usa la técnica Pomodoro\n25 min estudio + 5 min descanso\nRepite 4 veces y descansa",
    "Día 5: Elimina 1 distracción importante",
    "Día 6: Haz un resumen de lo aprendido",
    "Día 7: Evalúa tu semana",
    "Día 8: Prueba mapas mentales",
    "Día 9: Estudia enseñando",
    "Día 10: Técnica Feynman\nExplica con palabras simples\nSi no puedes, vuelve a estudiar",
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
  const [studentName, setStudentName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const [completedDays, setCompletedDays] = useState([]);
  const [ranking, setRanking] = useState([]);

  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [pomodoroSessions, setPomodoroSessions] = useState(0);
  const [notification, setNotification] = useState(null);

  const [showOnboarding, setShowOnboarding] = useState(
    localStorage.getItem("onboardingSeen") !== "true"
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        await loadProgress(currentUser.uid);
        await loadRanking();
      } else {
        setCompletedDays([]);
        setStudentName("");
        setPomodoroSessions(0);
      }
    });

    return () => unsubscribe();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let timer;

    if (running && seconds > 0) {
      timer = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    }

    if (running && seconds === 0) {
      setRunning(false);
      completePomodoro();
    }

    return () => clearInterval(timer);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, seconds]);

  const playSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 880;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.5
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log("Sonido no disponible");
    }
  };

const showSuccessNotification = (sessions) => {
  setNotification({
    title: "🎉 ¡Pomodoro completado!",
    message: `Sumaste 1 sesión de enfoque. Total: ${sessions} Pomodoros 🏅`,
  });

  setTimeout(() => {
    setNotification(null);
  }, 4500);
};

  const register = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      alert("Debes ingresar nombre, correo y contraseña");
      return;
    }

    if (password.length < 6) {
      alert("La contraseña debe tener mínimo 6 caracteres");
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await setDoc(doc(db, "users", res.user.uid), {
        name: name.trim(),
        email: email.trim(),
        completedDays: [],
        progress: 0,
        pomodoroSessions: 0,
      });

      setStudentName(name.trim());
      setIsRegistering(false);
      alert("Cuenta creada correctamente");
    } catch (error) {
      alert(error.message);
    }
  };

  const login = async () => {
    if (!email.trim() || !password.trim()) {
      alert("Debes ingresar correo y contraseña");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch {
      alert("Correo o contraseña incorrectos.");
    }
  };

  const logout = async () => {
    await signOut(auth);
    setEmail("");
    setPassword("");
    setName("");
    setIsRegistering(false);
  };

  const finishOnboarding = () => {
    localStorage.setItem("onboardingSeen", "true");
    setShowOnboarding(false);
  };

  const loadProgress = async (uid) => {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      setCompletedDays(data.completedDays || []);
      setStudentName(data.name || data.email || "");
      setPomodoroSessions(data.pomodoroSessions || 0);
    } else {
      setCompletedDays([]);
      setPomodoroSessions(0);
    }
  };

  const saveProgress = async (newDays) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const ref = doc(db, "users", currentUser.uid);
    const snap = await getDoc(ref);
    const oldData = snap.exists() ? snap.data() : {};

    await setDoc(
      ref,
      {
        ...oldData,
        name: oldData.name || studentName || currentUser.email,
        email: currentUser.email,
        completedDays: newDays,
        progress: newDays.length,
        pomodoroSessions: oldData.pomodoroSessions || pomodoroSessions || 0,
      },
      { merge: true }
    );

    await loadProgress(currentUser.uid);
    await loadRanking();
  };

  const completePomodoro = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const newPomodoroSessions = pomodoroSessions + 1;
    setPomodoroSessions(newPomodoroSessions);

    const ref = doc(db, "users", currentUser.uid);
    const snap = await getDoc(ref);
    const oldData = snap.exists() ? snap.data() : {};

    await setDoc(
      ref,
      {
        ...oldData,
        name: oldData.name || studentName || currentUser.email,
        email: currentUser.email,
        completedDays,
        progress: completedDays.length,
        pomodoroSessions: newPomodoroSessions,
      },
      { merge: true }
    );

  setTimeout(() => {
    setNotification(null);
  }, 4000);
};

  playSuccessSound();
showSuccessNotification(newPomodoroSessions);

setSeconds(25 * 60);
await loadProgress(currentUser.uid);
  };

  const loadRanking = async () => {
    const snapshot = await getDocs(collection(db, "users"));

    const list = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        ...data,
        progress: data.completedDays
          ? data.completedDays.length
          : data.progress || 0,
      };
    });

    const sorted = list.sort((a, b) => (b.progress || 0) - (a.progress || 0));
    setRanking(sorted);
  };

  const toggleChallenge = async (index) => {
    let updated;

    if (completedDays.includes(index)) {
      updated = completedDays.filter((day) => day !== index);
    } else {
      updated = [...completedDays, index];
    }

    setCompletedDays(updated);
    await saveProgress(updated);
  };

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const achievements = [
    { sessions: 1, title: "🎯 Primer Pomodoro" },
    { sessions: 3, title: "🔥 Enfoque inicial" },
    { sessions: 5, title: "🚀 Constancia" },
    { sessions: 10, title: "🏆 Disciplina" },
    { sessions: 20, title: "👑 Maestro del enfoque" },
  ];

  const unlockedAchievements = achievements.filter(
    (achievement) => pomodoroSessions >= achievement.sessions
  );

  if (showOnboarding) {
    return (
      <div className="onboarding">
        <img src={logo} alt="logo" className="onboarding-logo" />

        <h1>Bienvenido a DailyStudyBoost 🚀✨</h1>

        <p className="onboarding-text">
          Convierte el estudio en un hábito diario 💪📚. Completa desafíos, usa
          Pomodoro ⏱️, desbloquea logros 🏅 y sube en el ranking 🏆.
        </p>

        <ul className="onboarding-list">
          <li>🎯 30 días para vencer la procrastinación</li>
          <li>⏱️ Pomodoro para estudiar con enfoque</li>
          <li>🏅 Logros que se desbloquean al cumplir</li>
          <li>🏆 Ranking para motivarte cada día</li>
        </ul>

        <button onClick={finishOnboarding} className="start-btn">
          Empezar ahora 🚀
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app">
        <div className="login-box">
          <img src={logo} alt="logo" className="logo" />
          <h1>DailyStudyBoost</h1>
          <p>{isRegistering ? "Crea tu cuenta" : "Inicia sesión"}</p>

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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
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
      {notification && (
        <div className="toast">
          <strong>{notification.title}</strong>
          <p>{notification.message}</p>
        </div>
      )}

      <header className="header">
        <img src={logo} alt="logo" className="logo" />
        <h1>DailyStudyBoost</h1>
        <p>Hola, {studentName || user.email} 👋</p>

        <p className="description">
          🚀 Mejora tu enfoque y vence la procrastinación con desafíos diarios y
          la técnica Pomodoro. Completa 30 días de hábitos de estudio, sigue tu
          progreso y compite en el ranking con otros estudiantes.
        </p>

        <button onClick={logout}>Cerrar sesión</button>
      </header>

      <section className="summary">
        <h2>Progreso</h2>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: (completedDays.length / 30) * 100 + "%" }}
          ></div>
        </div>

        <p>{completedDays.length}/30 días completados</p>
        <p>⏱️ Pomodoros completados: {pomodoroSessions}</p>
      </section>

      <section className="achievements">
        <h2>🏅 Logros desbloqueados</h2>

        <p className="section-help">
          Inicia el temporizador Pomodoro y completa sesiones de enfoque. Cada
          Pomodoro terminado desbloquea nuevos logros.
        </p>

        {unlockedAchievements.length === 0 ? (
          <p>
            Aún no tienes logros. Presiona “Iniciar” en el Pomodoro, completa la
            sesión y desbloquea tu primer logro 🎯⏱️
          </p>
        ) : (
          <div className="achievement-list">
            {unlockedAchievements.map((achievement, index) => (
              <div className="achievement-card achievement-pop" key={index}>
                {achievement.title}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="pomodoro">
        <h2>⏱️ Pomodoro</h2>

        <p className="pomodoro-help">
          Presiona “Iniciar” y estudia hasta que el temporizador llegue a 0. Al
          finalizar, sumarás 1 Pomodoro y podrás desbloquear logros 🏅
        </p>

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

      <div className="grid">
        <section className="tasks">
          <h2>Desafío 30 días</h2>

          <ul>
            {challenges.map((challenge, index) => (
              <li
                key={index}
                onClick={() => toggleChallenge(index)}
                className={completedDays.includes(index) ? "done" : ""}
              >
                {challenge}
              </li>
            ))}
          </ul>
        </section>

        <section className="ranking">
          <h2>🏆 Ranking</h2>

          <div className="ranking-list">
            {ranking.map((student, index) => {
              const medals = ["🥇", "🥈", "🥉"];

              let rankClass = "ranking-card";
              if (index === 0) rankClass += " gold";
              if (index === 1) rankClass += " silver";
              if (index === 2) rankClass += " bronze";

              return (
                <div className={rankClass} key={index}>
                  <div className="rank-position">
                    {medals[index] || "#" + (index + 1)}
                  </div>

                  <div className="rank-info">
                    <p className="rank-name">{student.name || student.email}</p>

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
    </div>
  );
}

export default App;