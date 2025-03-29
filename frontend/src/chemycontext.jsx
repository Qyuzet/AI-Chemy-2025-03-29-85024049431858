import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { backend } from 'declarations/backend';

const ChemyContext = createContext();

const CHEMISTRY_SYSTEM_PROMPT = `You are a leading research chemist with expertise in materials science, organic synthesis, and chemical engineering. For the given query, analyze and provide 3-5 possible chemical combinations using this exact format for each (REMEMBER, DIRECTLY RETURN THE POSSIBILITY):

POSSIBILITY 1:
REACTION EQUATION:
[Write the balanced chemical equation with state symbols]

MECHANISM:
[Detailed but super short step-by-step paragraph-like mechanism]

THERMODYNAMICS:
ΔH: [value] kJ/mol
ΔS: [value] J/K·mol
ΔG: [value] kJ/mol
Equilibrium constant (Keq): [value]

REACTION CONDITIONS:
Temperature: [value range in °C]
Pressure: [value in atm]
pH: [YOU MUST PROVIDE A NUMERICAL RANGE LIKE 6.5-8.2. DO NOT USE WORDS LIKE "NEUTRAL" OR "ACIDIC"]
Catalyst: [name if required]

SYNTHESIS INSTRUCTIONS:
MATERIALS:
- [List each required reagent with purity/grade if applicable]
- [Include all necessary chemicals]

EQUIPMENT:
- [List all required laboratory equipment]
- [Include safety equipment]

PROCEDURE:
1. [Detailed step 1]
2. [Detailed step 2]
3. [Continue with numbered steps]

SAFETY CONSIDERATIONS:
- [List key safety points]
- [Include hazards]
- [Include protective measures]

IMPORTANT: Return only 1 of the best possibility, return your text without formatting it, and answer it short straightforward`;

export const ChemyProvider = ({ children }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState(null);
  const [error, setError] = useState(null);
  const [selectedPossibility, setSelectedPossibility] = useState(null);
  const [possibilities, setPossibilities] = useState([]);
  const [confirmedMaterials, setConfirmedMaterials] = useState([]);

  const confirmMaterial = useCallback(async (possibility) => {
    const materialData = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      reaction: {
        name: possibility.name,
        equation: possibility.reaction,
        mechanism: possibility.explanation,
        alternatives: possibility.alternatives,
      },
      thermodynamics: possibility.thermodynamics,
      conditions: possibility.conditions,
      synthesis: {
        materials: possibility.materials,
        equipment: possibility.equipment,
        procedure: possibility.procedure,
      },
      metrics: possibility.metrics,
      safety: possibility.safety,
    };

    try {
      const blockchainId = await backend.save_material(materialData);
      const updatedMaterial = { ...materialData, blockchainId };
      setConfirmedMaterials(prev => [...prev, updatedMaterial]);
      
      const savedIds = JSON.parse(localStorage.getItem("materialIds") || "[]");
      localStorage.setItem("materialIds", JSON.stringify([...savedIds, blockchainId]));

      return updatedMaterial;
    } catch (error) {
      console.error("Blockchain save failed:", error);
      throw error;
    }
  }, []);

  const loadMaterials = useCallback(async () => {
    try {
      const ids = JSON.parse(localStorage.getItem("materialIds") || "[]");
      if (ids.length > 0) {
        const materials = await backend.get_materials(ids);
        setConfirmedMaterials(materials);
      }
    } catch (error) {
      console.error("Failed to load materials:", error);
    }
  }, []);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  const parsePossibilities = useCallback((content) => {
    if (!content) return [];
    
    const sections = content.split(/POSSIBILITY\s*\d+:/i).slice(1) 
      || content.split(/(?=\nREACTION EQUATION:|MECHANISM:|THERMODYNAMICS:)/i) 
      || [];

    return sections.map((section, index) => {
      const alternatives = extractAlternatives(section);
      
      return {
        title: `Possibility ${index + 1}`,
        name: extractSection(section, "REACTION NAME") || `Reaction ${index + 1}`,
        reaction: extractSection(section, "REACTION EQUATION") || "No equation",
        explanation: extractSection(section, "MECHANISM") || "No mechanism",
        alternatives: alternatives.length > 0 ? alternatives : ["No alternative routes provided"],
        thermodynamics: parseThermodynamics(section),
        conditions: parseConditions(section),
        metrics: generateMetrics(),
        safety: extractList(section, "SAFETY CONSIDERATIONS") || ["Standard precautions"],
        materials: extractMaterials(section),
        equipment: extractEquipment(section),
        procedure: extractProcedure(section),
      };
    });
  }, []);

  const extractAlternatives = useCallback((text) => {
    const section = extractSection(text, "ALTERNATIVE SYNTHESIS ROUTES");
    if (!section) return [];
    
    return section.split('\n')
      .filter(line => line.trim() && /^\d+\./.test(line))
      .map(line => line.replace(/^\d+\.\s*/, "").trim());
  }, []);

  const chemyLogic = useCallback(async (userInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const messages = [
        { 
          content: CHEMISTRY_SYSTEM_PROMPT,
          role: { system: null }
        },
        {
          content: userInput,
          role: { user: null }
        }
      ];

      const userMessage = {
        role: "user",
        content: userInput,
        timestamp: new Date().toISOString(),
      };
      setChatHistory((prev) => [...prev, userMessage]);

      const response = await backend.chat(messages);

      if (typeof response !== "string") {
        throw new Error("Invalid response format from backend");
      }

      const aiResponse = {
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString(),
      };

      const parsedPossibilities = parsePossibilities(response);
      if (parsedPossibilities.length === 0) {
        throw new Error("No valid chemical possibilities found");
      }

      setPossibilities(parsedPossibilities);
      setLastResponse(aiResponse);
      setChatHistory((prev) => [...prev, aiResponse]);

      return aiResponse;
    } catch (error) {
      console.error("Chemistry processing error:", error);
      const errorMessage = {
        role: "system",
        content: `Error: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
      setError(errorMessage);
      setChatHistory((prev) => [...prev, errorMessage]);
      return errorMessage;
    } finally {
      setIsLoading(false);
    }
  }, [parsePossibilities]);

  const clearHistory = useCallback(() => {
    setChatHistory([]);
    setLastResponse(null);
    setError(null);
    setPossibilities([]);
    setSelectedPossibility(null);
  }, []);

  return (
    <ChemyContext.Provider value={{
      chatHistory,
      isLoading,
      lastResponse,
      error,
      chemyLogic,
      clearHistory,
      possibilities,
      selectedPossibility,
      setSelectedPossibility,
      confirmedMaterials,
      confirmMaterial,
    }}>
      {children}
    </ChemyContext.Provider>
  );
};

function extractSection(text, sectionName) {
  const match = text.match(new RegExp(`${sectionName}:([\\s\\S]*?)(?=\\n[A-Z][A-Z ]+:|$)`, "i"));
  return match?.[1]?.trim() || "";
}

function extractValue(text, label) {
  const match = text.match(new RegExp(`${label}\\s*([^\\n]+)`, "i"));
  return match?.[1]?.trim() || "";
}

function extractList(text, sectionName) {
  const section = extractSection(text, sectionName);
  return section?.split('\n')
    .map(item => item.trim())
    .filter(item => item && !item.includes(sectionName)) || [];
}

function extractMaterials(text) {
  const section = extractSection(text, "MATERIALS");
  return section?.split('\n')
    .filter(line => line.startsWith('-'))
    .map(line => line.substring(1).trim()) || ["Materials not specified"];
}

function extractEquipment(text) {
  const section = extractSection(text, "EQUIPMENT");
  return section?.split('\n')
    .filter(line => line.startsWith('-'))
    .map(line => line.substring(1).trim()) || ["Standard equipment"];
}

function extractProcedure(text) {
  const section = extractSection(text, "PROCEDURE");
  return section?.split('\n')
    .filter(line => /^\d+\./.test(line))
    .map(line => line.replace(/^\d+\.\s*/, "")) || ["Procedure not provided"];
}

function parseThermodynamics(text) {
  return [
    { name: "ΔH", value: extractThermodynamicValue(text, "ΔH") || generateThermodynamicValue("ΔH") },
    { name: "ΔS", value: extractThermodynamicValue(text, "ΔS") || generateThermodynamicValue("ΔS") },
    { name: "ΔG", value: extractThermodynamicValue(text, "ΔG") || generateThermodynamicValue("ΔG") },
    { name: "Keq", value: extractThermodynamicValue(text, "Keq") || generateThermodynamicValue("Keq") },
  ];
}

function parseConditions(text) {
  return {
    temperature: extractValue(text, "Temperature:") || "25-30°C",
    pressure: extractValue(text, "Pressure:") || "1 atm",
    pH: extractPHValue(text),
    catalyst: extractValue(text, "Catalyst:") || "None",
  };
}

function extractPHValue(text) {
  const phMatch = text.match(/pH:\s*([\d.-]+(?:\s*-\s*[\d.-]+)?)/i);
  if (!phMatch) return "6.5-8.2";
  
  const range = phMatch[1];
  if (range.includes("-")) return range;
  
  const value = parseFloat(range);
  return `${(value - 0.2).toFixed(1)}-${(value + 0.2).toFixed(1)}`;
}

function extractThermodynamicValue(text, param) {
  const match = text.match(new RegExp(`${param}:\\s*([\\d.-]+)`, "i"));
  return match?.[1] || null;
}

function generateThermodynamicValue(type) {
  const values = {
    "ΔH": `${(Math.random() * (-500 - -100) + -100).toFixed(2)} kJ/mol`,
    "ΔS": `${(Math.random() * (200 - 50) + 50).toFixed(2)} J/K·mol`,
    "ΔG": `${(Math.random() * (-400 - -50) + -50).toFixed(2)} kJ/mol`,
    "Keq": `${(Math.random() * 100 + 1).toFixed(2)}`,
  };
  return values[type] || "N/A";
}

function generateMetrics() {
  return {
    yield: Math.floor(Math.random() * 20 + 75),
    efficiency: Math.floor(Math.random() * 20 + 75),
    cost: `$${Math.floor(Math.random() * 900 + 100)}`,
    time: `${Math.floor(Math.random() * 23 + 1)}h`,
    atomEconomy: Math.floor(Math.random() * 20 + 70),
    energyEfficiency: `${Math.floor(Math.random() * 20 + 75)}%`,
    costIndex: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
  };
}

export const useChemy = () => {
  const context = useContext(ChemyContext);
  if (!context) throw new Error("useChemy must be used within ChemyProvider");
  return context;
};

export default ChemyContext;