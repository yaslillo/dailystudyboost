function Streak({ streak }) {
  const getStreakLevel = () => {
    if (streak >= 14) return "streak-legend";
    if (streak >= 7) return "streak-fire-gold";
    if (streak >= 3) return "streak-fire-orange";
    if (streak >= 1) return "streak-fire-blue";
    return "";
  };

  return (
    <section className={`streak ${getStreakLevel()}`}>
      <h2>🔥 Racha de estudio</h2>

      <p className="streak-number">
        {streak}
      </p>

      <p className="streak-message">
        {streak === 0 && "Completa una sesión Pomodoro para iniciar tu racha 🚀"}
        {streak >= 1 && streak < 3 && `Buen inicio: ${streak} día de constancia 💪`}
        {streak >= 3 && streak < 7 && `🔥 ${streak} días. Ya estás creando hábito.`}
        {streak >= 7 && streak < 14 && `🏆 ${streak} días. Nivel disciplina desbloqueado.`}
        {streak >= 14 && `👑 ${streak} días. Modo leyenda activado.`}
      </p>
    </section>
  );
}

export default Streak;