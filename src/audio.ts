export type AudioEvent = 'pellet' | 'powerUp' | 'ghostEat' | 'phaseShift' | 'fruit' | 'gameOver';

type AudioCallback = (event: AudioEvent) => void;

export class AudioBus {
  private listeners = new Set<AudioCallback>();

  on(callback: AudioCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  emit(event: AudioEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }
}
