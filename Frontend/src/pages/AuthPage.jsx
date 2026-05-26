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
  "w-full rounded-xl border border-zinc-700 bg-slate-950/80 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20";

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
  <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-white">
    <div className="absolute left-[-120px] top-[-120px] h-80 w-80 rounded-full bg-amber-400/20 blur-3xl" />
    <div className="absolute bottom-[-120px] right-[-120px] h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

    <section className="relative grid w-full max-w-6xl overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/90 shadow-2xl md:grid-cols-2">
      <div className="hidden bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-900 p-10 md:flex md:flex-col md:justify-between">
        <div>
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300 text-2xl font-black text-slate-950">
              T
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">TransitHub</h1>
              <p className="text-sm text-zinc-400">Sistema Municipal de Tránsito</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold leading-tight">
            Control inteligente de multas, vehículos y propietarios.
          </h2>

          <p className="mt-5 text-sm leading-6 text-zinc-400">
            Administra infracciones, pagos, reportes y usuarios desde una plataforma moderna,
            segura y fácil de usar.
          </p>
        </div>

        <div className="grid gap-3 text-sm text-zinc-300">
          <div className="rounded-2xl border border-zinc-800 bg-white/5 p-4">
            🚗 Gestión de vehículos
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-white/5 p-4">
            🧾 Control de multas y pagos
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-white/5 p-4">
            📊 Reportes administrativos
          </div>
        </div>
      </div>

      <div className="p-7 md:p-10">
        <header className="mb-6">
          <p className="text-xs uppercase tracking-[0.24em] text-amber-300">
            Acceso Seguro
          </p>
          <h1 className="mt-2 text-3xl font-bold text-zinc-100">{title}</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Bienvenida a TransitHub. Ingresa tus credenciales para continuar.
          </p>
        </header>

        {error && (
          <p className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
            {error}
          </p>
        )}

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
              onChange={(e) =>
                setLoginData({ ...loginData, usuario_o_correo: e.target.value })
              }
              required
            />

            <input
              className={INPUT_STYLE}
              type="password"
              placeholder="Contraseña"
              value={loginData.contrasena}
              onChange={(e) =>
                setLoginData({ ...loginData, contrasena: e.target.value })
              }
              required
            />

            <button
              disabled={loading}
              className="w-full rounded-xl bg-amber-300 px-4 py-3 font-bold text-zinc-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Validando..." : "Ingresar a TransitHub"}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                className="text-amber-300 hover:text-amber-200"
                onClick={() => setView(VIEWS.REGISTER)}
              >
                Crear cuenta
              </button>

              <button
                type="button"
                className="text-zinc-400 hover:text-zinc-200"
                onClick={() => setView(VIEWS.FORGOT)}
              >
                Olvidé mi contraseña
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
            <input className={INPUT_STYLE} type="email" placeholder="Correo electrónico" value={registroData.correo} onChange={(e) => setRegistroData({ ...registroData, correo: e.target.value })} required />
            <input className={INPUT_STYLE} type="password" placeholder="Contraseña segura (Aa1!)" value={registroData.contrasena} onChange={(e) => setRegistroData({ ...registroData, contrasena: e.target.value })} required />

            <button
              disabled={loading}
              className="w-full rounded-xl bg-amber-300 px-4 py-3 font-bold text-zinc-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Creando..." : "Crear cuenta"}
            </button>

            <button type="button" className="w-full text-sm text-zinc-400 hover:text-zinc-200" onClick={() => setView(VIEWS.LOGIN)}>
              Volver a iniciar sesión
            </button>
          </form>
        )}

        {view === VIEWS.FORGOT && (
          <form className="space-y-4" onSubmit={onForgot}>
            <input className={INPUT_STYLE} type="email" placeholder="Correo electrónico" value={correoRecuperacion} onChange={(e) => setCorreoRecuperacion(e.target.value)} required />

            <button disabled={loading} className="w-full rounded-xl bg-amber-300 px-4 py-3 font-bold text-zinc-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-70">
              {loading ? "Generando..." : "Solicitar recuperación"}
            </button>

            <button type="button" className="w-full text-sm text-zinc-400 hover:text-zinc-200" onClick={() => setView(VIEWS.LOGIN)}>
              Volver
            </button>
          </form>
        )}

        {view === VIEWS.RESET && (
          <form className="space-y-4" onSubmit={onReset}>
            <input className={INPUT_STYLE} placeholder="Token de recuperación" value={resetData.token} onChange={(e) => setResetData({ ...resetData, token: e.target.value })} required />
            <input className={INPUT_STYLE} type="password" placeholder="Nueva contraseña segura (Aa1!)" value={resetData.nuevaContrasena} onChange={(e) => setResetData({ ...resetData, nuevaContrasena: e.target.value })} required />

            {tokenRecuperacion && (
              <p className="rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-xs text-zinc-300">
                Token temporal generado: <span className="text-amber-200">{tokenRecuperacion}</span>
              </p>
            )}

            <button disabled={loading} className="w-full rounded-xl bg-amber-300 px-4 py-3 font-bold text-zinc-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-70">
              {loading ? "Actualizando..." : "Restablecer contraseña"}
            </button>

            <button type="button" className="w-full text-sm text-zinc-400 hover:text-zinc-200" onClick={() => setView(VIEWS.LOGIN)}>
              Volver a iniciar sesión
            </button>
          </form>
        )}
      </div>
    </section>
  </main>
);
}

export default AuthPage;
