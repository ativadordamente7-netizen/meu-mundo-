/**
 * Peaceful, tender sound generator for the 3D portal experience using Web Audio API.
 * Produces soft pentatonic sine waves with warm lowpass filters.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playWarmChime(frequency = 528, duration = 1.8, gainLevel = 0.08) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Warm low-pass filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + duration);

    // Gentle envelope: soft attack and slow exponential decay
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainLevel, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  } catch (e) {
    console.debug('Audio not allowed or supported:', e);
  }
}

export function playInfinityTone() {
  // Arpeggiated gentle pentatonic chord (F# / A# / C# / D# / F#) representing wonder and love
  const notes = [370.0, 466.16, 554.37, 622.25, 739.99];
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      playWarmChime(freq, 2.2, 0.06);
    }, idx * 220);
  });
}

export function playPortalExpansionSound() {
  const notes = [277.18, 329.63, 440.0, 554.37, 659.25, 880.0];
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      playWarmChime(freq, 2.5, 0.05);
    }, idx * 160);
  });
}
