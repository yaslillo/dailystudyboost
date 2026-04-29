function Stats({ completedDays, pomodoroSessions }) {
  const progressPercent = Math.round((completedDays.length / 30) * 100);
  const pendingDays = 30 - completedDays.length;

  let focusLevel = "Inicial 🌱";

  if (pomodoroSessions >= 3) focusLevel = "En progreso 🔥";
  if (pomodoroSessions >= 5) focusLevel = "Constante 🚀";
  if (pomodoroSessions >= 10) focusLevel = "Disciplinado 🏆";
  if (pomodoroSessions >= 20) focusLevel = "Maestro del enfoque 👑";

  return (
    <section className="stats">
      <h2>📊 Estadísticas</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>{progressPercent}%</h3>
          <p>Progreso total</p>
        </div>

        <div className="stat-card">
          <h3>{pendingDays}</h3>
          <p>Días pendientes</p>
        </div>

        <div className="stat-card">
          <h3>{pomodoroSessions}</h3>
          <p>Pomodoros completados</p>
        </div>

        <div className="stat-card">
          <h3>{focusLevel}</h3>
          <p>Nivel de enfoque</p>
        </div>
      </div>
    </section>
  );
}

export default Stats;