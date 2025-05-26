import React, { useState, useEffect, useRef } from "react";
import styles from "./MeditationComponent.module.css";

type BreathPhase = "inhale" | "hold" | "exhale";
type SoundOption = "rain" | "forest" | "ocean" | "none";

const MeditationComponent: React.FC = () => {
  // Timer states
  const [duration, setDuration] = useState<number>(300); // 5 minutes in seconds
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  // Breathing states
  const [breathPhase, setBreathPhase] = useState<BreathPhase>("inhale");
  const [showBreathingGuide, setShowBreathingGuide] = useState<boolean>(true);

  // Sound states
  const [sound, setSound] = useState<SoundOption>("rain");
  const [volume, setVolume] = useState<number>(50);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);

        // Breathing cycle (4-7-8 pattern: inhale 4, hold 7, exhale 8)
        const cyclePosition = (duration - timeLeft) % 19;
        if (cyclePosition < 4) {
          setBreathPhase("inhale");
        } else if (cyclePosition < 11) {
          setBreathPhase("hold");
        } else {
          setBreathPhase("exhale");
        }
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setIsComplete(true);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, duration]);

  // Sound effect - handle play/pause based on isActive state
  useEffect(() => {
    if (!audioRef.current) return;

    // Set volume whenever it changes
    audioRef.current.volume = volume / 100;

    // Handle play/pause based on active state and sound selection
    if (isActive && sound !== "none") {
      audioRef.current
        .play()
        .catch((e) => console.error("Audio play failed:", e));
    } else {
      audioRef.current.pause();
    }

    // Mute if sound is none
    audioRef.current.muted = sound === "none";
  }, [isActive, sound, volume]);

  // Reset timer when duration changes
  useEffect(() => {
    setTimeLeft(duration);
    setIsActive(false);
    setIsComplete(false);
  }, [duration]);

  const toggleTimer = (): void => {
    const newActiveState = !isActive;
    setIsActive(newActiveState);
    setIsComplete(false);
  };

  const resetTimer = (): void => {
    setIsActive(false);
    setTimeLeft(duration);
    setIsComplete(false);
  };

  const handleDurationChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const newDuration = parseInt(e.target.value) * 60;
    setDuration(newDuration);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getBreathingInstruction = (): string => {
    switch (breathPhase) {
      case "inhale":
        return "Вдихайте...";
      case "hold":
        return "Затримка...";
      case "exhale":
        return "Видихайте...";
      default:
        return "";
    }
  };

  const handleSoundChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSound(e.target.value as SoundOption);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setVolume(parseInt(e.target.value));
  };

  const toggleBreathingGuide = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setShowBreathingGuide(e.target.checked);
  };

  return (
    <div className={styles["meditation-container"]}>
      <h2>Медитація</h2>

      <div className={styles["timer-section"]}>
        <div className={styles["time-display"]}>{formatTime(timeLeft)}</div>

        <div className={styles["timer-controls"]}>
          <button onClick={toggleTimer}>{isActive ? "Пауза" : "Старт"}</button>
          <button onClick={resetTimer}>Скинути</button>
        </div>

        <div className={styles["duration-selector"]}>
          <label>Тривалість (хвилини):</label>
          <select
            value={duration / 60}
            onChange={handleDurationChange}
            disabled={isActive}
          >
            <option value="1">1</option>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
            <option value="30">30</option>
          </select>
        </div>
      </div>

      {showBreathingGuide && isActive && (
        <div className={styles["breathing-guide"]}>
          <div className={styles["breathing-pulse"]}></div>
          <div className={styles["breathing-circle"]}></div>
          <p className={styles["breathing-instruction"]}>
            {getBreathingInstruction()}{" "}
            {/* This will be updated by the animation */}
          </p>
        </div>
      )}

      <div className={styles["sound-controls"]}>
        <h3>Фоновий звук</h3>
        <div className={styles["sound-options"]}>
          <label>
            <input
              type="radio"
              name="sound"
              value="rain"
              checked={sound === "rain"}
              onChange={handleSoundChange}
            />
            Дощ
          </label>
          <label>
            <input
              type="radio"
              name="sound"
              value="forest"
              checked={sound === "forest"}
              onChange={handleSoundChange}
            />
            Ліс
          </label>
          <label>
            <input
              type="radio"
              name="sound"
              value="ocean"
              checked={sound === "ocean"}
              onChange={handleSoundChange}
            />
            Океан
          </label>
          <label>
            <input
              type="radio"
              name="sound"
              value="none"
              checked={sound === "none"}
              onChange={handleSoundChange}
            />
            Вимкнено
          </label>
        </div>

        {sound !== "none" && (
          <div className={styles["volume-control"]}>
            <label>Гучність: {volume}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
            />
          </div>
        )}

        <audio ref={audioRef} src={`/sounds/${sound}.mp3`} loop />
      </div>

      <div className={styles["toggle-breathing"]}>
        <label>
          <input
            type="checkbox"
            checked={showBreathingGuide}
            onChange={toggleBreathingGuide}
          />
          Показувати інструкції дихання
        </label>
      </div>

      {isComplete && (
        <div className={styles["completion-message"]}>
          <p>Чудово! Ваша сесія медитації завершена.</p>
          <button onClick={resetTimer}>Почати нову сесію</button>
        </div>
      )}
    </div>
  );
};

export default MeditationComponent;
