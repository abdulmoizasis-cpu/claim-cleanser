import { useState, useEffect } from "react";
import { Search, Shield, CheckCircle, XCircle, AlertTriangle, Info, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ConfidenceIndicator } from "./ConfidenceIndicator";
import { LoadingSpinner } from "./LoadingSpinner";

export interface FactCheckResult {
  verdict: "TRUE" | "FALSE" | "PARTIALLY_TRUE" | "INSUFFICIENT_DATA";
  confidence: number;
  summary: string;
  sources: Array<{
    name: string;
    url: string;
    credibilityScore: number;
    supportsVerdict: boolean;
  }>;
  lastUpdated: string;
}

const FactChecker = () => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FactCheckResult | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [isApiKeySet, setIsApiKeySet] = useState(false);
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

  const saveApiKey = async (key: string) => {
    try {
      localStorage.setItem('webz_api_key', key);
      setApiKey(key);
      setIsApiKeySet(true);
      toast({
        title: "API Key Saved",
        description: "Your Webz.io API key has been saved securely.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save API key. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Check for saved API key on component mount
  useEffect(() => {
    const savedKey = localStorage.getItem('webz_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsApiKeySet(true);
    }
  }, []);

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

      // Simulate an API call with a delay
      setTimeout(() => {
        // Placeholder data
        const fakeResult: FactCheckResult = {
          verdict: "TRUE",
          confidence: 85,
          summary: "This is a placeholder summary for the fact-check result.",
          sources: [
            { name: "Source A", url: "#", credibilityScore: 8, supportsVerdict: true },
            { name: "Source B", url: "#", credibilityScore: 7, supportsVerdict: true },
          ],
          lastUpdated: new Date().toISOString(),
        };
        setResult(fakeResult);
        setIsLoading(false);
      }, 1500); // 1.5 second delay
    };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">FactGuard</h1>
          </div>
          <p className="text-xl text-muted-foreground font-medium">
            Don't believe everything you see
          </p>
          
          {/* API Settings Button */}
          <div className="absolute top-0 right-0">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="w-4 h-4" />
                  {isApiKeySet ? "API Configured" : "Setup API"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configure Webz.io API</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="api-key">Webz.io API Key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="Enter your Webz.io API key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Get your free API key from{" "}
                      <a href="https://webz.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        webz.io
                      </a>
                    </p>
                  </div>
                  <Button onClick={() => saveApiKey(apiKey)} disabled={!apiKey}>
                    Save API Key
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
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
                         {source.url && (
                           <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                             View Source
                           </a>
                         )}
                         <div className="flex items-center gap-2 mt-1">
                           <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                             Credibility: {source.credibilityScore}/10
                           </span>
                           <span className={`text-xs px-2 py-1 rounded ${source.supportsVerdict ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                             {source.supportsVerdict ? 'Supports' : 'Contradicts'}
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