import { useMemo, useState } from "react";
import {
  forgotPassword,
  loginUser,
  registerUser,
  resetPassword,
} from "../services/authApi";

const VIEWS = {
  LOGIN: "LOGIN",
  REGISTER: "REGISTER",
  FORGOT: "FORGOT",
  RESET: "RESET",
};

const INPUT_STYLE =
  "w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-400";

function AuthPage({ onAuthenticated }) {
  const [view, setView] = useState(VIEWS.LOGIN);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tokenRecuperacion, setTokenRecuperacion] = useState("");

  const [registroData, setRegistroData] = useState({
    nombres: "",
    apellidos: "",
    nombre_usuario: "",
    correo: "",
    contrasena: "",
  });
  const [loginData, setLoginData] = useState({
    usuario_o_correo: "",
    contrasena: "",
  });
  const [correoRecuperacion, setCorreoRecuperacion] = useState("");
  const [resetData, setResetData] = useState({
    token: "",
    nuevaContrasena: "",
  });

  const title = useMemo(() => {
    if (view === VIEWS.REGISTER) return "Crear Cuenta";
    if (view === VIEWS.FORGOT) return "Recuperar Contrasena";
    if (view === VIEWS.RESET) return "Restablecer Contrasena";
    return "Iniciar Sesion";
  }, [view]);

  const resetAlerts = () => {
    setError("");
    setSuccess("");
  };

  const onRegister = async (e) => {
    e.preventDefault();
    resetAlerts();
    setLoading(true);
    try {
      await registerUser(registroData);
      setSuccess("Cuenta creada. Ahora puedes iniciar sesion.");
      setView(VIEWS.LOGIN);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onLogin = async (e) => {
    e.preventDefault();
    resetAlerts();
    setLoading(true);
    try {
      const data = await loginUser(loginData);
      localStorage.setItem("token", data.access_token);
      setSuccess("Autenticacion completada.");
      if (onAuthenticated) onAuthenticated(data.access_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onForgot = async (e) => {
    e.preventDefault();
    resetAlerts();
    setLoading(true);
    try {
      const data = await forgotPassword(correoRecuperacion);
      setSuccess(data.mensaje);
      if (data.token_recuperacion) {
        setTokenRecuperacion(data.token_recuperacion);
        setResetData((prev) => ({ ...prev, token: data.token_recuperacion }));
      }
      setView(VIEWS.RESET);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onReset = async (e) => {
    e.preventDefault();
    resetAlerts();
    setLoading(true);
    try {
      await resetPassword(resetData.token, resetData.nuevaContrasena);
      setSuccess("Contrasena restablecida. Inicia sesion con la nueva clave.");
      setView(VIEWS.LOGIN);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-xl rounded-3xl border border-slate-700 bg-slate-900/90 p-7 shadow-2xl md:p-10">
        <header className="mb-6">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Acceso Seguro</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-100">{title}</h1>
          <p className="mt-1 text-sm text-slate-300">
            Plataforma corporativa con autenticacion y control de acceso.
          </p>
        </header>

        {error && <p className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p>}
        {success && (
          <p className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            {success}
          </p>
        )}

        {view === VIEWS.LOGIN && (
          <form className="space-y-4" onSubmit={onLogin}>
            <input
              className={INPUT_STYLE}
              placeholder="Usuario o correo"
              value={loginData.usuario_o_correo}
              onChange={(e) => setLoginData({ ...loginData, usuario_o_correo: e.target.value })}
              required
            />
            <input
              className={INPUT_STYLE}
              type="password"
              placeholder="Contrasena"
              value={loginData.contrasena}
              onChange={(e) => setLoginData({ ...loginData, contrasena: e.target.value })}
              required
            />
            <button
              disabled={loading}
              className="w-full rounded-xl bg-cyan-500 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Validando..." : "Ingresar"}
            </button>
            <div className="flex items-center justify-between text-sm">
              <button type="button" className="text-cyan-300 hover:text-cyan-200" onClick={() => setView(VIEWS.REGISTER)}>
                Crear cuenta
              </button>
              <button type="button" className="text-slate-300 hover:text-slate-100" onClick={() => setView(VIEWS.FORGOT)}>
                Olvide mi contrasena
              </button>
            </div>
          </form>
        )}

        {view === VIEWS.REGISTER && (
          <form className="space-y-4" onSubmit={onRegister}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input className={INPUT_STYLE} placeholder="Nombres" value={registroData.nombres} onChange={(e) => setRegistroData({ ...registroData, nombres: e.target.value })} required />
              <input className={INPUT_STYLE} placeholder="Apellidos" value={registroData.apellidos} onChange={(e) => setRegistroData({ ...registroData, apellidos: e.target.value })} required />
            </div>
            <input className={INPUT_STYLE} placeholder="Nombre de usuario" value={registroData.nombre_usuario} onChange={(e) => setRegistroData({ ...registroData, nombre_usuario: e.target.value })} required />
            <input className={INPUT_STYLE} type="email" placeholder="Correo electronico" value={registroData.correo} onChange={(e) => setRegistroData({ ...registroData, correo: e.target.value })} required />
            <input className={INPUT_STYLE} type="password" placeholder="Contrasena segura (Aa1!)" value={registroData.contrasena} onChange={(e) => setRegistroData({ ...registroData, contrasena: e.target.value })} required />
            <button
              disabled={loading}
              className="w-full rounded-xl bg-cyan-500 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Creando..." : "Registrar"}
            </button>
            <button type="button" className="w-full text-sm text-slate-300 hover:text-slate-100" onClick={() => setView(VIEWS.LOGIN)}>
              Volver a iniciar sesion
            </button>
          </form>
        )}

        {view === VIEWS.FORGOT && (
          <form className="space-y-4" onSubmit={onForgot}>
            <input className={INPUT_STYLE} type="email" placeholder="Correo electronico" value={correoRecuperacion} onChange={(e) => setCorreoRecuperacion(e.target.value)} required />
            <button
              disabled={loading}
              className="w-full rounded-xl bg-cyan-500 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Generando..." : "Solicitar recuperacion"}
            </button>
            <button type="button" className="w-full text-sm text-slate-300 hover:text-slate-100" onClick={() => setView(VIEWS.LOGIN)}>
              Volver
            </button>
          </form>
        )}

        {view === VIEWS.RESET && (
          <form className="space-y-4" onSubmit={onReset}>
            <input className={INPUT_STYLE} placeholder="Token de recuperacion" value={resetData.token} onChange={(e) => setResetData({ ...resetData, token: e.target.value })} required />
            <input className={INPUT_STYLE} type="password" placeholder="Nueva contrasena segura (Aa1!)" value={resetData.nuevaContrasena} onChange={(e) => setResetData({ ...resetData, nuevaContrasena: e.target.value })} required />
            {tokenRecuperacion && (
              <p className="rounded-xl bg-slate-800 p-3 text-xs text-slate-300">
                Token temporal generado: <span className="text-cyan-300">{tokenRecuperacion}</span>
              </p>
            )}
            <button
              disabled={loading}
              className="w-full rounded-xl bg-cyan-500 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Actualizando..." : "Restablecer contrasena"}
            </button>
            <button type="button" className="w-full text-sm text-slate-300 hover:text-slate-100" onClick={() => setView(VIEWS.LOGIN)}>
              Volver a iniciar sesion
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

export default AuthPage;
