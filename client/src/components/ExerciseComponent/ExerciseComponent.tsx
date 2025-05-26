import React, { useState } from "react";
import { FiChevronRight, FiChevronLeft, FiCheckCircle } from "react-icons/fi";
import styles from "./ExerciseComponent.module.css";

interface ExerciseStep {
  title: string;
  description: string;
  image?: string;
}

interface ExerciseComponentProps {
  exercise: {
    name: string;
    description: string;
    type: string;
    tags: string[];
    steps: ExerciseStep[];
  };
}

const ExerciseComponent: React.FC<ExerciseComponentProps> = ({ exercise }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleNext = (): void => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    if (currentStep < exercise.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFinish = (): void => {
    setCompletedSteps(
      Array.from({ length: exercise.steps.length }, (_, i) => i)
    );
  };

  const handlePrev = (): void => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progressPercentage =
    (completedSteps.length / exercise.steps.length) * 100;
  const isLastStep = currentStep === exercise.steps.length - 1;

  return (
    <div className={styles["exercise-container"]}>
      <div className={styles["exercise-header"]}>
        <h2>{exercise.name}</h2>
        <p className={styles["exercise-description"]}>{exercise.description}</p>

        <div className={styles["progress-bar"]}>
          <div
            className={styles["progress-fill"]}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <span className={styles["progress-text"]}>
          {completedSteps.length} з {exercise.steps.length} кроків завершено
        </span>
      </div>

      <div className={styles["step-container"]}>
        <div className={styles["step-indicator"]}>
          {exercise.steps.map((_, index) => (
            <div
              key={index}
              className={`${styles["step-dot"]} ${
                currentStep === index ? styles["active"] : ""
              } ${completedSteps.includes(index) ? styles["completed"] : ""}`}
              onClick={() => setCurrentStep(index)}
            >
              {completedSteps.includes(index) && <FiCheckCircle />}
            </div>
          ))}
        </div>

        <div className={styles["step-content"]}>
          <div className={styles["step-number"]}>
            Крок {currentStep + 1} з {exercise.steps.length}
          </div>
          <h3 className={styles["step-title"]}>
            {exercise.steps[currentStep].title}
          </h3>
          <div className={styles["step-instructions"]}>
            {exercise.steps[currentStep].description}
          </div>

          {exercise.steps[currentStep].image && (
            <div className={styles["step-image"]}>
              <img
                src={exercise.steps[currentStep].image}
                alt={`Крок ${currentStep + 1}`}
              />
            </div>
          )}
        </div>
      </div>

      <div className={styles["step-actions"]}>
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className={`${styles["nav-button"]} ${styles["prev-button"]}`}
        >
          <FiChevronLeft /> Назад
        </button>

        {isLastStep ? (
          <button
            onClick={handleFinish}
            className={`${styles["nav-button"]} ${styles["finish-button"]}`}
          >
            <FiCheckCircle /> Завершити
          </button>
        ) : (
          <button
            onClick={handleNext}
            className={`${styles["nav-button"]} ${styles["next-button"]}`}
          >
            Далі <FiChevronRight />
          </button>
        )}
      </div>

      {completedSteps.length === exercise.steps.length && (
        <div className={styles["completion-message"]}>
          <h3>Вітаємо! 🎉</h3>
          <p>Ви успішно завершили вправу &quot;{exercise.name}&quot;!</p>
        </div>
      )}
    </div>
  );
};

export default ExerciseComponent;
