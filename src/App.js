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
  }, [running, seconds]);

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
  };

  const finishOnboarding = () => {
    localStorage.setItem("onboardingSeen", "true");
    setShowOnboarding(false);
  };

  const loadProgress = async (uid) => {
    const snap = await getDoc(doc(db, "users", uid));

    if (snap.exists()) {
      const data = snap.data();
      setCompletedDays(data.completedDays || []);
      setStudentName(data.name || data.email || "");
      setPomodoroSessions(data.pomodoroSessions || 0);
    }
  };

  const completePomodoro = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const newSessions = pomodoroSessions + 1;
    setPomodoroSessions(newSessions);

    await setDoc(
      doc(db, "users", currentUser.uid),
      { pomodoroSessions: newSessions },
      { merge: true }
    );

    alert("¡Pomodoro completado! 🎉🏅");
    setSeconds(25 * 60);
  };

  const loadRanking = async () => {
    const snapshot = await getDocs(collection(db, "users"));

    const list = snapshot.docs.map((doc) => ({
      ...doc.data(),
      progress: doc.data().completedDays?.length || 0,
    }));

    list.sort((a, b) => b.progress - a.progress);
    setRanking(list);
  };

  const toggleChallenge = async (index) => {
    let updated;

    if (completedDays.includes(index)) {
      updated = completedDays.filter((d) => d !== index);
    } else {
      updated = [...completedDays, index];
    }

    setCompletedDays(updated);

    await setDoc(
      doc(db, "users", user.uid),
      { completedDays: updated },
      { merge: true }
    );
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
    (a) => pomodoroSessions >= a.sessions
  );

  if (showOnboarding) {
    return (
      <div className="onboarding">
        <img src={logo} alt="logo" className="onboarding-logo" />
        <h1>Bienvenido a DailyStudyBoost 🚀✨</h1>
        <p className="onboarding-text">
          Convierte el estudio en un hábito diario 💪📚
        </p>
        <button onClick={finishOnboarding} className="start-btn">
          Empezar ahora 🚀
        </button>
      </div>
    );
  }

  if (!user) return <div className="app">Login...</div>;

  return (
    <div className="app">
      <header className="header">
        <img src={logo} className="logo" />
        <h1>DailyStudyBoost</h1>
        <p>Hola, {studentName || user.email} 👋</p>
        <button onClick={logout}>Cerrar sesión</button>
      </header>

      <section className="summary">
        <h2>Progreso</h2>
        <p>{completedDays.length}/30 días</p>
        <p>⏱️ {pomodoroSessions} Pomodoros</p>
      </section>

      <section className="achievements">
        <h2>🏅 Logros</h2>
        <p className="section-help">
          Completa Pomodoros para desbloquear logros 🎯
        </p>

        {unlockedAchievements.map((a, i) => (
          <div key={i} className="achievement-card">
            {a.title}
          </div>
        ))}
      </section>

      <section className="pomodoro">
        <h2>⏱️ Pomodoro</h2>
        <p className="timer">
          {minutes}:{secs.toString().padStart(2, "0")}
        </p>

        <button onClick={() => setRunning(!running)}>
          {running ? "Pausar" : "Iniciar"}
        </button>
      </section>
    </div>
  );
}

export default App;