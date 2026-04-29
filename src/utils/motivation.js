export const getMotivationMessage = ({
  completedDays,
  userPosition,
  streak,
  pomodoroSessions,
}) => {
  if (completedDays.length >= 30) {
    return "👑 Completaste los 30 días. Nivel leyenda desbloqueado.";
  }

  if (userPosition === 1 && completedDays.length >= 10) {
    return "🏆 Vas #1 en el ranking. Mantén tu lugar con otro Pomodoro.";
  }

  if (streak >= 7) {
    return `🔥 ${streak} días de racha. Esto ya es disciplina real.;`
  }

  if (streak >= 3) {
    return `💪 ${streak} días seguidos. El hábito ya empezó.;`
  }

  if (pomodoroSessions >= 10) {
    return `🍅 ${pomodoroSessions} Pomodoros. Estás entrando en flow.;`
  }

  if (completedDays.length >= 15) {
    return `🚀 ${completedDays.length}/30 días. Ya pasaste la mitad.;`
  }

  if (completedDays.length >= 5) {
    return `🌱 ${completedDays.length} días completados. La constancia está creciendo.;`
  }

  if (pomodoroSessions >= 1) {
    return "🍅 Primer Pomodoro listo. Ahora construye ritmo.";
  }

  return "🔥 Haz 1 Pomodoro hoy. Solo uno. Empieza ahí.";
};