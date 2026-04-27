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
    "Día 4: Usa la técnica Pomodoro",
    "Día 5: Elimina 1 distracción importante",
    "Día 6: Haz un resumen de lo aprendido",
    "Día 7: Evalúa tu semana",
    "Día 8: Prueba mapas mentales",
    "Día 9: Estudia enseñando",
    "Día 10: Técnica Feynman",
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
      alert("¡Pomodoro terminado! Toma un descanso ☕");
    }

    return () => clearInterval(timer);
  }, [running, seconds]);

  // ✅ REGISTER CORREGIDO
  const register = async () => {
    if (!email.trim() || !password.trim()) {
      alert("Debes ingresar correo y contraseña");
      return;
    }

    if (password.length < 6) {
      alert("La contraseña debe tener mínimo 6 caracteres");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Cuenta creada correctamente");
    } catch (error) {
      alert(error.message);
    }
  };

  // ✅ LOGIN CORREGIDO
  const login = async () => {
    if (!email.trim() || !password.trim()) {
      alert("Debes ingresar correo y contraseña");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Sesión iniciada");
    } catch (error) {
      alert(error.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const loadProgress = async (uid) => {
    const userRef = doc(db, "students", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      setCompletedDays(userSnap.data().completedDays || []);
    } else {
      setCompletedDays([]);
    }
  };

  const saveProgress = async (newCompletedDays) => {
    if (!user) return;

    await setDoc(doc(db, "students", user.uid), {
      email: user.email,
      completedDays: newCompletedDays,
      progress: newCompletedDays.length,
    });

    await loadRanking();
  };

  const loadRanking = async () => {
    const querySnapshot = await getDocs(collection(db, "students"));
    const list = querySnapshot.docs.map((doc) => doc.data());

    const sorted = list.sort((a, b) => b.progress - a.progress);
    setRanking(sorted);
  };

  const toggleChallenge = async (index) => {
    let updatedDays;

    if (completedDays.includes(index)) {
      updatedDays = completedDays.filter((day) => day !== index);
    } else {
      updatedDays = [...completedDays, index];
    }

    setCompletedDays(updatedDays);
    await saveProgress(updatedDays);
  };

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (!user) {
    return (
      <div className="app">
        <div className="login-box">
          <img src={logo} alt="logo" className="logo" />
          <h1>DailyStudyBoost</h1>
          <p>Inicia sesión o crea tu cuenta</p>

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

          <button onClick={login}>Iniciar sesión</button>
          <button onClick={register}>Registrarse</button>
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
        <h2>Progreso del desafío</h2>
        <p>✅ Completado: {completedDays.length}/30 días</p>
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
        <h2>Ranking de estudiantes</h2>

        <ol>
          {ranking.map((student, index) => (
            <li key={index}>
              {student.email} — {student.progress} días
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export default App;