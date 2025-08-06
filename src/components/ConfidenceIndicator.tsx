interface ConfidenceIndicatorProps {
  confidence: number;
}

export const ConfidenceIndicator = ({ confidence }: ConfidenceIndicatorProps) => {
  const getConfidenceColor = (value: number) => {
    if (value >= 80) return "bg-success";
    if (value >= 60) return "bg-warning";
    if (value >= 40) return "bg-info";
    return "bg-destructive";
  };

  const getConfidenceText = (value: number) => {
    if (value >= 90) return "Very High";
    if (value >= 80) return "High";
    if (value >= 60) return "Moderate";
    if (value >= 40) return "Low";
    return "Very Low";
  };

  return (
    <div className="space-y-2">
      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-700 ease-out ${getConfidenceColor(confidence)}`}
          style={{ width: `${confidence}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Confidence Level:</span>
        <span className="font-medium text-foreground">{getConfidenceText(confidence)}</span>
      </div>
    </div>
  );
};