import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase";

export const updateUserName = async (uid, name) => {
  const ref = doc(db, "users", uid);

  await updateDoc(ref, {
    name: name,
  });
};

export const getUserProgress = async (uid) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return null;
  }

  return snap.data();
};

export const saveUserProgress = async ({
  studentName,
  completedDays,
  pomodoroSessions,
}) => {
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
      completedDays,
      progress: completedDays.length,
      pomodoroSessions,
    },
    { merge: true }
  );
};

export const getRanking = async () => {
  const snapshot = await getDocs(collection(db, "users"));

  const list = snapshot.docs.map((docItem) => {
    const data = docItem.data();

    return {
      id: docItem.id,
      name: data.name || data.email || "Estudiante",
      email: data.email || "",
      progress: data.completedDays ? data.completedDays.length : data.progress || 0,
      pomodoroSessions: data.pomodoroSessions || 0,
    };
  });

  return list.sort((a, b) => {
    if (b.progress !== a.progress) {
      return b.progress - a.progress;
    }

    return b.pomodoroSessions - a.pomodoroSessions;
  });
};