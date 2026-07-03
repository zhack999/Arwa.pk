import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { C } from "./shared";
import { Music, Music2, Volume2, VolumeX, Play, Pause, X } from "lucide-react";

// ─── Context ──────────────────────────────────────────────────────────────────
interface MusicCtx {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  hasAudio: boolean;
  togglePlay: () => void;
  toggleMute: () => void;
  setVolume: (v: number) => void;
}

const Ctx = createContext<MusicCtx | null>(null);

const AUDIO_PATH = "/audio/background.mp3";
const TRACK_NAME = "Botanical Ambience";

// ─── Provider ─────────────────────────────────────────────────────────────────
export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const [hasAudio,  setHasAudio]  = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted,   setIsMuted]   = useState(false);
  const [volume,    setVolumeState] = useState(0.45);

  // Check if audio file exists
  useEffect(() => {
    fetch(AUDIO_PATH, { method: "HEAD" })
      .then(res => {
        if (res.ok) {
          const audio = new Audio(AUDIO_PATH);
          audio.loop   = true;
          audio.volume = volume;
          audioRef.current = audio;
          setHasAudio(true);
        }
      })
      .catch(() => setHasAudio(false));

    return () => { audioRef.current?.pause(); };
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(m => !m);
  }, [isMuted]);

  const setVolume = useCallback((v: number) => {
    if (audioRef.current) audioRef.current.volume = v;
    setVolumeState(v);
  }, []);

  return (
    <Ctx.Provider value={{ isPlaying, isMuted, volume, hasAudio, togglePlay, toggleMute, setVolume }}>
      {children}
    </Ctx.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMusic must be within MusicProvider");
  return ctx;
}

// ─── Waveform animation ───────────────────────────────────────────────────────
function Waveform({ playing }: { playing: boolean }) {
  return (
    <div className="flex items-end gap-0.5" style={{ height: 14 }}>
      {[1, 0.5, 0.8, 0.3, 0.9, 0.6, 1].map((h, i) => (
        <motion.div
          key={i}
          animate={playing ? { scaleY: [h, 0.2, h * 0.8, 0.4, h] } : { scaleY: 0.15 }}
          transition={playing ? { duration: 0.8, delay: i * 0.1, repeat: Infinity, ease: "easeInOut" } : { duration: 0.4 }}
          style={{
            width: 2,
            height: 14,
            backgroundColor: C.gold,
            borderRadius: 1,
            transformOrigin: "bottom",
          }}
        />
      ))}
    </div>
  );
}

// ─── Floating Music Player ────────────────────────────────────────────────────
export function FloatingMusicPlayer() {
  const { isPlaying, isMuted, volume, hasAudio, togglePlay, toggleMute, setVolume } = useMusic();
  const [expanded, setExpanded]   = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!hasAudio || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 2 }}
        style={{
          position: "fixed",
          bottom: 88,
          left: 20,
          zIndex: 40,
          fontFamily: "'DM Sans', sans-serif",
        }}>
        <motion.div
          layout
          style={{
            backgroundColor: "rgba(26,61,43,0.95)",
            backdropFilter: "blur(12px)",
            border: `1px solid rgba(201,168,76,0.25)`,
            padding: expanded ? "12px 14px" : "10px 14px",
            display: "flex",
            flexDirection: "column",
            gap: expanded ? 8 : 0,
            minWidth: expanded ? 180 : "auto",
          }}>

          {/* Main row */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause music" : "Play music"}
              style={{ color: C.gold, background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
              {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            </button>

            {/* Waveform / icon */}
            <button onClick={() => setExpanded(e => !e)} aria-label="Toggle music player" style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
              {isPlaying ? <Waveform playing={isPlaying} /> : <Music size={13} color={C.muted} />}
            </button>

            {/* Track name (only when expanded) */}
            {expanded && (
              <span style={{ fontSize: "0.72rem", color: "rgba(245,240,232,0.55)", letterSpacing: "0.1em", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {TRACK_NAME}
              </span>
            )}

            {/* Mute */}
            <button onClick={toggleMute} aria-label={isMuted ? "Unmute" : "Mute"} style={{ color: isMuted ? "rgba(245,240,232,0.3)" : C.muted, background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
              {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>

            {/* Dismiss */}
            <button onClick={() => setDismissed(true)} aria-label="Close music player" style={{ color: "rgba(245,240,232,0.3)", background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
              <X size={11} />
            </button>
          </div>

          {/* Volume slider */}
          {expanded && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Volume2 size={11} color={C.muted} />
              <input
                type="range" min={0} max={1} step={0.05} value={isMuted ? 0 : volume}
                onChange={e => { setVolume(+e.target.value); if (+e.target.value > 0 && isMuted) toggleMute(); }}
                aria-label="Volume control"
                style={{ flex: 1, accentColor: C.gold, height: 3 }}
              />
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Navbar Music Toggle ──────────────────────────────────────────────────────
export function NavbarMusicToggle({ light = false }: { light?: boolean }) {
  const { isPlaying, togglePlay, hasAudio } = useMusic();
  if (!hasAudio) return null;
  return (
    <button
      onClick={togglePlay}
      aria-label={isPlaying ? "Pause background music" : "Play background music"}
      title={isPlaying ? "Pause music" : "Play music"}
      style={{ background: "none", border: "none", cursor: "pointer", padding: 6, display: "flex", alignItems: "center", color: light ? C.ivory : C.green, opacity: 0.7, transition: "opacity 0.2s" }}
      onMouseEnter={e => { (e.target as HTMLElement).closest("button")!.style.opacity = "1"; }}
      onMouseLeave={e => { (e.target as HTMLElement).closest("button")!.style.opacity = "0.7"; }}>
      {isPlaying ? <Music2 size={17} /> : <Music size={17} />}
    </button>
  );
}
