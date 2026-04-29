function Pomodoro({
  minutes,
  secs,
  running,
  setRunning,
  setSeconds,
}) {
  return (
    <section className="pomodoro">
      <h2>⏱️ Pomodoro</h2>

      <p className="pomodoro-help">
        Presiona “Iniciar” y estudia hasta que el temporizador llegue a 0. Al
        finalizar, sumarás 1 Pomodoro y podrás desbloquear logros 🏅
      </p>

      <p className="timer">
        {minutes}:{secs.toString().padStart(2, "0")}
      </p>

      <button onClick={() => setRunning(!running)}>
        {running ? "Pausar" : "Iniciar"}
      </button>

      <button
        onClick={() => {
          setRunning(false);
          setSeconds(25 * 60);
        }}
      >
        Reiniciar
      </button>
    </section>
  );
}

export default Pomodoro;