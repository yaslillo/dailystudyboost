function Achievements({ unlockedAchievements }) {
  return (
    <section className="achievements">
      <h2>🏅 Logros desbloqueados</h2>

      <p className="section-help">
        Inicia el temporizador Pomodoro y completa sesiones de enfoque. Cada
        Pomodoro terminado desbloquea nuevos logros.
      </p>

      {unlockedAchievements.length === 0 ? (
        <p>
          Aún no tienes logros. Presiona “Iniciar” en el Pomodoro, completa la
          sesión y desbloquea tu primer logro 🎯⏱️
        </p>
      ) : (
        <div className="achievement-list">
          {unlockedAchievements.map((achievement, index) => (
            <div className="achievement-card achievement-pop" key={index}>
              {achievement.title}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Achievements;