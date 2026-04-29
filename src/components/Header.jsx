import logo from "../logo.png";

function Header({ studentName, userEmail, logout }) {
  return (
    <header className="header">
      <img src={logo} alt="logo" className="logo" />
      <h1>DailyStudyBoost</h1>
      <p>Hola, {studentName || userEmail} 👋</p>

      <p className="description">
        🚀 Mejora tu enfoque y vence la procrastinación con desafíos diarios y
        la técnica Pomodoro. Completa 30 días de hábitos de estudio, sigue tu
        progreso y compite en el ranking con otros estudiantes.
      </p>

      <button onClick={logout}>Cerrar sesión</button>
    </header>
  );
}

export default Header;