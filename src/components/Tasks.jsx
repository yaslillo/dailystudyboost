function Tasks({ challenges, completedDays, toggleChallenge }) {
  return (
    <section className="tasks">
      <h2>Desafío 30 días</h2>

      <ul>
        {challenges.map((challenge, index) => (
          <li
            key={index}
            onClick={() => toggleChallenge(index)}
            className={completedDays.includes(index) ? "done" : ""}
          >
            {challenge}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Tasks;