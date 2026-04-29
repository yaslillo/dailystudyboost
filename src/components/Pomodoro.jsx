import React from "react";

function Pomodoro({
  minutes,
  secs,
  running,
  setRunning,
  setSeconds,
}) {
  // 👉 Solo controla el reloj, NO desafíos
  const handleStart = () => {
    setRunning(true);
  };

  const handlePause = () => {
    setRunning(false);
  };

  const handleReset = () => {
    setRunning(false);
    setSeconds(25 * 60);
  };

  return (
    <section className="pomodoro">
      <h2>⏱️ Pomodoro</h2>

      <p className="pomodoro-help">
        Presiona “Iniciar” para estudiar libremente, o inicia un desafío diario
        desde la sección de desafíos.
      </p>

      <div className="timer">
        {String(minutes).padStart(2, "0")}:
        {String(secs).padStart(2, "0")}
      </div>

      <div>
        <button onClick={running ? handlePause : handleStart}>
          {running ? "Pausar" : "Iniciar"}
        </button>

        <button onClick={handleReset}>
          Reiniciar
        </button>
      </div>
    </section>
  );
}

export default Pomodoro;