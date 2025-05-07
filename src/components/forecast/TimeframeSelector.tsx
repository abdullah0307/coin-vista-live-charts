
import { Button } from "@/components/ui/button";

interface TimeframeSelectorProps {
  selectedDays: number;
  onDaysChange: (days: number) => void;
}

const TimeframeSelector = ({ selectedDays, onDaysChange }: TimeframeSelectorProps) => {
  const timeframes = [
    { days: 7, label: "7 Days" },
    { days: 14, label: "14 Days" },
    { days: 30, label: "30 Days" },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {timeframes.map(({ days, label }) => (
        <Button 
          key={days}
          variant={selectedDays === days ? "default" : "outline"}
          size="sm" 
          onClick={() => onDaysChange(days)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
};

export default TimeframeSelector;
