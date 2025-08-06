import { useState } from "react";
import { Search, Shield, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ConfidenceIndicator } from "./ConfidenceIndicator";
import { LoadingSpinner } from "./LoadingSpinner";

export interface FactCheckResult {
  verdict: "TRUE" | "FALSE" | "PARTIALLY_TRUE" | "INSUFFICIENT_DATA";
  confidence: number;
  summary: string;
  sources: Array<{
    name: string;
    description: string;
    url?: string;
    credibility: number;
  }>;
  lastUpdated: string;
}

const FactChecker = () => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FactCheckResult | null>(null);
  const { toast } = useToast();

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case "TRUE":
        return <CheckCircle className="h-6 w-6 text-success" />;
      case "FALSE":
        return <XCircle className="h-6 w-6 text-destructive" />;
      case "PARTIALLY_TRUE":
        return <AlertTriangle className="h-6 w-6 text-warning" />;
      default:
        return <Info className="h-6 w-6 text-info" />;
    }
  };

  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case "TRUE":
        return "bg-success-light text-success border-success/20";
      case "FALSE":
        return "bg-destructive-light text-destructive border-destructive/20";
      case "PARTIALLY_TRUE":
        return "bg-warning-light text-warning border-warning/20";
      default:
        return "bg-info-light text-info border-info/20";
    }
  };

  const mockFactCheck = async (query: string): Promise<FactCheckResult> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock responses for demonstration
    const mockResponses = {
      "earth is flat": {
        verdict: "FALSE" as const,
        confidence: 98,
        summary: "Scientific consensus overwhelmingly supports that Earth is a sphere. This has been established through multiple lines of evidence including satellite imagery, physics, and centuries of observation.",
        sources: [
          { name: "NASA", description: "Official space agency documentation with satellite imagery", credibility: 10 },
          { name: "National Geographic", description: "Educational content on Earth's spherical shape", credibility: 9 },
          { name: "Scientific American", description: "Peer-reviewed articles on planetary science", credibility: 9 }
        ]
      },
      "water boils at 100 degrees celsius": {
        verdict: "TRUE" as const,
        confidence: 99,
        summary: "Water boils at 100°C (212°F) at sea level atmospheric pressure. This is a well-established scientific fact used as a reference point in the Celsius temperature scale.",
        sources: [
          { name: "Physics Textbooks", description: "Standard physics education materials", credibility: 10 },
          { name: "NIST", description: "National Institute of Standards and Technology reference", credibility: 10 },
          { name: "Encyclopedia Britannica", description: "Educational reference on water properties", credibility: 9 }
        ]
      },
      "vaccines cause autism": {
        verdict: "FALSE" as const,
        confidence: 96,
        summary: "Extensive scientific research involving millions of children has found no link between vaccines and autism. The original study claiming this link was retracted due to fraud.",
        sources: [
          { name: "CDC", description: "Centers for Disease Control comprehensive studies", credibility: 10 },
          { name: "WHO", description: "World Health Organization vaccine safety data", credibility: 10 },
          { name: "The Lancet", description: "Retraction of fraudulent study and subsequent research", credibility: 9 }
        ]
      }
    };

    const lowercaseQuery = query.toLowerCase();
    const match = Object.keys(mockResponses).find(key => 
      lowercaseQuery.includes(key)
    );

    if (match) {
      return {
        ...mockResponses[match as keyof typeof mockResponses],
        lastUpdated: new Date().toISOString()
      };
    }

    // Default response for unknown queries
    return {
      verdict: "INSUFFICIENT_DATA",
      confidence: 25,
      summary: "Unable to find sufficient reliable sources to verify this claim. Consider checking with established fact-checking organizations or primary sources.",
      sources: [
        { name: "Search Results", description: "Limited relevant information found", credibility: 3 }
      ],
      lastUpdated: new Date().toISOString()
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast({
        title: "Please enter a claim",
        description: "Enter something you'd like to fact-check",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const factCheckResult = await mockFactCheck(query);
      setResult(factCheckResult);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fact-check your query. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">FactGuard</h1>
          </div>
          <p className="text-xl text-muted-foreground font-medium">
            Don't believe everything you see
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-8">
          <Card className="p-6 shadow-elevated">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter a claim to fact-check (e.g., 'Did Russia nuke Ukraine?')"
                  className="pl-10 h-12 text-base"
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading || !query.trim()}
                className="w-full h-12 text-base font-medium bg-gradient-hero hover:opacity-90 transition-all duration-200"
              >
                {isLoading ? "Analyzing..." : "Fact-Check"}
              </Button>
            </form>
          </Card>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="max-w-2xl mx-auto">
            <LoadingSpinner />
          </div>
        )}

        {/* Results */}
        {result && !isLoading && (
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 shadow-elevated">
              {/* Verdict */}
              <div className={`flex items-center gap-3 p-4 rounded-lg border-2 mb-6 ${getVerdictStyle(result.verdict)}`}>
                {getVerdictIcon(result.verdict)}
                <div>
                  <h2 className="text-2xl font-bold">
                    VERDICT: {result.verdict.replace("_", " ")}
                  </h2>
                </div>
              </div>

              {/* Confidence Score */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-foreground">Confidence Score</h3>
                  <span className="text-2xl font-bold text-primary">{result.confidence}%</span>
                </div>
                <ConfidenceIndicator confidence={result.confidence} />
              </div>

              {/* Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Summary</h3>
                <p className="text-foreground leading-relaxed">{result.summary}</p>
              </div>

              {/* Sources */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Sources Used</h3>
                <div className="space-y-3">
                  {result.sources.map((source, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-grow">
                        <h4 className="font-medium text-foreground">{source.name}</h4>
                        <p className="text-sm text-muted-foreground">{source.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                            Credibility: {source.credibility}/10
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Last Updated */}
              <div className="text-sm text-muted-foreground">
                Last updated: {new Date(result.lastUpdated).toLocaleString()}
              </div>
            </Card>
          </div>
        )}

        {/* Example Queries */}
        {!result && !isLoading && (
          <div className="max-w-2xl mx-auto mt-12">
            <h3 className="text-lg font-semibold text-center mb-6 text-foreground">Try these example queries:</h3>
            <div className="grid gap-3">
              {[
                "Water boils at 100 degrees celsius",
                "The Earth is flat",
                "Vaccines cause autism"
              ].map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => setQuery(example)}
                  className="text-left justify-start h-auto p-4 whitespace-normal"
                >
                  "{example}"
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FactChecker;