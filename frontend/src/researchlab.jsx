import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { backend } from 'declarations/backend';

const ResearchContext = createContext();

const RESEARCH_SYSTEM_PROMPT = `You are a distinguished academic researcher with expertise in multidisciplinary research and extensive publication experience in high-impact journals (Nature, Science, Cell). Generate a comprehensive research paper following academic standards and this precise structure:

1. Title: [Create a precise, SEO-optimized title with keywords]

2. Abstract (200-250 words):
- Background & Context
- Research Objective
- Methodology Overview
- Key Findings
- Implications & Impact
- Keywords: [5 relevant keywords]

3. Introduction (800-1000 words):
- Current State of the Field
- Knowledge Gaps
- Research Questions/Hypotheses
- Theoretical Framework
- Study Objectives
- Innovation & Contribution

4. Methodology (800-1000 words):
- Research Design
- Data Collection Methods
- Sampling Strategy & Size Calculation
- Variables & Measurements
- Quality Control Measures
- Statistical Analysis Plan
- Ethical Considerations & Approvals

5. Results (1000-1200 words):
- Descriptive Statistics
- Primary Outcomes
- Secondary Outcomes
- Statistical Analyses
- Confidence Intervals
- P-values
- Effect Sizes
- [Include placeholders for figures/tables with detailed descriptions]

6. Discussion (1000-1200 words):
- Summary of Key Findings
- Comparison with Existing Literature
- Theoretical Implications
- Practical Applications
- Study Strengths
- Limitations
- Future Research Directions

7. Conclusion (400-500 words):
- Research Summary
- Key Contributions
- Broader Impact
- Policy Implications
- Future Perspectives

8. References:
[Generate 25-30 fictional but properly formatted references in APA style]

Additional Requirements:
- Use precise scientific language
- Include statistical significance where applicable
- Suggest potential figures/tables
- Highlight practical applications
- Include funding considerations
- Suggest potential collaborations
- Include data availability statement
- Add conflict of interest statement
- Include author contributions section

Format all statistical values precisely (e.g., "p < 0.001, CI [0.45, 0.67], d = 0.89").`;

export const ResearchProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [researchPaper, setResearchPaper] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [isPDFReady, setIsPDFReady] = useState(false);

  // Load jsPDF dynamically
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.jspdf) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => setIsPDFReady(true);
      document.body.appendChild(script);
    } else {
      setIsPDFReady(true);
    }
  }, []);

  const generateResearchPaper = useCallback(async (researchTopic) => {
    if (!researchTopic.trim()) {
      setError("Please enter a research topic");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Prepare messages for backend chat
      const messages = [
        { 
          content: RESEARCH_SYSTEM_PROMPT,
          role: { system: null }
        },
        {
          content: `Generate a research paper on the topic: ${researchTopic}`,
          role: { user: null },
        }
      ];

      // Call ICP backend chat method
      const response = await backend.chat(messages);

      const paperWithMetadata = {
        content: response,
        topic: researchTopic,
        date: new Date().toISOString(),
        id: Date.now().toString()
      };

      setResearchPaper(paperWithMetadata);
      setHistory(prev => [paperWithMetadata, ...prev.slice(0, 4)]); // Keep last 5 papers
      return paperWithMetadata;
    } catch (error) {
      setError("Failed to generate research paper. Please try again.");
      console.error("Research generation error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const downloadPDF = useCallback(() => {
    if (!researchPaper || !isPDFReady) {
      setError("No research paper to download or PDF library not loaded");
      return;
    }

    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // Set metadata
      doc.setProperties({
        title: `Research Paper: ${researchPaper.topic}`,
        subject: 'Generated Research Paper',
        author: 'AI-Chemy',
      });

      // Set font and size
      doc.setFont('helvetica');
      doc.setFontSize(12);

      // Add title
      doc.setFontSize(16);
      doc.setTextColor(40);
      doc.text(`Research Paper: ${researchPaper.topic}`, 105, 15, null, null, 'center');
      doc.setFontSize(12);

      // Split text into lines that fit the page
      const splitText = doc.splitTextToSize(researchPaper.content, 180);

      let y = 30;
      let page = 1;

      // Add text to PDF with pagination
      for (let i = 0; i < splitText.length; i++) {
        if (y > 280) { // Check if we need a new page
          doc.addPage();
          y = 20;
          page++;
        }
        doc.text(splitText[i], 15, y);
        y += 7; // Line height
      }

      // Add footer with page numbers
      for (let p = 1; p <= page; p++) {
        doc.setPage(p);
        doc.setFontSize(10);
        doc.text(`Page ${p} of ${page}`, 105, 285, null, null, 'center');
      }

      // Save the PDF
      doc.save(`research_paper_${researchPaper.topic.substring(0, 20)}.pdf`);
    } catch (error) {
      setError("Failed to create PDF. Please try again.");
      console.error("PDF generation error:", error);
    }
  }, [researchPaper, isPDFReady]);

  const loadFromHistory = useCallback((id) => {
    const paper = history.find(item => item.id === id);
    if (paper) {
      setResearchPaper(paper);
    }
  }, [history]);

  const value = {
    generateResearchPaper,
    downloadPDF,
    loadFromHistory,
    researchPaper,
    history,
    isLoading,
    error,
    isPDFReady,
  };

  return (
    <ResearchContext.Provider value={value}>
      {children}
    </ResearchContext.Provider>
  );
};

export const useResearch = () => {
  const context = useContext(ResearchContext);
  if (!context) {
    throw new Error("useResearch must be used within a ResearchProvider");
  }
  return context;
};

// Research Paper Generator Component
function ResearchPaperGenerator() {
  const [topic, setTopic] = useState("");
  const [advancedOptions, setAdvancedOptions] = useState({
    citationStyle: 'APA',
    length: 'standard',
    technicalLevel: 'advanced'
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const {
    generateResearchPaper,
    downloadPDF,
    loadFromHistory,
    researchPaper,
    history,
    isLoading,
    error,
    isPDFReady,
  } = useResearch();

  const handleGenerate = async (e) => {
    e.preventDefault();
    await generateResearchPaper(topic);
  };

  return (
       <div className="container mx-auto px-6 py-12 min-h-screen bg-gradient-to-b from-zinc-900 via-black to-zinc-900 text-white">
      <header className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent mb-4">
          AI-Chemy Research Generator
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          Generate professional research papers powered by Decentralized AI on the Internet Computer Protocol
        </p>
      </header>

      <div className="max-w-4xl mx-auto backdrop-blur-sm bg-black/30 rounded-xl border border-zinc-800/50 shadow-xl p-8">
        <form onSubmit={handleGenerate} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter research topic (e.g., 'Blockchain scalability solutions')"
              className="w-full p-4 pr-32 bg-gradient-to-r from-zinc-900 to-black border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg shadow-inner"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className={`absolute right-2 top-2 px-6 py-2 rounded-md font-semibold transition-all duration-300 ${
                isLoading || !topic.trim()
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:shadow-lg hover:from-purple-600 hover:to-blue-700"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : "Generate"}
            </button>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-purple-400 hover:text-purple-300 flex items-center group transition-all"
            >
              <span className="border-b border-transparent group-hover:border-purple-400">
                {showAdvanced ? 'Hide' : 'Show'} Advanced Options
              </span>
              <svg className={`ml-1 h-4 w-4 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showAdvanced && (
              <div className="mt-4 p-6 bg-gradient-to-r from-zinc-900 to-black border border-zinc-700 rounded-lg shadow-lg grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Citation Style</label>
                  <select 
                    value={advancedOptions.citationStyle}
                    onChange={(e) => setAdvancedOptions({...advancedOptions, citationStyle: e.target.value})}
                    className="w-full p-3 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-300"
                  >
                    <option value="APA">APA</option>
                    <option value="MLA">MLA</option>
                    <option value="Chicago">Chicago</option>
                    <option value="IEEE">IEEE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Paper Length</label>
                  <select 
                    value={advancedOptions.length}
                    onChange={(e) => setAdvancedOptions({...advancedOptions, length: e.target.value})}
                    className="w-full p-3 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-300"
                  >
                    <option value="concise">Concise (3-5 pages)</option>
                    <option value="standard">Standard (8-10 pages)</option>
                    <option value="detailed">Detailed (15+ pages)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Technical Level</label>
                  <select 
                    value={advancedOptions.technicalLevel}
                    onChange={(e) => setAdvancedOptions({...advancedOptions, technicalLevel: e.target.value})}
                    className="w-full p-3 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-300"
                  >
                    <option value="introductory">Introductory</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </form>

        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-200 p-4 rounded-lg mb-6 flex items-start">
            <svg className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {history.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-300 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Papers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((paper) => (
                <button
                  key={paper.id}
                  onClick={() => loadFromHistory(paper.id)}
                  className={`p-4 text-left rounded-lg border transition-all duration-300 ${
                    researchPaper?.id === paper.id 
                      ? 'border-purple-500 bg-purple-900/20 shadow-lg shadow-purple-900/10' 
                      : 'border-gray-700 hover:border-purple-400 hover:bg-black/60'
                  }`}
                >
                  <div className="font-medium truncate text-gray-200">{paper.topic}</div>
                  <div className="text-xs text-gray-400 mt-2 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(paper.date).toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {researchPaper && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                {researchPaper.topic}
              </h2>
              <div className="flex space-x-3">
                <button
                  onClick={downloadPDF}
                  disabled={!isPDFReady}
                  className={`px-4 py-2 rounded-lg flex items-center transition-all duration-300 ${
                    isPDFReady 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg' 
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-r from-zinc-900 to-black border border-zinc-700 rounded-lg overflow-hidden shadow-xl">
              <div className="border-b border-zinc-800 bg-black/40 px-4 py-3 flex items-center">
                <div className="w-3 h-3 rounded-full bg-purple-500 mr-2 animate-pulse"></div>
                <span className="text-gray-400 font-medium text-sm">Research Paper Content</span>
              </div>
              <div className="p-6 overflow-auto max-h-[70vh] custom-scrollbar">
                <pre className="whitespace-pre-wrap font-sans text-gray-300 leading-relaxed">
                  {researchPaper.content}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-16 text-center text-gray-500 text-sm">
        <p className="flex items-center justify-center">
          <svg className="w-4 h-4 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Powered by ICP Ninja - Research generated on the Internet Computer Protocol
        </p>
      </footer>
    </div>
  );
}

export { ResearchPaperGenerator };