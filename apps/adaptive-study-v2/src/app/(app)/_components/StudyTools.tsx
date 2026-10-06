"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  startSessionAction,
  endSessionAction,
  addDistractionAction,
  saveScratchpadAction,
  getScratchpadAction,
} from "@/lib/actions";

// ---------------- shared context ----------------
type ToolsCtx = {
  distractionCount: number;
  incrementDistraction: () => void;
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
};
const Ctx = createContext<ToolsCtx | null>(null);
export function useTools() {
  const c = useContext(Ctx);
  if (!c) throw new Error("ToolsProvider missing");
  return c;
}

export function ToolsProvider({ children }: { children: ReactNode }) {
  const [distractionCount, setDistractionCount] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  return (
    <Ctx.Provider
      value={{
        distractionCount,
        incrementDistraction: () => setDistractionCount((d) => d + 1),
        sessionId,
        setSessionId,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

// ---------------- modal helper ----------------
function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className={`surface w-full ${wide ? "max-w-3xl" : "max-w-md"} p-5`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="btn btn-ghost px-3 py-1 text-sm" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ---------------- PARKING LOT ----------------
export function ParkingLotButton() {
  const { incrementDistraction } = useTools();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  async function save() {
    const t = text.trim();
    if (!t) return;
    await addDistractionAction(t, "save");
    incrementDistraction();
    setText("");
    setOpen(false);
  }

  return (
    <>
      <button
        className="btn btn-ghost px-3 py-1 text-sm"
        onClick={() => setOpen(true)}
        title="Parking lot (Ctrl+Space)"
      >
        Park
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Thought parking lot">
        <p className="muted mb-3 text-sm">
          What just popped into your head? Save it and return to studying. You can review parked
          thoughts later. (Shortcut: Ctrl/⌘ + Space)
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="e.g. remember to email the lab instructor about the resistor values"
          autoFocus
        />
        <div className="mt-3 flex justify-end gap-2">
          <button className="btn btn-ghost" onClick={() => setOpen(false)}>
            Ignore
          </button>
          <button className="btn btn-primary" onClick={save}>
            Save &amp; return
          </button>
        </div>
      </Modal>
    </>
  );
}

// ---------------- FOCUS TIMER ----------------
export function FocusTimerButton() {
  const { sessionId, setSessionId, distractionCount } = useTools();
  const [open, setOpen] = useState(false);
  const [seconds, setSeconds] = useState(20 * 60);
  const [running, setRunning] = useState(false);
  const [breakMode, setBreakMode] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const audioRef = useRef<AudioBufferSourceNode | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startAudio() {
    try {
      const CtxAudio = window.AudioContext || (window as any).webkitAudioContext;
      const ac = new CtxAudio();
      const size = ac.sampleRate * 2;
      const buffer = ac.createBuffer(1, size, ac.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
      const src = ac.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      const gain = ac.createGain();
      gain.gain.value = 0.04;
      src.connect(gain).connect(ac.destination);
      src.start();
      audioRef.current = src;
    } catch {
      /* audio optional */
    }
  }
  function stopAudio() {
    try {
      audioRef.current?.stop();
    } catch {
      /* noop */
    }
    audioRef.current = null;
  }

  function tick() {
    setSeconds((s) => {
      if (s <= 1) {
        finish();
        return 0;
      }
      return s - 1;
    });
  }

  async function start() {
    if (running) return;
    const { id } = await startSessionAction();
    setSessionId(id);
    setRunning(true);
    if (audioOn) startAudio();
    intervalRef.current = setInterval(tick, 1000);
  }

  async function stopEarly() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    stopAudio();
    if (sessionId) {
      const elapsed = 20 * 60 - seconds;
      await endSessionAction({
        sessionId,
        durationMinutes: Math.max(1, Math.round(elapsed / 60)),
        earlyExit: true,
        distractionCount,
      });
    }
    setSessionId(null);
    setOpen(false);
  }

  async function finish() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    stopAudio();
    setBreakMode(true);
    if (sessionId) {
      await endSessionAction({
        sessionId,
        durationMinutes: 20,
        earlyExit: false,
        distractionCount,
      });
      setSessionId(null);
    }
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <>
      <button
        className="btn btn-ghost px-3 py-1 text-sm"
        onClick={() => setOpen(true)}
        title="Focus timer"
      >
        Focus 20:00
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Focus block">
        {!breakMode ? (
          <>
            <div className="grid place-items-center py-6">
              <div className="font-mono text-6xl tabular-nums">{mm}:{ss}</div>
            </div>
            <p className="text-center muted text-sm">
              One task only. If a thought appears, press <b>Ctrl/⌘ + Space</b> to park it.
            </p>
            <label className="mt-4 flex items-center justify-center gap-2 text-sm muted">
              <input
                type="checkbox"
                className="w-auto"
                checked={audioOn}
                onChange={(e) => setAudioOn(e.target.checked)}
              />
              White-noise ambient (optional; not a treatment)
            </label>
            <div className="mt-5 flex justify-center gap-2">
              {!running ? (
                <button className="btn btn-primary" onClick={start}>
                  Start 20 min
                </button>
              ) : (
                <button className="btn btn-ghost" onClick={stopEarly}>
                  Stop early
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="py-4 text-center">
            <h4 className="text-lg font-semibold">Break — 5 minutes</h4>
            <p className="muted mt-2 text-sm">
              Stand up. Look away from the screen. Drink water. The block was recorded to your
              account.
            </p>
            <button
              className="btn btn-primary mt-4"
              onClick={() => {
                setBreakMode(false);
                setSeconds(20 * 60);
                setOpen(false);
              }}
            >
              Done
            </button>
          </div>
        )}
      </Modal>
    </>
  );
}

// ---------------- SCRATCHPAD ----------------
export function ScratchpadButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn btn-ghost px-3 py-1 text-sm" onClick={() => setOpen(true)}>
        Scribble
      </button>
      <ScratchpadModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function ScratchpadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [strokes, setStrokes] = useState<{ points: { x: number; y: number }[]; color: string }[]>([]);
  const [color, setColor] = useState("#7dd3fc");
  const drawing = useRef(false);
  const current = useRef<{ points: { x: number; y: number }[]; color: string } | null>(null);

  function redraw() {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, cv.width, cv.height);
    const all = current.current ? [...strokes, current.current] : strokes;
    for (const s of all) {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = "round";
      ctx.beginPath();
      s.points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.stroke();
    }
  }

  useEffect(() => {
    if (open) {
      getScratchpadAction({}).then((data) => {
        if (Array.isArray(data)) setStrokes(data as any);
        setTimeout(redraw, 30);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    redraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strokes]);

  function pos(e: React.PointerEvent) {
    const cv = canvasRef.current!;
    const rect = cv.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * cv.width,
      y: ((e.clientY - rect.top) / rect.height) * cv.height,
    };
  }
  function down(e: React.PointerEvent) {
    drawing.current = true;
    current.current = { points: [pos(e)], color };
  }
  function move(e: React.PointerEvent) {
    if (!drawing.current || !current.current) return;
    current.current.points.push(pos(e));
    redraw();
  }
  function up() {
    if (current.current) {
      setStrokes((s) => [...s, current.current!]);
      current.current = null;
    }
    drawing.current = false;
  }
  function clear() {
    setStrokes([]);
    current.current = null;
  }
  async function save() {
    await saveScratchpadAction({ data: strokes });
  }

  return (
    <Modal open={open} onClose={onClose} title="Scratchpad" wide>
      <p className="muted mb-2 text-sm">
        Draw diagrams, force diagrams, graphs or scribbles. Saved privately to your account.
      </p>
      <div className="mb-2 flex items-center gap-2">
        {["#7dd3fc", "#f87171", "#fbbf24", "#34d399", "#e5e7eb"].map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className="h-7 w-7 rounded-full border-2"
            style={{ background: c, borderColor: color === c ? "#fff" : "transparent" }}
          />
        ))}
        <button className="btn btn-ghost ml-auto px-3 py-1 text-sm" onClick={clear}>
          Clear
        </button>
        <button className="btn btn-primary px-3 py-1 text-sm" onClick={save}>
          Save
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={340}
        className="w-full rounded-lg border border-[#233052] bg-[#0b1020] touch-none"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
      />
    </Modal>
  );
}
