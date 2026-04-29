import { useEffect, useRef, useState } from "react";

export default function usePomodoro({ onFinish }) {
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [pomodoroFinished, setPomodoroFinished] = useState(false);

  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setRunning(false);
          setPomodoroFinished(true);

          if (onFinishRef.current) {
            onFinishRef.current();
          }

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  const startPomodoro = () => {
    setPomodoroFinished(false);
    setRunning(true);
  };

  const pausePomodoro = () => {
    setRunning(false);
  };

  const resetPomodoro = () => {
    setSeconds(25 * 60);
    setRunning(false);
    setPomodoroFinished(false);
  };

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return {
    seconds,
    setSeconds,
    running,
    setRunning,
    pomodoroFinished,
    setPomodoroFinished,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
    minutes,
    secs,
  };
}