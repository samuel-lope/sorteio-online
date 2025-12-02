// Sound effect service for raffle animations

type SoundType = 'win';

const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

// Create sound using Web Audio API
const createSound = (type: SoundType) => {
  if (!audioContext) return;

  const now = audioContext.currentTime;

  if (type === 'win') {
    // Win sound - ascending tones
    const notes = [523, 659, 784]; // C, E, G (major chord)
    
    notes.forEach((freq, idx) => {
      const winOsc = audioContext.createOscillator();
      const winGain = audioContext.createGain();
      
      winOsc.connect(winGain);
      winGain.connect(audioContext.destination);
      
      winOsc.type = 'sine';
      winOsc.frequency.setValueAtTime(freq, now);
      
      const startTime = now + (idx * 0.1);
      winGain.gain.setValueAtTime(0.2, startTime);
      winGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      
      winOsc.start(startTime);
      winOsc.stop(startTime + 0.3);
    });
  }
};

export const playWinSound = () => createSound('win');
