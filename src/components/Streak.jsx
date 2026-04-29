function Streak({ streak }) {
  return (
    <section className="streak">
      <h2>🔥 Racha de estudio</h2>

      <p className="streak-number">{streak}</p>

      <p>
        {streak === 0
          ? "Completa una sesión Pomodoro para iniciar tu racha 🚀"
          : `Llevas ${streak} día${streak === 1 ? "" : "s"} de constancia 💪`}
      </p>
    </section>
  );
}

export default Streak;