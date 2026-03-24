import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  MessageSquareText,
  UserRound,
} from "lucide-react";
import { asesores, motivos, opcionesCalificacion, pasos } from "./data/surveyData";
import { crearEncuestaSatisfaccion } from "./lib/encuestasApi";
import fondo4 from "./assets/fondo4.jpg";
import fondo3 from "./assets/fondo3.jpg";

const STORAGE_KEY = "encuesta-rr-minimal-brand-v1";

const respuestasIniciales = {
  nombre: "",
  asesor: "",
  motivo: "",
  amabilidad: 0,
  seguimiento: 0,
  entrega: 0,
  satisfaccion: 0,
  comentario: "",
};

function cls(...clases) {
  return clases.filter(Boolean).join(" ");
}

function validarPaso(paso, respuestas) {
  const valor = respuestas[paso.id];

  switch (paso.tipo) {
    case "texto":
      return String(valor).trim().length >= 2;
    case "asesor":
    case "motivo":
      return Boolean(valor);
    case "calificacion":
      return Number(valor) > 0;
    case "comentario":
      return true;
    default:
      return false;
  }
}

function obtenerOpcionCalificacion(value) {
  return opcionesCalificacion.find((item) => item.value === value) || null;
}

function Encabezado() {
  return (
    <div className="mb-8 text-center sm:mb-10">
      <div className="mb-4 flex justify-center">
        <span className="inline-flex items-center rounded-full border border-white bg-white/5 px-3 py-1 text-xs font-semibold tracking-wide text-white">
          Automotriz R&amp;R
        </span>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
        Encuesta de experiencia
      </h1>

      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white sm:text-base">
        Queremos conocer su opinión para seguir mejorando la atención y la
        experiencia dentro de la agencia.
      </p>
    </div>
  );
}

function CabeceraPregunta({ paso }) {
  return (
    <div className="mb-6 sm:mb-8">
      <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white">
        {paso.etiqueta}
      </span>

      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
        {paso.titulo}
      </h2>
    </div>
  );
}

function PreguntaTexto({ paso, valor, onChange, onEnter }) {
  return (
    <div className="rounded-2xl border border-white/10 p-4 shadow-[0_18px_45px_-30px_rgba(19,30,92,0.28)] sm:rounded-3xl sm:p-5 md:p-6">
      <div className="mb-3 flex items-center gap-2 text-white">
        <UserRound className="h-4 w-4" />
        <span className="text-sm font-medium">Identificación</span>
      </div>

      <input
        type="text"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onEnter();
        }}
        placeholder={paso.placeholder}
        autoComplete="off"
        className="w-full border-0 bg-transparent text-lg font-semibold text-white outline-none placeholder:text-slate-400 sm:text-2xl"
      />
    </div>
  );
}

function PreguntaAsesor({ valor, onChange }) {
  return (
    <div className="space-y-4">
      <div className="max-h-[420px] overflow-y-auto rounded-2xl border border-[#131E5C]/10 p-2 shadow-[0_18px_45px_-30px_rgba(19,30,92,0.22)] sm:rounded-3xl sm:p-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {asesores.length > 0 ? (
            asesores.map((asesor) => {
              const activo = valor === asesor;

              return (
                <button
                  key={asesor}
                  type="button"
                  onClick={() => onChange(asesor)}
                  className={cls(
                    "flex min-h-[58px] items-center gap-3 rounded-2xl font-bold border px-3 py-3 text-left transition sm:min-h-[64px]",
                    activo
                      ? "border-[#131E5C] bg-[#131E5C] font-bold text-white shadow-[0_14px_30px_-18px_rgba(19,30,92,0.65)]"
                      : "border-[#131E5C]/10 text-white font-bold hover:border-[#131E5C]/25 hover:bg-white/15"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-base font-bold leading-5">
                      {asesor}
                    </p>
                  </div>

                  {activo && (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />
                  )}
                </button>
              );
            })
          ) : (
            <div className="px-3 py-8 text-center text-sm text-slate-500">
              No se encontraron asesores.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PreguntaMotivo({ valor, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {motivos.map((motivo) => {
        const activo = valor === motivo;

        return (
          <button
            key={motivo}
            type="button"
            onClick={() => onChange(motivo)}
            className={cls(
              "rounded-2xl border p-4 text-left transition sm:p-5",
              activo
                ? "border-[#131E5C] bg-[#131E5C] font-bold text-white shadow-[0_14px_30px_-18px_rgba(19,30,92,0.65)]"
                : "border-[#131E5C]/10 text-white font-bold hover:border-[#131E5C]/25 hover:bg-white/15"
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cls(
                  "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                  activo ? "bg-white" : "bg-white/25"
                )}
              />
              <p className="text-sm font-bold leading-6">{motivo}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function PreguntaCalificacion({ valor, onChange }) {
  const seleccion = obtenerOpcionCalificacion(valor);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {opcionesCalificacion.map((opcion) => {
          const activo = valor === opcion.value;

          return (
            <button
              key={opcion.value}
              type="button"
              onClick={() => onChange(opcion.value)}
              className={cls(
                "rounded-2xl border px-3 py-4 text-center transition sm:px-4 sm:py-5",
                activo
                  ? "border-[#131E5C] bg-[#131E5C] text-white shadow-[0_14px_30px_-18px_rgba(19,30,92,0.65)]"
                  : "border-[#131E5C]/10 text-white hover:border-[#131E5C]/25 hover:bg-white/15 hover:text-white"
              )}
            >
              <div className="text-2xl sm:text-3xl">{opcion.emoji}</div>
              <div className="mt-2 text-sm font-semibold">{opcion.titulo}</div>
            </button>
          );
        })}
      </div>

      {seleccion && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[#131E5C]/10 bg-[#131E5C]/5 px-4 py-3"
        >
          <p className="text-sm font-medium text-white">
            Seleccionó: {seleccion.titulo}
          </p>
          <p className="mt-1 text-sm text-white">{seleccion.descripcion}</p>
        </motion.div>
      )}
    </div>
  );
}

function PreguntaComentario({ paso, valor, onChange }) {
  return (
    <div className="rounded-2xl border border-white/10 p-4 shadow-[0_18px_45px_-30px_rgba(19,30,92,0.28)] sm:rounded-3xl sm:p-5 md:p-6">
      <div className="mb-3 flex items-center gap-2 text-white">
        <MessageSquareText className="h-4 w-4" />
        <span className="text-sm font-medium">Comentario opcional</span>
      </div>

      <textarea
        rows={6}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={paso.placeholder}
        className="w-full resize-none rounded-2xl border border-white/10 p-4 text-white outline-none transition focus:border-white/40 focus:ring-4 focus:ring-[#131E5C]/8"
      />

      <p className="mt-3 text-sm text-white">
        Puede dejar este campo vacío si así lo prefiere.
      </p>
    </div>
  );
}

function PantallaFinal({ respuestas, onRestart }) {
  const satisfaccion = obtenerOpcionCalificacion(respuestas.satisfaccion);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-2 text-center"
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#131E5C]/10 text-white">
        <CheckCircle2 className="h-8 w-8" />
      </div>

      <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white">
        Gracias por su respuesta
      </h2>

      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white sm:text-base">
        Su opinión es muy valiosa para ayudarnos a mejorar la experiencia de
        nuestros clientes.
      </p>

      <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-3 text-left sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/75">
            Cliente
          </p>
          <p className="mt-2 text-sm font-semibold text-white">
            {respuestas.nombre || "No indicado"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/75">
            Asesor
          </p>
          <p className="mt-2 text-sm font-semibold text-white">
            {respuestas.asesor || "No indicado"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/75">
            Motivo
          </p>
          <p className="mt-2 text-sm font-semibold text-white">
            {respuestas.motivo || "No indicado"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/75">
            Satisfacción
          </p>
          <p className="mt-2 text-sm font-semibold text-white">
            {satisfaccion?.titulo || "No indicado"}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRestart}
        className="mt-8 inline-flex w-full items-center justify-center rounded-2xl border border-[#131E5C] bg-white px-5 py-3 text-sm font-semibold text-[#131E5C] transition hover:bg-[#131E5C] hover:text-white sm:w-auto"
      >
        Responder otra encuesta
      </button>
    </motion.div>
  );
}

export default function App() {
  const [respuestas, setRespuestas] = useState(respuestasIniciales);
  const [indiceActual, setIndiceActual] = useState(0);
  const [direccion, setDireccion] = useState(1);
  const [finalizada, setFinalizada] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState("");

  const timeoutAvanceRef = useRef(null);

  const pasoActual = pasos[indiceActual];
  const puedeContinuar =
    pasoActual.tipo === "comentario" ? true : validarPaso(pasoActual, respuestas);

  useEffect(() => {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (!guardado) return;

    try {
      const datos = JSON.parse(guardado);

      setRespuestas({ ...respuestasIniciales, ...(datos.respuestas || {}) });
      setIndiceActual(
        typeof datos.indiceActual === "number"
          ? Math.min(datos.indiceActual, pasos.length - 1)
          : 0
      );
      setFinalizada(Boolean(datos.finalizada));
    } catch (error) {
      console.error("No se pudieron restaurar los datos:", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        respuestas,
        indiceActual,
        finalizada,
      })
    );
  }, [respuestas, indiceActual, finalizada]);

  useEffect(() => {
    return () => {
      if (timeoutAvanceRef.current) clearTimeout(timeoutAvanceRef.current);
    };
  }, []);

  function actualizarRespuesta(campo, valor) {
    setRespuestas((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  function siguiente() {
    if (!puedeContinuar) return;
    if (indiceActual >= pasos.length - 1) return;

    if (timeoutAvanceRef.current) clearTimeout(timeoutAvanceRef.current);

    setDireccion(1);
    setIndiceActual((prev) => prev + 1);
  }

  function anterior() {
    if (indiceActual <= 0) return;

    if (timeoutAvanceRef.current) clearTimeout(timeoutAvanceRef.current);

    setDireccion(-1);
    setIndiceActual((prev) => prev - 1);
  }

  function manejarSeleccionConAvance(campo, valor) {
    actualizarRespuesta(campo, valor);

    if (enviando) return;
    if (indiceActual >= pasos.length - 1) return;

    if (timeoutAvanceRef.current) clearTimeout(timeoutAvanceRef.current);

    timeoutAvanceRef.current = setTimeout(() => {
      setDireccion(1);
      setIndiceActual((prev) => {
        if (prev >= pasos.length - 1) return prev;
        return prev + 1;
      });
    }, 180);
  }

  function reiniciarEncuesta() {
    if (timeoutAvanceRef.current) clearTimeout(timeoutAvanceRef.current);

    localStorage.removeItem(STORAGE_KEY);
    setRespuestas(respuestasIniciales);
    setIndiceActual(0);
    setDireccion(1);
    setFinalizada(false);
    setEnviando(false);
    setErrorEnvio("");
  }

  async function finalizarEncuesta() {
    if (enviando) return;

    setEnviando(true);
    setErrorEnvio("");

    try {
      await crearEncuestaSatisfaccion(respuestas);
      setFinalizada(true);
    } catch (error) {
      console.error("Error al guardar la encuesta:", error);
      setErrorEnvio(
        error.message || "Ocurrió un error al guardar la encuesta."
      );
    } finally {
      setEnviando(false);
    }
  }

  function renderPregunta() {
    switch (pasoActual.tipo) {
      case "texto":
        return (
          <PreguntaTexto
            paso={pasoActual}
            valor={respuestas[pasoActual.id]}
            onChange={(valor) => actualizarRespuesta(pasoActual.id, valor)}
            onEnter={siguiente}
          />
        );

      case "asesor":
        return (
          <PreguntaAsesor
            valor={respuestas[pasoActual.id]}
            onChange={(valor) => manejarSeleccionConAvance(pasoActual.id, valor)}
          />
        );

      case "motivo":
        return (
          <PreguntaMotivo
            valor={respuestas[pasoActual.id]}
            onChange={(valor) => manejarSeleccionConAvance(pasoActual.id, valor)}
          />
        );

      case "calificacion":
        return (
          <PreguntaCalificacion
            valor={respuestas[pasoActual.id]}
            onChange={(valor) => manejarSeleccionConAvance(pasoActual.id, valor)}
          />
        );

      case "comentario":
        return (
          <PreguntaComentario
            paso={pasoActual}
            valor={respuestas[pasoActual.id]}
            onChange={(valor) => actualizarRespuesta(pasoActual.id, valor)}
          />
        );

      default:
        return null;
    }
  }

  function preloadImages(images = []) {
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }

  useEffect(() => {
    preloadImages([fondo4]);
  }, []);

  const mostrarBotonContinuarManual =
    pasoActual.tipo === "texto" || pasoActual.tipo === "comentario";

  return (
    <div className="min-h-screen overflow-hidden bg-[#131e5c]">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(44,91,187,0.24),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.10),_transparent_28%)]" />
        <div className="absolute left-[-12%] top-[-8%] rounded-full bg-[#2A63FF]/10 blur-3xl" />
        <div className="absolute bottom-[-12%] right-[-10%] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(6,16,45,0.96),rgba(11,31,94,0.92),rgba(7,16,38,0.98))]" />
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative w-full overflow-hidden rounded-lg border border-[#131E5C]/10 p-4 shadow-[0_30px_80px_-25px_rgba(19,30,92,0.14)] sm:rounded-3xl sm:p-6 md:p-8 lg:p-10"
          style={{
            backgroundImage: `url(${fondo3})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-[#131e5c]/20" />
          <div className="relative z-10">
            {finalizada ? (
              <PantallaFinal respuestas={respuestas} onRestart={reiniciarEncuesta} />
            ) : (
              <>
                <Encabezado />
                <CabeceraPregunta paso={pasoActual} />

                <AnimatePresence mode="wait" custom={direccion}>
                  <motion.div
                    key={pasoActual.id}
                    custom={direccion}
                    initial={{ opacity: 0, x: direccion > 0 ? 22 : -22 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direccion > 0 ? -22 : 22 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderPregunta()}
                  </motion.div>
                </AnimatePresence>

                {errorEnvio ? (
                  <div className="mt-4 rounded-2xl border border-red-300/40 bg-red-500/10 px-4 py-3 text-sm text-white">
                    {errorEnvio}
                  </div>
                ) : null}

                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={anterior}
                    disabled={indiceActual === 0 || enviando}
                    className={cls(
                      "inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition sm:w-auto",
                      indiceActual === 0 || enviando
                        ? "cursor-not-allowed border border-white/10 bg-slate-100 text-slate-400"
                        : "border border-[#131E5C]/20 bg-white text-[#131E5C] hover:border-white hover:bg-[#131E5C]/5 hover:text-white"
                    )}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Regresar
                  </button>

                  {mostrarBotonContinuarManual ? (
                    <button
                      type="button"
                      onClick={
                        indiceActual === pasos.length - 1 ? finalizarEncuesta : siguiente
                      }
                      disabled={enviando || !puedeContinuar}
                      className={cls(
                        "inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold transition sm:w-auto",
                        enviando || !puedeContinuar
                          ? "cursor-not-allowed bg-white/45 font-bold text-white hover:white"
                          : "bg-white/80 text-[#131e5c] font-bold hover:bg-white"
                      )}
                    >
                      {enviando ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Enviando...
                        </>
                      ) : indiceActual === pasos.length - 1 ? (
                        "Finalizar encuesta"
                      ) : (
                        <>
                          Continuar
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="w-full rounded-2xl border border-[#131E5C]/10 bg-[#131E5C]/5 px-4 py-3 text-center text-sm text-white sm:w-auto sm:text-left">
                      Seleccione una opción para continuar automáticamente.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}