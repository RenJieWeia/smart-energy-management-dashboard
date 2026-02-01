import React, { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  value: string | number;
  className?: string;
  duration?: number; // ms
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  className,
  duration = 1000,
}) => {
  // Extract numeric part and non-numeric part (suffix/unit)
  const parseValue = (val: string | number) => {
    const strVal = String(val);
    const match = strVal.match(/([\d,.]+)(.*)/);
    if (match) {
      return {
        number: parseFloat(match[1].replace(/,/g, "")),
        suffix: match[2],
      };
    }
    return { number: 0, suffix: strVal };
  };

  const { number: targetNumber, suffix } = parseValue(value);
  const [displayNumber, setDisplayNumber] = useState(targetNumber);
  const startNumberRef = useRef(targetNumber);
  const startTimeRef = useRef<number | null>(null);
  const requestRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    startNumberRef.current = displayNumber;
    startTimeRef.current = null;

    const animate = (time: number) => {
      if (startTimeRef.current === null) startTimeRef.current = time;
      const progress = Math.min((time - startTimeRef.current) / duration, 1);

      // Ease out quart
      const ease = 1 - Math.pow(1 - progress, 4);

      const current =
        startNumberRef.current + (targetNumber - startNumberRef.current) * ease;
      setDisplayNumber(current);

      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      }
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [targetNumber, duration]);

  // Format number to match input precision if possible, or default to 1 decimal
  const formattedNumber = displayNumber.toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    <span className={className}>
      {formattedNumber}
      {suffix}
    </span>
  );
};

export default AnimatedNumber;
