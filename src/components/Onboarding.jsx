import logo from "../logo.png";

function Onboarding({ finishOnboarding }) {
  return (
    <div className="onboarding">
      <img src={logo} alt="logo" className="onboarding-logo" />

      <h1>Bienvenido a DailyStudyBoost 🚀✨</h1>

      <p className="onboarding-text">
        Convierte el estudio en un hábito diario 💪📚. Completa desafíos, usa
        Pomodoro ⏱️, desbloquea logros 🏅 y sube en el ranking 🏆.
      </p>

      <div className="onboarding-box">
        <p>🎯 30 días para vencer la procrastinación</p>
        <p>⏱️ Pomodoro para estudiar con enfoque</p>
        <p>🏅 Logros que se desbloquean al cumplir</p>
        <p>🏆 Ranking para motivarte cada día</p>
      </div>

      <button onClick={finishOnboarding} className="start-btn">
        Empezar ahora 🚀
      </button>
    </div>
  );
}

export default Onboarding;