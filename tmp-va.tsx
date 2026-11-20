'use client';
/**
 * DevAI voice assistant     wake word + press-to-talk (v2, single-mic architecture).
 *
 * Chrome allows only ONE SpeechRecognition stream at a time, so wake listening
 * and command capture must share the mic deliberately:
 *   - Wake mode: one continuous stream; on-device word-spotting for "DevAI".
 *     Nothing leaves the device until the wake word fires (privacy   8.3).
 *   - "DevAI, <command>" in one breath     command extracted and sent directly.
 *   - "DevAI" alone     greeting, then a dedicated command session.
 *   - Hold-to-talk aborts the wake stream first, waits for mic release, then
 *     starts the command stream (fixes "Mic already active").
 *   - Every disable/toggle aborts cleanly; restart loops check a ref, not
 *     stale state (fixes the chip/listener mismatch).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { speakExpressive, withEmotion } from '@/lib/voice-engine';
import { launchDeviceApp, isNativeApp } from '@/lib/native-bridge';

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  onaudiostart: (() => void) | null;
}
interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
  resultIndex: number;
}

type VoiceState = 'off' | 'wake' | 'command' | 'thinking' | 'speaking';

const WAKE_REGEX = /\b(dev+v?ai|dev\s?ai|de\s?vai|the\s?vai|dey\s?vai|dave\s?ai|devi|hey\s+dev(ai|vai))\b/i;
const WAKE_WORDS_LABEL = '"DevAI"';
const WAKE_HINT = 'Say "DevAI"   ';
/** Strip filler so "Hey DevAI, research X"     "research X" for the intent layer. */
function stripWakeWord(text: string): string {
  return text
    .replace(WAKE_REGEX, '')
    .replace(/^(,|\s)+/, '')
    .replace(/^(hey|ok|okay|please)\s+/i, '')
    .trim();
}

export default function VoiceAssistant() {
  const router = useRouter();
  const [wakeEnabled, setWakeEnabled] = useState(false);
  const [state, setState] = useState<VoiceState>('off');
  const [transcript, setTranscript] = useState('');
  const [reply, setReply] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [heard, setHeard] = useState('');
  const [supported, setSupported] = useState(true);

  const wakeRecRef = useRef<SpeechRecognitionLike | null>(null);
  const cmdRecRef = useRef<SpeechRecognitionLike | null>(null);
  const finalRef = useRef('');
  const wakeEnabledRef = useRef(false);
  const stateRef = useRef<VoiceState>('off');
  const busyRef = useRef(false);          // thinking/speaking     ignore wake hits
  const lastSpeechEndRef = useRef(0);     // echo guard after TTS
  const wakeBufferRef = useRef('');
  const wakeLastEventRef = useRef<number | null>(null);
  const wakeMicLockRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { busyRef.current = state === 'thinking' || state === 'speaking'; }, [state]);

  const setStateSafe = useCallback((s: VoiceState) => { stateRef.current = s; setState(s); }, []);

  /** Speak reply in the language DevAI answered in (global-language rule).
   *  Tier 2 (cloned voice) races a short timer: F5-TTS on CPU can take minutes,
   *  so if the WAV isn't back in ~8s we speak instantly with Tier 1 voices.
   *  Never block the conversation on synthesis latency. */
  const speak = useCallback((text: string, intentAction?: string, onDone?: () => void) => {
    setReply(text.replace(/\[\/?(?:happy|sad|excited|serious|warm|urgent|whisper|neutral)\]/g, ''));
    setStateSafe('speaking');
    const finish = () => {
      lastSpeechEndRef.current = Date.now();
      onDone ? onDone() : setStateSafe('off');
    };
    const CLONE_TIMEOUT_MS = 8000;
    let settled = false;
    let browserStarted = false;
    const playCloned = (url: string) => {
      const audio = new Audio(url);
      audio.onended = () => { settled = true; finish(); };
      audio.onerror = () => { if (!browserStarted) { settled = true; speakExpressive(text, finish); } };
      audio.play().catch(() => { if (!browserStarted) { settled = true; speakExpressive(text, finish); } });
    };
    const timeout = setTimeout(() => {
      if (!settled && !browserStarted) {
        browserStarted = true; // stop waiting for the clone
        speakExpressive(intentAction ? withEmotion(intentAction, text) : text, finish);
      }
    }, CLONE_TIMEOUT_MS);
    api.voiceSpeak(text, intentAction === 'create_task' ? 'happy' : intentAction === 'cancel_task' ? 'serious' : 'neutral')
      .then((cloned) => {
        clearTimeout(timeout);
        if (browserStarted) return;               // already speaking via Tier 1
        if (cloned) { settled = true; playCloned(cloned.url); return; }
        // Tier 1 fallback: emotion markup   prosody curves + voice matching.
        settled = true;
        speakExpressive(intentAction ? withEmotion(intentAction, text) : text, finish);
      })
      .catch(() => {
        clearTimeout(timeout);
        if (!browserStarted && !settled) { settled = true; speakExpressive(intentAction ? withEmotion(intentAction, text) : text, finish); }
      });
  }, [setStateSafe]);

  const sendCommand = useCallback(async (text: string) => {
    setStateSafe('thinking');
    setTranscript(text);
    // Live Neural Schema (ADR-010): lightweight voice-affect estimate   urgency
    // cues in phrasing proxy arousal until the emotion2vec sidecar lands (Tier 3).
    const urgent = /\b(now|immediately|urgent|asap|quick|fast|hurry|jaldi|abhi)\b/i.test(text);
    const polite = /\b(please|thanks|thank you|kindly|shukriya|dhanyavad)\b/i.test(text);
    api.affectObserve('voice', polite ? 0.4 : urgent ? -0.4 : 0, urgent ? 0.7 : 0.3, 0.5);
    try {
      const res = await api.voiceCommand(text, 'web');
      // open_app: navigate the dashboard right away (calendar, tasks,  ).
      const app = (res.data as { app?: string } | undefined)?.app;
      if (res.intent?.action === 'open_app' && app) {
        // DEVICE apps first — "open calendar" means the Android/iOS app, not a DevAI page.
        // Chrome launches native apps via intent:// URLs (no store redirect if absent).
        const ANDROID_INTENTS: Record<string, string> = {
          calendar: 'intent://#Intent;action=android.intent.action.VIEW;type=vnd.android.cursor.item/event;end',
          contacts: 'intent://#Intent;action=android.intent.action.VIEW;type=vnd.android.cursor.dir/contact;end',
          messages: 'intent://#Intent;action=android.intent.action.VIEW;type=vnd.android.cursor.dir/message;end',
          camera: 'intent://#Intent;action=android.media.action.IMAGE_CAPTURE;end',
          gallery: 'intent://#Intent;action=android.intent.action.VIEW;type=image/*;end',
          music: 'intent://#Intent;action=android.intent.action.MUSIC_PLAYER;end',
          youtube: 'intent://#Intent;package=com.google.android.youtube;end',
          gmail: 'intent://#Intent;package=com.google.android.gm;end',
          chrome: 'intent://#Intent;package=com.android.chrome;end',
          calculator: 'intent://#Intent;action=android.intent.action.MAIN;package=com.android.calculator2;end',
          clock: 'intent://#Intent;action=android.intent.action.SHOW_ALARMS;end',
          files: 'intent://#Intent;action=android.intent.action.VIEW;type=vnd.android.document/directory;end',
          maps: 'intent://#Intent;action=android.intent.action.VIEW;geo=0,0;end',
        };
        const DEVAI_ROUTES: Record<string, string> = {
          tasks: '/tasks', knowledge: '/knowledge', devices: '/devices',
          agents: '/agents', memory: '/memory', home: '/', settings: '/settings',
          security: '/security', connectors: '/connectors', calendar: '/calendar',
        };
        const intent = ANDROID_INTENTS[app];
        if (intent || isNativeApp()) {
          // native bridge first (full launch rights), Chrome intent:// fallback
          const launched = await launchDeviceApp(app);
          if (launched) return;
        }
        const route = DEVAI_ROUTES[app];
        if (route) {
          router.push(route);
          setTimeout(() => {
            if (window.location.pathname !== route) window.location.assign(route);
          }, 1200);
        }
      }
      speak(res.reply, res.intent?.action, () => {
        if (wakeEnabledRef.current) {
          setStateSafe('wake');
          setTimeout(() => { try { wakeRecRef.current?.start(); } catch { /* restarting */ } }, 600);
        } else {
          setStateSafe('off');
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'voice command failed');
      if (wakeEnabledRef.current) {
        setStateSafe('wake');
        setTimeout(() => { try { wakeRecRef.current?.start(); } catch { /* restarting */ } }, 800);
      } else {
        setStateSafe('off');
      }
    }
  }, [speak, setStateSafe, router]);

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) { setSupported(false); return; }

    //        Auto-start (deploy-once UX): resume the user's saved voice mode after
    // login. A device that opted into live voice stays hands-free across
    // reloads     no tap needed each session. Mic permission must already be
    // granted; otherwise we surface the error instead of prompting silently.
    if (localStorage.getItem('devai_voice_mode') === 'on') {
      wakeEnabledRef.current = true;
      setWakeEnabled(true);
      try {
        wakeRecRef.current?.start();
        setStateSafe('wake');
      } catch {
        setError('Voice listener needs mic permission     toggle wake word to retry.');
        wakeEnabledRef.current = false;
        setWakeEnabled(false);
      }
    }

    //        Wake listener: continuous, on-device word spotting       
    const wake = new Ctor();
    wake.lang = navigator.language || 'en-US';  // locale-aware wake word
    wake.continuous = true;
    wake.interimResults = true;
    wake.onresult = (e) => {
      wakeLastEventRef.current = Date.now();
      // live feedback: show the latest heard fragment so misses are visible
      const live = e.results[e.results.length - 1]?.[0]?.transcript ?? '';
      if (live) setHeard(live);
      if (!wakeEnabledRef.current || busyRef.current || stateRef.current !== 'wake') return;
      if (Date.now() - lastSpeechEndRef.current < 1500) return; // TTS echo guard

      // Rolling buffer of finals + latest interim
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) wakeBufferRef.current += ' ' + e.results[i][0].transcript;
      }
      const interim = e.results[e.results.length - 1]?.[0]?.transcript ?? '';
      const heard = (wakeBufferRef.current + ' ' + interim).toLowerCase();
      if (!WAKE_REGEX.test(heard)) return;

      // Wake word detected     extract anything said after it in the same breath
      const m = heard.match(WAKE_REGEX)!;
      const after = stripWakeWord(heard.slice((m.index ?? 0) + m[0].length));
      wakeBufferRef.current = '';
      try { wake.abort(); } catch { /* stopping */ }

      if (after.length > 3) {
        void sendCommand(after);
      } else {
        setStateSafe('command');
        finalRef.current = '';
        setTranscript('');
        setReply('');
        setError(null);
        speak("I'm listening. What would you like me to do?", undefined, () => {
          setStateSafe('command');
          setTimeout(() => { try { cmdRecRef.current?.start(); } catch { /* mic busy */ } }, 300);
        });
      }
    };
    wake.onerror = (e) => {
      wakeLastEventRef.current = null;
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        wakeEnabledRef.current = false;
        setWakeEnabled(false);
        setStateSafe('off');
        setError('Mic blocked by browser     allow microphone for this site, then toggle wake word again.');
      } else if (e.error !== 'no-speech' && e.error !== 'aborted') {
        setError(`listener: ${e.error}`);
      }
    };
    wake.onstart = () => {
      wakeLastEventRef.current = Date.now();
      // listener recovered — clear any stale mic error so the UI reflects reality
      setError(null);
    };
    wake.onaudiostart = () => {
      wakeLastEventRef.current = Date.now();
    };
    wake.onend = () => {
      // Restart ONLY while genuinely enabled (ref, not stale state).
      // 0ms delay: Android Chrome kills the stream after ~5s of silence —
      // the faster we re-arm, the smaller the dead window.
      if (wakeEnabledRef.current && stateRef.current === 'wake') {
        setTimeout(() => { try { wake.start(); } catch { /* restarting */ } }, 100);
      }
    };
    // Multi-tab mic arbitration: Chrome gives ONE recognition stream per device.
    // If a second DevAI tab (or any page) grabs it, this listener dies silently.
    // Detect the theft and surrender cleanly instead of flapping restart loops.
    wakeMicLockRef.current = setInterval(() => {
      if (!wakeEnabledRef.current || stateRef.current !== 'wake') return;
      // A healthy continuous listener emits results/audiostart; if it has been
      // silently dead (no events, not running) for >10s while ON, surface it.
      if (wakeLastEventRef.current && Date.now() - wakeLastEventRef.current > 10000) {
        setError('Another tab or app may be using the microphone     close other DevAI tabs, then toggle wake word.');
        wakeLastEventRef.current = null;
      }
    }, 5000);
    wakeRecRef.current = wake;

    //        Command listener: single-shot after wake or on hold       
    const cmd = new Ctor();
    cmd.lang = navigator.language || 'en-US';  // recognize the user's language
    cmd.continuous = false;
    cmd.interimResults = true;
    cmd.onresult = (e) => {
      let final = '';
      let interim = '';
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) final += r[0].transcript;
        else interim += r[0].transcript;
      }
      finalRef.current = final || finalRef.current;
      setTranscript(final || interim);
    };
    cmd.onerror = (e) => {
      if (e.error === 'not-allowed') setError('Mic blocked     allow microphone for this site.');
      else if (e.error !== 'no-speech' && e.error !== 'aborted') setError(`mic: ${e.error}`);
    };
    cmd.onend = () => {
      const text = finalRef.current.trim();
      if (text.length > 2) void sendCommand(text);
      else if (wakeEnabledRef.current) {
        setStateSafe('wake');
        setTimeout(() => { try { wake.start(); } catch { /* restarting */ } }, 400);
      } else {
        setStateSafe('off');
      }
    };
    cmdRecRef.current = cmd;

    return () => {
      if (wakeMicLockRef.current) clearInterval(wakeMicLockRef.current);
      try { wake.abort(); } catch { /* cleanup */ }
      try { cmd.abort(); } catch { /* cleanup */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Toggle wake word ON. Persisted so reloads resume hands-free (deploy-once). */
  async function toggleWake() {
    setError(null);
    if (wakeEnabledRef.current) {
      wakeEnabledRef.current = false;
      setWakeEnabled(false);
      try { wakeRecRef.current?.abort(); } catch { /* stopping */ }
      setStateSafe('off');
      localStorage.setItem('devai_voice_mode', 'off');
    } else {
      try { cmdRecRef.current?.abort(); } catch { /* stopping */ }
      wakeEnabledRef.current = true;
      setWakeEnabled(true);
      localStorage.setItem('devai_voice_mode', 'on');
      try {
        wakeRecRef.current?.start();
        setStateSafe('wake');
        // Greeting must hand the orb BACK to 'wake' when it finishes     otherwise
        // the state guard (state==='wake') blocks every future "Devvai" hit and
        // the chip shows ON while the orb reads "Voice off".
        speak('Wake word enabled. Say DevAI followed by your command.', undefined, () => {
          if (wakeEnabledRef.current) {
            setStateSafe('wake');
            setTimeout(() => { try { wakeRecRef.current?.start(); } catch { /* already running */ } }, 400);
          }
        });
      } catch {
        setError('Could not start listener     check mic permission.');
        wakeEnabledRef.current = false;
        setWakeEnabled(false);
        localStorage.setItem('devai_voice_mode', 'off');
      }
    }
  }

  function holdStart() {
    setError(null); setReply(''); setTranscript(''); finalRef.current = '';
    // Release the wake stream first     Chrome has a single mic.
    // Order matters: flip state BEFORE abort so wake.onend does not auto-restart
    // and steal the mic back from the command listener (the 'busy' race).
    if (wakeEnabledRef.current || stateRef.current === 'wake') {
      setStateSafe('command');
      wakeEnabledRef.current = false; // pause auto-restart during hold
      try { wakeRecRef.current?.abort(); } catch { /* stopping */ }
      // Android Chrome: start() must run synchronously within the user gesture —
      // a setTimeout start loses the gesture and is rejected as "busy". Start NOW;
      // if the wake stream is still releasing, poll-retry (each retry is allowed
      // because a recognition session is already active from the gesture).
      const tryStartCmd = (attempts: number) => {
        try {
          cmdRecRef.current?.start();
          setStateSafe('command');
        } catch {
          if (attempts > 0) {
            setTimeout(() => tryStartCmd(attempts - 1), 500);
          } else {
            setStateSafe('off');
            setError('Microphone busy — tap the orb again.');
          }
        }
      };
      tryStartCmd(8);
    } else {
      try { cmdRecRef.current?.start(); setStateSafe('command'); } catch { setError('Microphone busy — tap the orb again.'); }
    }
  }

  function holdEnd() {
    try { cmdRecRef.current?.stop(); } catch { /* stopping */ }
    // Resume wake-word mode if it was on before the hold (mic is free once
    // the command stream ends; wake.onend will auto-restart since flag is true)
    if (localStorage.getItem('devai_voice_mode') === 'on' && !wakeEnabledRef.current) {
      const tryStartWake = (attempts: number) => {
        if (!wakeEnabledRef.current) return;
        try {
          wakeRecRef.current?.start();
          wakeEnabledRef.current = true;
          setWakeEnabled(true);
          setStateSafe('wake');
        } catch {
          if (attempts > 0) setTimeout(() => tryStartWake(attempts - 1), 500);
        }
      };
      setTimeout(() => { wakeEnabledRef.current = true; setWakeEnabled(true); tryStartWake(6); }, 500);
    }
  }

  if (!supported) return null;

  const label: Record<VoiceState, string> = {
    off: 'Voice off',
    wake: `Listening for ${WAKE_WORDS_LABEL}   `,
    command: 'Listening   ',
    thinking: 'Thinking   ',
    speaking: 'DevAI speaking',
  };

  return (
    <div className="glass fixed bottom-5 right-5 z-40 flex flex-col items-center gap-3 rounded-2xl p-4">
      <button
        onClick={toggleWake}
        aria-label="Toggle DevAI wake word"
        className={`rounded-full px-3 py-1 text-[10px] font-medium transition ${
          wakeEnabled
            ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
            : 'bg-white/5 text-slate-400 ring-1 ring-white/10 hover:text-slate-200'
        }`}
      >
        {wakeEnabled ? `     ${WAKE_WORDS_LABEL} wake word ON` : '     Wake word off'}
      </button>

      {/* State orb     idle / listening / speaking artwork replaces emoji mic.
          Tap toggles wake; hold-to-talk still works. Thinking/speaking = press
          disabled (server run in flight), artwork communicates the state. */}
      <button
        onMouseDown={holdStart}
        onMouseUp={holdEnd}
        onTouchStart={holdStart}
        onTouchEnd={holdEnd}
        disabled={state === 'thinking' || state === 'speaking'}
        aria-label="Hold to talk to DevAI"
        className="group relative outline-none"
      >
        <img
          src={state === 'wake' || state === 'command' ? '/branding/devai-listening.webp' : state === 'speaking' ? '/branding/devai-speaking.webp' : '/branding/devai-idle.webp'}
          alt="DevAI"
          draggable={false}
          className={`h-24 w-24 rounded-full object-cover transition-all duration-300 ${
            state === 'command'
              ? 'scale-110 shadow-[0_0_36px_rgba(239,68,68,0.55)] ring-2 ring-red-400/70'
              : state === 'wake'
                ? 'animate-pulse shadow-[0_0_30px_rgba(16,185,129,0.5)] ring-2 ring-emerald-400/60'
                : state === 'speaking'
                  ? 'shadow-[0_0_32px_rgba(59,110,246,0.6)] ring-2 ring-brand-400/70'
                  : 'opacity-90 ring-1 ring-white/10 group-hover:scale-105 group-hover:opacity-100'
          }`}
        />
        {state === 'thinking' && (
          <span className="absolute inset-0 grid place-items-center rounded-full bg-black/40 text-xl">    </span>
        )}
      </button>
      <span className="text-[10px] text-slate-400">{label[state]}</span>
      {heard && wakeEnabled && !transcript && (
        <p className="max-w-[180px] truncate text-[10px] italic text-slate-500">heard: “{heard}”</p>
      )}
      {(transcript || reply || error) && (
        <div className="max-w-xs space-y-1 rounded-lg bg-black/40 p-2 text-xs">
          {transcript && <p className="text-slate-400">   {transcript}   </p>}
          {reply && <p className="text-slate-200">{reply}</p>}
          {error && <p className="text-red-400">{error}</p>}
        </div>
      )}
    </div>
  );
}
