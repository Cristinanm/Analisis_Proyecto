import { useEffect, useMemo, useState } from "react";
import {
  forgotPassword,
  getMyProfile,
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
  "w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-400";

function AuthPage() {
  const [view, setView] = useState(VIEWS.LOGIN);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [perfil, setPerfil] = useState(null);
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

  useEffect(() => {
    if (!token) {
      setPerfil(null);
      return;
    }

    getMyProfile(token)
      .then((data) => setPerfil(data))
      .catch(() => {
        localStorage.removeItem("token");
        setToken("");
      });
  }, [token]);

  const title = useMemo(() => {
    if (view === VIEWS.REGISTER) return "Crea tu cuenta";
    if (view === VIEWS.FORGOT) return "Recuperar contrasena";
    if (view === VIEWS.RESET) return "Restablecer contrasena";
    return "Iniciar sesion";
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
      setToken(data.access_token);
      setSuccess("Autenticacion completada.");
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

  if (perfil) {
    return (
      <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="absolute -left-6 top-12 h-36 w-36 rounded-full bg-cyan-500/30 blur-3xl" />
        <div className="absolute bottom-12 right-0 h-40 w-40 rounded-full bg-amber-500/25 blur-3xl" />
        <section className="w-full max-w-xl rounded-3xl border border-slate-700/70 bg-slate-900/85 p-8 shadow-2xl backdrop-blur">
          <h1 className="text-3xl font-bold text-cyan-300">Bienvenido al sistema</h1>
          <p className="mt-2 text-slate-300">
            Acceso validado correctamente. Este usuario puede usar las funcionalidades de la plataforma.
          </p>
          <div className="mt-6 space-y-2 rounded-2xl bg-slate-800/80 p-5 text-sm">
            <p>
              <span className="text-slate-400">Nombre:</span> {perfil.nombres} {perfil.apellidos}
            </p>
            <p>
              <span className="text-slate-400">Usuario:</span> {perfil.nombre_usuario}
            </p>
            <p>
              <span className="text-slate-400">Correo:</span> {perfil.correo}
            </p>
            <p>
              <span className="text-slate-400">Rol:</span>{" "}
              <span className="rounded-md bg-cyan-900/70 px-2 py-1 text-cyan-200">{perfil.rol}</span>
            </p>
          </div>
          <button
            className="mt-6 w-full rounded-xl bg-amber-500 px-4 py-2.5 font-semibold text-slate-900 transition hover:bg-amber-400"
            onClick={() => {
              localStorage.removeItem("token");
              setToken("");
              setPerfil(null);
              setView(VIEWS.LOGIN);
            }}
          >
            Cerrar sesion
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute left-4 top-10 h-40 w-40 animate-floaty rounded-full bg-cyan-500/35 blur-3xl" />
      <div className="absolute bottom-8 right-4 h-44 w-44 animate-floaty rounded-full bg-amber-500/30 blur-3xl" />
      <section className="relative w-full max-w-xl rounded-3xl border border-slate-700/70 bg-slate-900/85 p-7 shadow-2xl backdrop-blur md:p-10">
        <header className="mb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Modulo de autenticacion</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-100">{title}</h1>
          <p className="mt-1 text-sm text-slate-300">
            Registro seguro, validacion de credenciales y recuperacion de contrasena.
          </p>
        </header>

        {error && <p className="mb-4 rounded-xl border border-red-400/40 bg-red-500/15 p-3 text-sm text-red-200">{error}</p>}
        {success && (
          <p className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-500/15 p-3 text-sm text-emerald-200">
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
              <button type="button" className="text-amber-300 hover:text-amber-200" onClick={() => setView(VIEWS.FORGOT)}>
                Olvide mi contrasena
              </button>
            </div>
          </form>
        )}

        {view === VIEWS.REGISTER && (
          <form className="space-y-4" onSubmit={onRegister}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                className={INPUT_STYLE}
                placeholder="Nombres"
                value={registroData.nombres}
                onChange={(e) => setRegistroData({ ...registroData, nombres: e.target.value })}
                required
              />
              <input
                className={INPUT_STYLE}
                placeholder="Apellidos"
                value={registroData.apellidos}
                onChange={(e) => setRegistroData({ ...registroData, apellidos: e.target.value })}
                required
              />
            </div>
            <input
              className={INPUT_STYLE}
              placeholder="Nombre de usuario"
              value={registroData.nombre_usuario}
              onChange={(e) => setRegistroData({ ...registroData, nombre_usuario: e.target.value })}
              required
            />
            <input
              className={INPUT_STYLE}
              type="email"
              placeholder="Correo electronico"
              value={registroData.correo}
              onChange={(e) => setRegistroData({ ...registroData, correo: e.target.value })}
              required
            />
            <input
              className={INPUT_STYLE}
              type="password"
              placeholder="Contrasena segura (Aa1!)"
              value={registroData.contrasena}
              onChange={(e) => setRegistroData({ ...registroData, contrasena: e.target.value })}
              required
            />
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
            <input
              className={INPUT_STYLE}
              type="email"
              placeholder="Correo electronico"
              value={correoRecuperacion}
              onChange={(e) => setCorreoRecuperacion(e.target.value)}
              required
            />
            <button
              disabled={loading}
              className="w-full rounded-xl bg-amber-500 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
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
            <input
              className={INPUT_STYLE}
              placeholder="Token de recuperacion"
              value={resetData.token}
              onChange={(e) => setResetData({ ...resetData, token: e.target.value })}
              required
            />
            <input
              className={INPUT_STYLE}
              type="password"
              placeholder="Nueva contrasena segura (Aa1!)"
              value={resetData.nuevaContrasena}
              onChange={(e) => setResetData({ ...resetData, nuevaContrasena: e.target.value })}
              required
            />
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
