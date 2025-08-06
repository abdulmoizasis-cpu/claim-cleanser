import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NewsArticle {
  title: string;
  url: string;
  site: string;
  text: string;
  published: string;
}

interface FactCheckResult {
  verdict: 'TRUE' | 'FALSE' | 'PARTIALLY TRUE' | 'INSUFFICIENT DATA';
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

const SOURCE_CREDIBILITY: { [key: string]: number } = {
  'reuters.com': 10,
  'apnews.com': 10,
  'bbc.com': 9,
  'npr.org': 9,
  'cnn.com': 8,
  'nytimes.com': 8,
  'washingtonpost.com': 8,
  'theguardian.com': 7,
  'wsj.com': 8,
  'abcnews.go.com': 7,
  'cbsnews.com': 7,
  'nbcnews.com': 7,
  'usatoday.com': 6,
  'fox news': 5,
  'breitbart.com': 2,
  'infowars.com': 1,
};

function getSourceCredibility(site: string): number {
  const domain = site.toLowerCase();
  for (const [key, score] of Object.entries(SOURCE_CREDIBILITY)) {
    if (domain.includes(key)) {
      return score;
    }
  }
  return 3; // Default score for unknown sources
}

function analyzeVerdict(articles: NewsArticle[], query: string): { verdict: string; supportingArticles: NewsArticle[] } {
  if (articles.length === 0) {
    return { verdict: 'INSUFFICIENT DATA', supportingArticles: [] };
  }

  // Simple keyword analysis for determining verdict
  const positiveKeywords = ['confirmed', 'verified', 'true', 'accurate', 'correct', 'proven'];
  const negativeKeywords = ['false', 'debunked', 'fake', 'misinformation', 'hoax', 'incorrect', 'untrue'];
  
  let positiveScore = 0;
  let negativeScore = 0;
  const supportingArticles: NewsArticle[] = [];

  articles.forEach(article => {
    const text = (article.title + ' ' + article.text).toLowerCase();
    let articleScore = 0;
    
    positiveKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        articleScore += 1;
        positiveScore += 1;
      }
    });
    
    negativeKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        articleScore -= 1;
        negativeScore += 1;
      }
    });

    if (Math.abs(articleScore) > 0) {
      supportingArticles.push(article);
    }
  });

  if (positiveScore > negativeScore * 1.5) {
    return { verdict: 'TRUE', supportingArticles };
  } else if (negativeScore > positiveScore * 1.5) {
    return { verdict: 'FALSE', supportingArticles };
  } else if (positiveScore > 0 || negativeScore > 0) {
    return { verdict: 'PARTIALLY TRUE', supportingArticles };
  } else {
    return { verdict: 'INSUFFICIENT DATA', supportingArticles: articles.slice(0, 3) };
  }
}

function calculateConfidence(sources: Array<{ credibilityScore: number; supportsVerdict: boolean }>): number {
  let supportingPoints = 0;
  let totalPoints = 0;
  
  sources.forEach(source => {
    totalPoints += source.credibilityScore;
    if (source.supportsVerdict) {
      supportingPoints += source.credibilityScore;
    }
  });
  
  if (totalPoints === 0) return 0;
  return Math.round((supportingPoints / totalPoints) * 100);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { query } = await req.json()
    
    // Get API key from Supabase secrets
    const apiKey = Deno.env.get('WEBZ_API_KEY')
    if (!apiKey) {
      throw new Error('Webz.io API key not configured')
    }

    // Search for news articles using webz.io API
    const searchUrl = `https://api.webz.io/newsApiLite?token=${apiKey}&q=${encodeURIComponent(query)}&size=10&sort=published`
    
    const response = await fetch(searchUrl)
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }
    
    const data = await response.json()
    const articles: NewsArticle[] = data.posts || []

    // Analyze verdict
    const { verdict, supportingArticles } = analyzeVerdict(articles, query)

    // Process sources and calculate confidence
    const sources = supportingArticles.slice(0, 5).map(article => ({
      name: article.site,
      url: article.url,
      credibilityScore: getSourceCredibility(article.site),
      supportsVerdict: true // In this simple implementation, all supporting articles support the verdict
    }))

    const confidence = calculateConfidence(sources)

    // Generate summary
    const summary = supportingArticles.length > 0 
      ? `Based on analysis of ${supportingArticles.length} relevant sources, the claim appears to be ${verdict.toLowerCase()}. Key sources include ${sources.map(s => s.name).join(', ')}.`
      : `Insufficient reliable sources found to verify this claim. More research may be needed.`

    const result: FactCheckResult = {
      verdict: verdict as any,
      confidence,
      summary,
      sources,
      lastUpdated: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      },
    )
  }
})