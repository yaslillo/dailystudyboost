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
  const [isRegistering, setIsRegistering] = useState(false);

  const [name, setName] = useState("");
  const [studentName, setStudentName] = useState("");
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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(doc(db, "students", userCredential.user.uid), {
        name: name.trim(),
        email: email.trim(),
        completedDays: [],
        progress: 0,
      });

      setStudentName(name.trim());
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
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert(error.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setStudentName("");
    setCompletedDays([]);
    setEmail("");
    setPassword("");
    setName("");
    setIsRegistering(false);
  };

  const loadProgress = async (uid) => {
    const userRef = doc(db, "students", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();

      setCompletedDays(data.completedDays || []);
      setStudentName(data.name || data.email || "");
    } else {
      setCompletedDays([]);
      setStudentName("");
    }
  };

  const saveProgress = async (newCompletedDays) => {
    if (!user) return;

    await setDoc(
      doc(db, "students", user.uid),
      {
        name: studentName || user.email,
        email: user.email,
        completedDays: newCompletedDays,
        progress: newCompletedDays.length,
      },
      { merge: true }
    );

    await loadRanking();
  };

  const loadRanking = async () => {
    const querySnapshot = await getDocs(collection(db, "students"));
    const list = querySnapshot.docs.map((doc) => doc.data());

    const sorted = list.sort((a, b) => (b.progress || 0) - (a.progress || 0));
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
            <button onClick={register}>Crear cuenta</button>
          ) : (
            <button onClick={login}>Iniciar sesión</button>
          )}

          <button onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? "Ya tengo cuenta" : "No tengo cuenta, registrarme"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <img src={logo} alt="logo" className="logo" />
        <h1>DailyStudyBoost</h1>
        <p>{studentName || user.email}</p>
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
              {student.name || student.email} — {student.progress || 0} días
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export default App;