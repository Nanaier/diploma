import React, { useState, useEffect, useRef } from "react";
import styles from "./BreathingExerciseComponent.module.css";

export interface ExerciseStep {
  title: string;
  description: string;
  duration: number;
  type: "inhale" | "exhale" | "hold" | "rest";
  repeatCount?: number;
}

interface BreathingExerciseProps {
  exercise: {
    name: string;
    description: string;
    steps: ExerciseStep[];
  };
}

const BreathingExerciseComponent: React.FC<BreathingExerciseProps> = ({
  exercise,
}) => {
  const stepCompleteSound = "/sounds/chime-sound-7143.mp3";
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [repeatCount, setRepeatCount] = useState(0);
  const [animationPaused, setAnimationPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(stepCompleteSound);
    audioRef.current.volume = 0.1;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current
          .play()
          .catch((e) => console.log("Помилка відтворення звуку:", e));
      }

      if (currentStep < exercise.steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
        setTimeLeft(exercise.steps[currentStep + 1].duration);
      } else {
        const currentStepData = exercise.steps[currentStep];
        if (
          currentStepData.repeatCount &&
          repeatCount < currentStepData.repeatCount
        ) {
          setRepeatCount((prev) => prev + 1);
          setCurrentStep(0);
          setTimeLeft(exercise.steps[0].duration);
        } else {
          setIsRunning(false);
          setIsComplete(true);
        }
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, timeLeft, currentStep, exercise.steps, repeatCount]);

  const startExercise = () => {
    setIsRunning(true);
    setAnimationPaused(false);
    if (timeLeft === 0) {
      setTimeLeft(exercise.steps[currentStep].duration);
    }
  };

  const pauseExercise = () => {
    setIsRunning(false);
    setAnimationPaused(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const resetExercise = () => {
    setIsRunning(false);
    setAnimationPaused(false);
    setCurrentStep(0);
    setTimeLeft(0);
    setIsComplete(false);
    setRepeatCount(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const currentStepDuration = exercise.steps[currentStep].duration;
  const progress =
    currentStepDuration > 0
      ? ((currentStepDuration - timeLeft) / currentStepDuration) * 100
      : 100;
  const totalProgress =
    ((currentStep + (timeLeft === 0 ? 1 : 1 - timeLeft / currentStepDuration)) /
      exercise.steps.length) *
    100;

  const currentStepType = exercise.steps[currentStep].type;

  return (
    <div className={styles["breathing-container"]}>
      <h1 className={styles["exercise-title"]}>{exercise.name}</h1>
      <p className={styles["exercise-description"]}>{exercise.description}</p>

      <div className={styles["progress-bar"]}>
        <div
          className={styles["progress"]}
          style={{ width: `${totalProgress}%` }}
        />
      </div>

      {isComplete ? (
        <div className={styles["complete-message"]}>
          <h2 className={styles["complete-title"]}>Вправу завершено!</h2>
          <p className={styles["complete-text"]}>
            {`Чудова робота! Ви успішно завершили вправу "${exercise.name}". Ви робите важливі кроки для покращення свого психічного здоров'я.`}
          </p>
          <button className={styles["exercise-button"]} onClick={resetExercise}>
            Почати знову
          </button>
        </div>
      ) : (
        <>
          {exercise.steps.map((step, index) => (
            <div
              key={index}
              className={`${styles["step-container"]} ${
                index === currentStep ? styles["active"] : ""
              }`}
            >
              <h2 className={styles["step-title"]}>
                <span className={styles["step-number"]}>{index + 1}</span>
                {step.title}
              </h2>
              <p className={styles["step-description"]}>{step.description}</p>
              {index === currentStep &&
                (isRunning || timeLeft > 0) &&
                currentStepDuration > 0 && (
                  <>
                    <div
                      className={`${styles["timer-circle"]} ${
                        currentStepType === "inhale" ? styles["breathing"] : ""
                      }`}
                      style={{
                        animationDuration: `${currentStepDuration}s`,
                        animationPlayState: animationPaused
                          ? "paused"
                          : "running",
                      }}
                    >
                      <div className={styles["timer-text"]}>{timeLeft}с</div>
                    </div>
                    <div className={styles["progress-bar"]}>
                      <div
                        className={styles["progress"]}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </>
                )}
            </div>
          ))}

          {!isRunning ? (
            <button
              className={styles["exercise-button"]}
              onClick={startExercise}
            >
              {currentStep === 0 && timeLeft === 0
                ? "Почати вправу"
                : "Продовжити"}
            </button>
          ) : (
            <button
              className={styles["exercise-button"]}
              onClick={pauseExercise}
            >
              Пауза
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default BreathingExerciseComponent;
