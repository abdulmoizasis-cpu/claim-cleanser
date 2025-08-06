import { Card } from "@/components/ui/card";

export const LoadingSpinner = () => {
  const steps = [
    "Analyzing your query...",
    "Searching reliable sources...",
    "Evaluating source credibility...",
    "Calculating confidence score..."
  ];

  return (
    <Card className="p-8 shadow-elevated">
      <div className="text-center space-y-6">
        {/* Animated spinner */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-muted rounded-full"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        
        {/* Loading steps */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                index <= 1 ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${
                index <= 1 ? "bg-primary" : "bg-muted"
              }`}></div>
              {step}
            </div>
          ))}
        </div>
        
        <p className="text-muted-foreground text-sm">
          This may take a few moments while we verify your claim...
        </p>
      </div>
    </Card>
  );
};