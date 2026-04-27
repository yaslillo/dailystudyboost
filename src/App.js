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
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [completedDays, setCompletedDays] = useState([]);
  const [ranking, setRanking] = useState([]);

  // ------------------------
  // AUTH
  // ------------------------
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

  // ------------------------
  // LOAD PROGRESS
  // ------------------------
  const loadProgress = async (uid) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setCompletedDays(docSnap.data().completedDays || []);
    }
  };

  // ------------------------
  // SAVE PROGRESS
  // ------------------------
  const saveProgress = async (days) => {
    if (!user) return;

    const docRef = doc(db, "users", user.uid);

    await setDoc(docRef, {
      email: user.email,
      progress: days.length,
      completedDays: days,
    });
  };

  // ------------------------
  // LOAD RANKING
  // ------------------------
  const loadRanking = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));

    const users = [];

    querySnapshot.forEach((doc) => {
      users.push(doc.data());
    });

    // ordenar por progreso
    users.sort((a, b) => (b.progress || 0) - (a.progress || 0));

    setRanking(users);
  };

  // ------------------------
  // LOGIN
  // ------------------------
  const register = async () => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const login = async () => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  // ------------------------
  // HANDLE DAY CLICK
  // ------------------------
  const toggleDay = (day) => {
    let updated;

    if (completedDays.includes(day)) {
      updated = completedDays.filter((d) => d !== day);
    } else {
      updated = [...completedDays, day];
    }

    setCompletedDays(updated);
    saveProgress(updated);
  };

  // ------------------------
  // CHALLENGE ARRAY
  // ------------------------
  const challenges = [
    "Define tu meta",
    "Estudia 25 minutos",
    "Elimina distracciones",
    "Organiza tu espacio",
    "Haz un resumen",
    "Revisa apuntes",
    "Explica lo aprendido",
    "Practica ejercicios",
    "Usa Pomodoro",
    "Repasa lo difícil",
    "Estudia sin celular",
    "Haz un test",
    "Corrige errores",
    "Refuerza debilidades",
    "Haz mapa mental",
    "Explica en voz alta",
    "Repite lo aprendido",
    "Simula prueba",
    "Revisión rápida",
    "Practica más",
    "Estudia profundo",
    "Evalúa progreso",
    "Corrige hábitos",
    "Optimiza método",
    "Enfócate 100%",
    "Reflexiona",
    "Ajusta estrategia",
    "Consolida",
    "Revisión final",
    "Cierre del desafío",
  ];

  // ------------------------
  // UI
  // ------------------------
  if (!user) {
    return (
      <div className="app">
        <h2>Login</h2>
        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={login}>Login</button>
        <button onClick={register}>Registro</button>
      </div>
    );
  }

  return (
    <div className="app">
      <img src={logo} alt="logo" className="logo" />

      <h2>Progreso</h2>
      <p>{completedDays.length}/30 días</p>

      <button onClick={logout}>Cerrar sesión</button>

      <section className="tasks">
        <h2>Desafío 30 días</h2>

        {challenges.map((task, index) => (
          <div
            key={index}
            className={`task ${
              completedDays.includes(index) ? "completed" : ""
            }`}
            onClick={() => toggleDay(index)}
          >
            Día {index + 1}: {task}
          </div>
        ))}
      </section>

      <section className="ranking">
        <h2>🏆 Ranking</h2>

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
                    {student.email}
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

