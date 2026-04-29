import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import {
  getUserProgress,
  saveUserProgress,
  getRanking,
} from "../services/userService";

const getToday = () => new Date().toISOString().split("T")[0];

export default function useUserProgress() {
  const [studentName, setStudentName] = useState("");
  const [userPhoto, setUserPhoto] = useState("");
  const [completedDays, setCompletedDays] = useState([]);
  const [pomodoroSessions, setPomodoroSessions] = useState(0);
  const [streak, setStreak] = useState(0);
  const [ranking, setRanking] = useState([]);
  const [lastChallengeDate, setLastChallengeDate] = useState("");
  const [today, setToday] = useState(getToday());

  useEffect(() => {
    const interval = setInterval(() => {
      const currentToday = getToday();

      if (currentToday !== today) {
        setToday(currentToday);
      }
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [today]);

  const dailyChallengeLocked = lastChallengeDate === today;

  const challengeProgress = completedDays.length;
  const totalChallenges = 30;
  const progressPercentage = Math.min(
    Math.round((challengeProgress / totalChallenges) * 100),
    100
  );

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
      setLastChallengeDate(data.lastChallengeDate || "");
    } else {
      resetProgress();
    }
  };

  const resetProgress = () => {
    setCompletedDays([]);
    setStudentName("");
    setPomodoroSessions(0);
    setStreak(0);
    setRanking([]);
    setUserPhoto("");
    setLastChallengeDate("");
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

  const savePomodoroProgress = async ({
    currentUser,
    newPomodoroSessions,
    completedDays,
  }) => {
    const ref = doc(db, "users", currentUser.uid);
    const snap = await getDoc(ref);
    const oldData = snap.exists() ? snap.data() : {};

    const studyToday = new Date().toDateString();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();

    const lastStudyDate = oldData.lastStudyDate || "";

    let newStreak = oldData.streak || 0;

    if (lastStudyDate === studyToday) {
      newStreak = oldData.streak || 1;
    } else if (lastStudyDate === yesterdayString) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }

    await setDoc(
      ref,
      {
        ...oldData,
        name: oldData.name || studentName || currentUser.email,
        email: currentUser.email,
        completedDays,
        progress: completedDays.length,
        pomodoroSessions: newPomodoroSessions,
        streak: newStreak,
        lastStudyDate: studyToday,
      },
      { merge: true }
    );

    await loadProgress(currentUser.uid);
    await loadRanking();
  };

  const toggleChallenge = async (index) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const ref = doc(db, "users", currentUser.uid);
    const snap = await getDoc(ref);
    const oldData = snap.exists() ? snap.data() : {};

    const currentToday = getToday();
    const savedLastChallengeDate = oldData.lastChallengeDate || "";

    if (savedLastChallengeDate === currentToday) {
      alert("Ya completaste el desafío de hoy. El siguiente se desbloquea mañana.");
      return;
    }

    const expectedIndex = completedDays.length;

    if (index !== expectedIndex) {
      alert("Debes completar los desafíos en orden.");
      return;
    }

    const updated = [...completedDays, index];

    setCompletedDays(updated);
    setLastChallengeDate(currentToday);

    await setDoc(
      ref,
      {
        ...oldData,
        completedDays: updated,
        progress: updated.length,
        lastChallengeDate: currentToday,
        currentChallengeDay: updated.length + 1,
        totalChallenges,
      },
      { merge: true }
    );

    await loadProgress(currentUser.uid);
    await loadRanking();
  };

  return {
    studentName,
    setStudentName,
    userPhoto,
    completedDays,
    setCompletedDays,
    pomodoroSessions,
    setPomodoroSessions,
    streak,
    ranking,
    loadRanking,
    loadProgress,
    resetProgress,
    saveProgress,
    savePomodoroProgress,
    toggleChallenge,
    dailyChallengeLocked,
    challengeProgress,
    totalChallenges,
    progressPercentage,
  };
}