import { useState } from "react";

export default function useChallenges(initialChallenges) {
  const [completedDays, setCompletedDays] = useState([]);
  const [activeChallengeIndex, setActiveChallengeIndex] = useState(null);

  const toggleChallenge = (index) => {
    if (!completedDays.includes(index)) {
      setCompletedDays([...completedDays, index]);
    }
  };

  return {
    completedDays,
    activeChallengeIndex,
    setActiveChallengeIndex,
    toggleChallenge,
  };
}