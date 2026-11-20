'use client';

/**
 * DevAI expressive voice engine — emotion-rich, human-like speech.
 *
 * Strategy (progressive, all local-first):
 *   Tier 1 (now, free): browser speechSynthesis with EXPRESSIVE DIRECTIVES —
 *     SSML-style emotion markup parsed into prosody (pitch/rate/volume curves),
 *     emotion-matched voice selection, and sentence-level pauses.
 *   Tier 2 (upgrade): F5-TTS / OpenVoice local cloning (ADR-008 §4) — founder's
 *     cloned voice served from the worker plane; same directive contract.
 *   Tier 3: cloud expressive TTS (OpenAI gpt-4o-mini-tts with emotion prompts)
 *     when a key lands — routed through the gateway like every other provider.
 *
 * Markup contract (server replies may embed):
 *   [happy] ... [/happy]  [sad] ...  [excited]  [serious]  [warm]
 *   (pause:400)  (emphasis)word  (whisper)...(/whisper)
 * Unknown tags are stripped, never spoken.
 */

export type Emotion = 'neutral' | 'happy' | 'excited' | 'sad' | 'serious' | 'warm' | 'urgent' | 'whisper';

interface ProsodyProfile {
  pitch: number;   // multiplier
  rate: number;
  volume: number;
}

const EMOTION_PROSODY: Record<Emotion, ProsodyProfile> = {
  neutral: { pitch: 0.95, rate: 1.0, volume: 1.0 },
  happy: { pitch: 1.25, rate: 1.08, volume: 1.0 },
  excited: { pitch: 1.4, rate: 1.15, volume: 1.0 },
  sad: { pitch: 0.75, rate: 0.85, volume: 0.8 },
  serious: { pitch: 0.8, rate: 0.92, volume: 1.0 },
  warm: { pitch: 1.1, rate: 0.95, volume: 0.95 },
  urgent: { pitch: 1.05, rate: 1.25, volume: 1.0 },
  whisper: { pitch: 0.9, rate: 0.8, volume: 0.35 },
};

export interface SpokenSegment {
  text: string;
  emotion: Emotion;
}

/** Parse inline emotion markup into speakable segments. */
export function parseEmotionMarkup(raw: string): SpokenSegment[] {
  const cleaned = raw.replace(/\[\/?(\w+)\]/g, (_, tag) =>
    (['happy', 'sad', 'excited', 'serious', 'warm', 'urgent', 'whisper'].includes(tag) ? '' : _),
  );
  const segments: SpokenSegment[] = [];
  const regex = /\[(happy|excited|sad|serious|warm|urgent|whisper)\]([\s\S]*?)(?=\[|$)/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(cleaned)) !== null) {
    if (match.index > lastIndex) {
      const before = cleaned.slice(lastIndex, match.index).trim();
      if (before) segments.push({ text: before, emotion: 'neutral' });
    }
    const text = match[2].replace(/\[\/?\w+\]/g, '').trim();
    if (text) segments.push({ text, emotion: match[1].toLowerCase() as Emotion });
    lastIndex = regex.lastIndex;
  }
  const tail = cleaned.slice(lastIndex).replace(/\[\/?\w+\]/g, '').trim();
  if (tail) segments.push({ text: tail, emotion: 'neutral' });
  return segments.length ? segments : [{ text: cleaned.trim(), emotion: 'neutral' }];
}

/** Pick the best system voice for an emotion + language. */
function pickVoice(text: string, emotion: Emotion): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return undefined;
  // Script detection for global languages (§multilingual)
  const scriptHint = /[\u0900-\u097F]/.test(text) ? 'hi'
    : /[\u0600-\u06FF]/.test(text) ? 'ar'
      : /[\u0400-\u04FF]/.test(text) ? 'ru'
        : /[\u4E00-\u9FFF]/.test(text) ? 'zh'
          : /[\u3040-\u30FF]/.test(text) ? 'ja'
            : /[\uAC00-\uD7AF]/.test(text) ? 'ko'
              : null;
  const langMatch = scriptHint ? voices.filter((v) => v.lang.toLowerCase().startsWith(scriptHint)) : voices;
  const pool = langMatch.length ? langMatch : voices;
  // Prefer natural/local neural voices; emotion shifts preference slightly
  const natural = pool.filter((v) => /natural|neural|online/i.test(v.name));
  const base = natural.length ? natural : pool;
  // Female-leaning voices for warm/happy; deeper for serious/urgent
  const wantWarm = ['happy', 'warm', 'excited'].includes(emotion);
  const wantDeep = ['serious', 'urgent'].includes(emotion);
  const gendered = base.filter((v) =>
    wantWarm ? /female|zira|samantha|aria|jenny/i.test(v.name)
      : wantDeep ? /male|david|guy|christopher/i.test(v.name)
        : true,
  );
  return (gendered.length ? gendered : base)[0];
}

/** Speak an emotion-marked reply. Resolves when the full utterance finishes. */
export function speakExpressive(raw: string, onDone?: () => void): void {
  if (!('speechSynthesis' in window)) { onDone?.(); return; }
  window.speechSynthesis.cancel(); // clear any queued speech
  const segments = parseEmotionMarkup(raw);
  if (!segments.length) { onDone?.(); return; }

  segments.forEach((seg, idx) => {
    const u = new SpeechSynthesisUtterance(seg.text);
    const profile = EMOTION_PROSODY[seg.emotion];
    u.pitch = profile.pitch;
    u.rate = profile.rate;
    u.volume = profile.volume;
    const voice = pickVoice(seg.text, seg.emotion);
    if (voice) u.voice = voice;
    // (pause:N) directives become real gaps between segments
    const pauseMatch = seg.text.match(/^\(pause:(\d+)\)/);
    if (pauseMatch) {
      // pause before speaking this segment
      const ms = Math.min(2000, parseInt(pauseMatch[1], 10));
      u.text = seg.text.replace(pauseMatch[0], '').trim();
      setTimeout(() => window.speechSynthesis.speak(u), ms);
    } else {
      if (idx === segments.length - 1) {
        u.onend = () => onDone?.();
        u.onerror = () => onDone?.();
      }
      window.speechSynthesis.speak(u);
    }
  });
}

/** Emotion-aware reply wrapper — DevAI picks tone from intent/outcome. */
export function withEmotion(intentAction: string, baseReply: string): string {
  switch (intentAction) {
    case 'create_task': return `[happy]${baseReply}[/happy]`;
    case 'task_status':
    case 'list_tasks': return `[neutral]${baseReply}[/neutral]`;
    case 'memory_recall': return `[warm]${baseReply}[/warm]`;
    case 'cancel_task': return `[serious]${baseReply}[/serious]`;
    default: return baseReply; // converse replies carry their own markup from the model
  }
}
