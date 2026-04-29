import { useState } from "react";
import "./App.css";
import "./styles/components.css";

import Header from "./components/Header";
import Onboarding from "./components/Onboarding";
import Profile from "./components/Profile";
import Summary from "./components/Summary";
import Stats from "./components/Stats";
import Streak from "./components/Streak";
import Achievements from "./components/Achievements";
import Pomodoro from "./components/Pomodoro";
import Tasks from "./components/Tasks";
import Ranking from "./components/Ranking";
import AuthScreen from "./components/AuthScreen";

import { challenges } from "./data/challenges";
import { achievements } from "./data/achievements";

import useUserProgress from "./hooks/useUserProgress";
import usePomodoro from "./hooks/usePomodoro";
import useNotification from "./hooks/useNotification";
import useAuth from "./hooks/useAuth";

import { getMotivationMessage } from "./utils/motivation";
import { playSuccessSound } from "./utils/sound";
import { auth } from "./firebase";

function App() {
  const [activeChallengeIndex, setActiveChallengeIndex] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(
    localStorage.getItem("onboardingSeen") !== "true"
  );
  
  const {
  studentName,
  userPhoto,
  completedDays,
  pomodoroSessions,
  setPomodoroSessions,
  streak,
  ranking,
  loadRanking,
  loadProgress,
  savePomodoroProgress,
  toggleChallenge,
  dailyChallengeLocked,
  challengeProgress,
  totalChallenges,
  progressPercentage,

} = useUserProgress();
  

  const { notification, showSuccessNotification } = useNotification();

  const {
    user,
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    isRegistering,
    setIsRegistering,
    login,
    register,
    logout,
  } = useAuth({
    onUserLoaded: async (currentUser) => {
      await loadProgress(currentUser.uid);
      await loadRanking();
    },
  });

  const completePomodoro = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const newPomodoroSessions = pomodoroSessions + 1;
    setPomodoroSessions(newPomodoroSessions);

    await savePomodoroProgress({
      currentUser,
      newPomodoroSessions,
      completedDays,
    });

    playSuccessSound();
    showSuccessNotification(newPomodoroSessions);

    setSeconds(25 * 60);
  };

  const {
    setSeconds,
    running,
    setRunning,
    pomodoroFinished,
    setPomodoroFinished,
    startPomodoro,
    minutes,
    secs,
  } = usePomodoro({
    onFinish: completePomodoro,
  });

  const userPosition =
    ranking.findIndex((item) => item.email === user?.email) + 1;

  const unlockedAchievements = achievements.filter(
    (achievement) => pomodoroSessions >= achievement.sessions
  );

  const finishOnboarding = () => {
    localStorage.setItem("onboardingSeen", "true");
    setShowOnboarding(false);
  };

const startChallengePomodoro = (index) => {
  if (dailyChallengeLocked) {
    alert("Ya completaste el desafío de hoy. El siguiente se desbloquea mañana.");
    return;
  }

  setActiveChallengeIndex(index);
  setPomodoroFinished(false);
  startPomodoro();
  
};

  const completeActiveChallenge = async (index) => {
    await toggleChallenge(index);
    setActiveChallengeIndex(null);
    setPomodoroFinished(false);
  };

  if (showOnboarding) {
    return <Onboarding finishOnboarding={finishOnboarding} />;
  }

  if (!user) {
    return (
      <AuthScreen
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        name={name}
        setName={setName}
        isRegistering={isRegistering}
        setIsRegistering={setIsRegistering}
        login={login}
        register={register}
      />
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

      <Header studentName={studentName} userEmail={user.email} logout={logout} />

      <Profile
        studentName={studentName}
        userEmail={user.email}
        userId={user.uid}
        userPhoto={userPhoto}
        reloadUser={() => loadProgress(user.uid)}
        streak={streak}
        completedDays={completedDays.length}
        pomodoroSessions={pomodoroSessions}
        rankingPosition={
          ranking.findIndex((student) => student.id === user.uid) + 1
        }
      />

      {userPosition > 0 && (
        <div className="pomodoro-message">
          {getMotivationMessage({
            completedDays,
            userPosition,
            streak,
            pomodoroSessions,
          })}
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
        <div className="challenge-progress">
  <p>
    Día {challengeProgress} de {totalChallenges} · {progressPercentage}%
  </p>

  <div className="challenge-progress-bar">
    <div
      className="challenge-progress-fill"
      style={{ width: `${progressPercentage}% `}}
    />
  </div>

  {dailyChallengeLocked && (
    <small>✅ Desafío de hoy completado. El siguiente se desbloquea mañana.</small>
  )}
</div>
        <Tasks
          challenges={challenges}
          completedDays={completedDays}
          activeChallengeIndex={activeChallengeIndex}
          pomodoroFinished={pomodoroFinished}
          running={running}
          startChallengePomodoro={startChallengePomodoro}
          completeActiveChallenge={completeActiveChallenge}
          dailyChallengeLocked={dailyChallengeLocked}
        />

        <Ranking ranking={ranking} />
      </div>
    </div>
  );
}

export default App;
