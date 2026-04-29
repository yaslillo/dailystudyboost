function Tasks({
  challenges = [],
  completedDays = [],
  activeChallengeIndex,
  pomodoroFinished,
  running,
  startChallengePomodoro,
  completeActiveChallenge,
  dailyChallengeLocked = false,
}) {
  const nextChallengeIndex = completedDays.length;

  return (
    <section className="tasks">
      <h2>📅 Desafíos diarios</h2>

      <div className="task-list">
        {challenges.map((challenge, index) => {
          const completed = completedDays.includes(index);
          const isNext = index === nextChallengeIndex;
          const isActive = index === activeChallengeIndex;
          const isFuture = index > nextChallengeIndex;

          let buttonText = "🔒 Bloqueado";
          let disabled = true;
          let onClick = undefined;

          if (completed) {
            buttonText = "✅ Completado";
          } else if (isFuture) {
            buttonText = "🔒 Bloqueado";
          } else if (isNext && dailyChallengeLocked) {
            buttonText = "⏳ Disponible mañana";
          } else if (isActive && running) {
            buttonText = "⏳ Pomodoro en curso";
          } else if (isActive && pomodoroFinished) {
            buttonText = "✅ Completar desafío";
            disabled = false;
            onClick = () => completeActiveChallenge(index);
          } else if (isNext && activeChallengeIndex === null) {
            buttonText = "▶️ Iniciar Pomodoro";
            disabled = false;
            onClick = () => startChallengePomodoro(index);
          }

          return (
            <div
              key={index}
              className={`task-card
                ${completed ? "task-completed" : ""}
                ${disabled && !completed ? "task-locked" : ""}
                ${isActive ? "task-active" : ""}
              `}
            >
              <span>
                Día {index + 1}:{" "}
                {typeof challenge === "string"
                  ? challenge
                  : challenge.title ||
                    challenge.text ||
                    challenge.name ||
                    challenge.task ||
                    "Desafío"}
              </span>

              <button disabled={disabled} onClick={onClick}>
                {buttonText}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Tasks;