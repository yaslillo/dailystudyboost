import { useEffect, useState } from "react";
import "./App.css";
import logo from "./logo.png";

import { auth, db } from "./firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs
} from "firebase/firestore";

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const [completedDays, setCompletedDays] = useState([]);
  const [ranking, setRanking] = useState([]);

  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  // 🔥 Cargar usuario + datos
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        await loadProgress(currentUser.uid);
        await loadRanking();
      } else {
        setCompletedDays([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // ⏱ Pomodoro
  useEffect(() => {
    let timer;

    if (running && seconds > 0) {
      timer = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [running, seconds]);

  // 🔐 Auth
  const register = async () => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "users", userCredential.user.uid), {
      name,
      email,
      progress: 0
    });
  };

  const login = async () => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  // 💾 Guardar progreso
  const saveProgress = async (days) => {
    if (!user) return;

    await setDoc(doc(db, "users", user.uid), {
      name: user.displayName || name,
      email: user.email,
      progress: days.length
    });
  };

  // 📥 Cargar progreso
  const loadProgress = async (uid) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const days = Array.from({ length: data.progress || 0 }, (_, i) => i);
      setCompletedDays(days);
    }
  };

  // 🏆 Ranking
  const loadRanking = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));

    const list = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data());
    });

    list.sort((a, b) => (b.progress || 0) - (a.progress || 0));
    setRanking(list);
  };

  // ✅ Completar día
  const toggleDay = async (index) => {
    let updated;

    if (completedDays.includes(index)) {
      updated = completedDays.filter((i) => i !== index);
    } else {
      updated = [...completedDays, index];
    }

    setCompletedDays(updated);
    await saveProgress(updated);
    await loadRanking();
  };

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
    "Día 11: Haz preguntas",
    "Día 12: Practica ejercicios",
    "Día 13: Repaso activo",
    "Día 14: Test rápido",
    "Día 15: Estudia sin motivación",
    "Día 16: Bloquea redes sociales",
    "Día 17: 2 sesiones Pomodoro",
    "Día 18: Estudia misma hora",
    "Día 19: Identifica tu mejor horario",
    "Día 20: Tema difícil primero",
    "Día 21: Estudia 30 min seguidos",
    "Día 22: Resume en voz alta",
    "Día 23: Explica a alguien",
    "Día 24: Minimiza distracciones",
    "Día 25: Estudia con cronómetro",
    "Día 26: Haz un mini test",
    "Día 27: Revisa progreso",
    "Día 28: Mejora técnica",
    "Día 29: Máxima concentración",
    "Día 30: Reflexión final"
  ];

  return (
    <div className="app">
      {!user ? (
        <div className="login">
          <img src={logo} alt="logo" className="logo" />
          <h1>DailyStudyBoost</h1>

          {isRegistering && (
            <input
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

          <button onClick={login}>Iniciar sesión</button>
          <button onClick={register}>Registrarse</button>

          <p onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? "Ya tengo cuenta" : "Crear cuenta"}
          </p>
        </div>
      ) : (
        <>
          <button onClick={logout}>Cerrar sesión</button>

          <h2>Progreso</h2>
          <p>{completedDays.length}/30 días</p>

          <div className="pomodoro">
            <h2>Pomodoro</h2>
            <h1>{Math.floor(seconds / 60)}:{seconds % 60}</h1>
            <button onClick={() => setRunning(true)}>Iniciar</button>
            <button onClick={() => setRunning(false)}>Pausar</button>
          </div>

          <h2>Desafío 30 días</h2>
          <ul>
            {challenges.map((challenge, index) => (
              <li
                key={index}
                onClick={() => toggleDay(index)}
                className={completedDays.includes(index) ? "done" : ""}
              >
                {challenge.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </li>
            ))}
          </ul>

          <section className="ranking">
            <h2>🏆 Ranking</h2>

            <div className="ranking-list">
              {ranking.map((student, index) => {
                const medals = ["🥇", "🥈", "🥉"];

                return (
                  <div className="ranking-card" key={index}>
                    <div className="rank-position">
                      {medals[index] || #${index + 1}}
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
        </>
      )}
    </div>
  );
}

export default App;

