function Ranking({ ranking }) {
  return (
    <section className="ranking">
      <h2>🏆 Ranking</h2>

      <div className="ranking-list">
        {ranking.map((student, index) => {
          const medals = ["🥇", "🥈", "🥉"];

          let rankClass = "ranking-card";
          if (index === 0) rankClass += " gold";
          if (index === 1) rankClass += " silver";
          if (index === 2) rankClass += " bronze";

          const initial = (student.name || student.email || "E")
            .charAt(0)
            .toUpperCase();

          return (
            <div className={rankClass} key={student.id || index}>
              <div className="rank-position">
                {medals[index] || "#" + (index + 1)}
              </div>

              <div className="rank-avatar">
                {student.photoURL ? (
                  <img src={student.photoURL} alt="avatar" />
                ) : (
                  initial
                )}
              </div>

              <div className="rank-info">
                <p className="rank-name">{student.name || student.email}</p>

                <p className="rank-progress">
                  {student.progress || 0} días completados ·{" "}
                  {student.pomodoroSessions || 0} Pomodoros
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Ranking;