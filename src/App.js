import { useEffect, useState } from "react";
import "./App.css";
import logo from "./logo.png";
import Stats from "./components/Stats";
import { challenges } from "./data/challenges";
import { achievements } from "./data/achievements";
import Streak from "./components/Streak";
import Onboarding from "./components/Onboarding";
import Header from "./components/Header";
import Summary from "./components/Summary";
import Achievements from "./components/Achievements";
import Pomodoro from "./components/Pomodoro";
import Tasks from "./components/Tasks";
import Ranking from "./components/Ranking";
import Profile from "./components/Profile";

import {
  getUserProgress,
  saveUserProgress,
  getRanking,
} from "./services/userService";

import { auth, db } from "./firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import { doc, setDoc, getDoc } from "firebase/firestore";

function App() {
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
  const [streak, setStreak] = useState(0);
  const [userPhoto, setUserPhoto] = useState("");

  const userPosition = ranking.findIndex(
  (item) => item.email === user?.email
) + 1;

  const loadRanking = async () => {
    try {
      const data = await getRanking();
      setRanking(data);
    } catch (error) {
      console.log("Error ranking:", error);
    }
  };

  const loadProgress = async (uid) => {
    const data = await getUserProgress(uid);

    if (data) {
      setCompletedDays(data.completedDays || []);
      setStudentName(data.name || data.email || "");
      setPomodoroSessions(data.pomodoroSessions || 0);
      setStreak(data.streak || 0);
      setUserPhoto(data.photoURL || "");
    } else {
      setCompletedDays([]);
      setPomodoroSessions(0);
      setStreak(0);
      setUserPhoto("");
    }
  };

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
        setRanking([]);
      }
    });

    return () => unsubscribe();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const completePomodoro = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const newPomodoroSessions = pomodoroSessions + 1;
    setPomodoroSessions(newPomodoroSessions);

    const ref = doc(db, "users", currentUser.uid);
    const snap = await getDoc(ref);
    const oldData = snap.exists() ? snap.data() : {};

    const newStreak = (oldData.streak || 0) + 1;
    setStreak(newStreak);

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

    playSuccessSound();
    showSuccessNotification(newPomodoroSessions);

    setSeconds(25 * 60);
    await loadProgress(currentUser.uid);
    await loadRanking();
  };

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

  const saveProgress = async (newDays) => {
    await saveUserProgress({
      studentName,
      completedDays: newDays,
      pomodoroSessions,
    });

    const currentUser = auth.currentUser;
    if (currentUser) {
      await loadProgress(currentUser.uid);
      await loadRanking();
    }
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

  const unlockedAchievements = achievements.filter(
    (achievement) => pomodoroSessions >= achievement.sessions
  );

  if (showOnboarding) {
    return <Onboarding finishOnboarding={finishOnboarding} />;
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

      <Header
        studentName={studentName}
        userEmail={user.email}
        logout={logout}
      />

      <Profile
        studentName={studentName}
        userEmail={user.email}
        userId={user.uid}
        userPhoto={userPhoto}
        reloadUser={() => loadProgress(user.uid)}
      />

      {userPosition > 0 && (
  <div className="ranking-position">
    🏆 Tu posición: #{userPosition}
  </div>
)}

      <Summary completedDays={completedDays} pomodoroSessions={pomodoroSessions} />
      <Stats completedDays={completedDays} pomodoroSessions={pomodoroSessions} />
      <Streak streak={streak} />
      <Achievements unlockedAchievements={unlockedAchievements} />

      <Pomodoro
        minutes={minutes}
        secs={secs}
        running={running}
        setRunning={setRunning}
        setSeconds={setSeconds}
      />

      <div className="grid">
        <Tasks
          challenges={challenges}
          completedDays={completedDays}
          toggleChallenge={toggleChallenge}
        />

        <Ranking ranking={ranking} />
      </div>
    </div>
  );
}

export default App;