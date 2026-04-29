import logo from "../logo.png";

function AuthScreen({
  email,
  setEmail,
  password,
  setPassword,
  name,
  setName,
  isRegistering,
  setIsRegistering,
  login,
  register,
}) {
  return (
    <div className="app">
      <div className="login-box">
        <img src={logo} alt="logo" className="logo" />

        <h1>DailyStudyBoost</h1>
        <p>{isRegistering ? "Crea tu cuenta" : "Inicia sesión"}</p>

        {isRegistering && (
          <input
            type="text"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {isRegistering ? (
          <>
            <button onClick={register}>Crear cuenta</button>
            <button onClick={() => setIsRegistering(false)}>
              Ya tengo cuenta
            </button>
          </>
        ) : (
          <>
            <button onClick={login}>Iniciar sesión</button>
            <button onClick={() => setIsRegistering(true)}>Registrarse</button>
          </>
        )}
      </div>
    </div>
  );
}

export default AuthScreen;