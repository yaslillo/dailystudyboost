import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function useAuth({ onUserLoaded } = {}) {
  const [user, setUser] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser && onUserLoaded) {
        await onUserLoaded(currentUser);
      }
    });

    return () => unsubscribe();
  }, [onUserLoaded]);

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
        streak: 0,
        lastStudyDate: "",
        photoURL: "",
      });

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

  return {
    user,
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    isRegistering,
    setIsRegistering,
    register,
    login,
    logout,
  };
}