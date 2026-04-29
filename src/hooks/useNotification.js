import { useState } from "react";

export default function useNotification() {
  const [notification, setNotification] = useState(null);

  const showSuccessNotification = (sessions) => {
    setNotification({
      title: "🎉 ¡Pomodoro completado!",
      message: `Sumaste 1 sesión de enfoque. Total: ${sessions} Pomodoros 🏅,`
    });

    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  return {
    notification,
    showSuccessNotification,
  };
}