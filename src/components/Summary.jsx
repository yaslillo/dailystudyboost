function Summary({ completedDays, pomodoroSessions }) {
  return (
    <section className="summary">
      <h2>Progreso</h2>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: (completedDays.length / 30) * 100 + "%" }}
        ></div>
      </div>

      <p>{completedDays.length}/30 días completados</p>
      <p>⏱️ Pomodoros completados: {pomodoroSessions}</p>
    </section>
  );
}

export default Summary;