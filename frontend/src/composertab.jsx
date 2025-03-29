import React, { useState } from "react";
import { useChemy } from "./chemycontext";

const ComposerTab = () => {
  const { selectedPossibility, confirmMaterial, confirmedMaterials } =
    useChemy();
  const [confirmationStatus, setConfirmationStatus] = useState(null);

  const handleConfirmMaterial = () => {
    try {
      const confirmedData = confirmMaterial(selectedPossibility);
      setConfirmationStatus({
        type: "success",
        message: "Material confirmed and saved successfully!",
        data: confirmedData,
      });

      setTimeout(() => setConfirmationStatus(null), 3000);
    } catch (error) {
      setConfirmationStatus({
        type: "error",
        message: "Failed to confirm material. Please try again.",
        error: error.message,
      });
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent mb-4">
        Chemical Reaction Analysis
      </h2>

      {/* Confirmation Status Message */}
      {confirmationStatus && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            confirmationStatus.type === "success"
              ? "bg-green-900/50 border border-green-700"
              : "bg-red-900/50 border border-red-700"
          }`}
        >
          <p className="text-sm text-white">{confirmationStatus.message}</p>
        </div>
      )}

      {selectedPossibility ? (
        <>
          {/* Reaction Formula Section */}
          <div className="bg-gradient-to-r from-zinc-900 to-black border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-zinc-400 text-sm">
                  Balanced Chemical Equation
                </span>
              </div>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(selectedPossibility.reaction)
                }
                className="text-xs text-zinc-500 hover:text-purple-400 transition-colors"
              >
                Copy Formula
              </button>
            </div>
            <div className="p-6">
              <pre className="font-mono text-sm">
                <code className="text-green-400 leading-relaxed">
                  {selectedPossibility.reaction
                    .split("+")
                    .map((part, index, array) => (
                      <React.Fragment key={index}>
                        <span className="text-purple-400">{part.trim()}</span>
                        {index < array.length - 1 && (
                          <span className="text-zinc-500"> + </span>
                        )}
                      </React.Fragment>
                    ))}
                </code>
              </pre>
            </div>
          </div>

          {/* Thermodynamics Section */}
          <div className="bg-gradient-to-r from-zinc-900 to-black border border-zinc-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">
              Thermodynamic Parameters
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {selectedPossibility.thermodynamics?.map((param, index) => (
                <div key={index} className="border border-zinc-800 rounded p-3">
                  <span className="text-zinc-400 text-xs">{param.name}</span>
                  <div className="text-purple-400 font-mono mt-1">
                    {param.value}{" "}
                    {param.name !== "Keq" &&
                      (param.name === "ΔS" ? "J/K·mol" : "kJ/mol")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reaction Conditions */}
          <div className="bg-gradient-to-r from-zinc-900 to-black border border-zinc-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">
              Optimal Conditions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-zinc-800 rounded p-3">
                <span className="text-zinc-400 text-xs">Temperature</span>
                <div className="text-blue-400 font-mono mt-1">
                  {selectedPossibility.conditions?.temperature}
                </div>
              </div>
              <div className="border border-zinc-800 rounded p-3">
                <span className="text-zinc-400 text-xs">Pressure</span>
                <div className="text-blue-400 font-mono mt-1">
                  {selectedPossibility.conditions?.pressure}
                </div>
              </div>
              <div className="border border-zinc-800 rounded p-3">
                <span className="text-zinc-400 text-xs">pH Range</span>
                <div className="text-blue-400 font-mono mt-1">
                  {console.log(
                    "pH value:",
                    selectedPossibility?.conditions?.pH
                  )}
                  {selectedPossibility?.conditions?.pH || "6.5-8.2"}{" "}
                  {/* Added fallback */}
                </div>
              </div>
              <div className="border border-zinc-800 rounded p-3">
                <span className="text-zinc-400 text-xs">Catalyst</span>
                <div className="text-blue-400 font-mono mt-1">
                  {selectedPossibility.conditions?.catalyst}
                </div>
              </div>
            </div>
          </div>

          {/* Synthesis Instructions Section */}
          <div className="bg-gradient-to-r from-zinc-900 to-black border border-zinc-800 rounded-lg p-4 mt-4">
            <h3 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span>Synthesis Instructions</span>
            </h3>

            <div className="space-y-4">
              {/* Materials Required */}
              <div className="border border-zinc-800 rounded p-4">
                <h4 className="text-zinc-400 text-sm mb-2">
                  Required Materials
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {selectedPossibility?.materials?.map((material, index) => (
                    <li key={index} className="text-purple-400 text-sm">
                      {material}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Step by Step Procedure */}
              <div className="border border-zinc-800 rounded p-4">
                <h4 className="text-zinc-400 text-sm mb-2">Procedure</h4>
                <ol className="list-decimal list-inside space-y-2">
                  {selectedPossibility?.procedure?.map((step, index) => (
                    <li key={index} className="text-zinc-300 text-sm">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Equipment Required */}
              <div className="border border-zinc-800 rounded p-4">
                <h4 className="text-zinc-400 text-sm mb-2">
                  Required Equipment
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {selectedPossibility?.equipment?.map((item, index) => (
                    <li key={index} className="text-blue-400 text-sm">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Confirm Material Button */}
          <div className="mt-6">
            <button
              onClick={handleConfirmMaterial}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Confirm Material</span>
            </button>
          </div>

          {/* Confirmed Materials List */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-zinc-300 mb-4">
              Confirmed Materials ({confirmedMaterials.length})
            </h3>
            <div className="space-y-4">
              {confirmedMaterials.map((material) => (
                <div
                  key={material.id}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-400 font-mono text-sm">
                      ID: {material.id}
                    </span>
                    <span className="text-zinc-500 text-xs">
                      {new Date(material.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-zinc-300 font-mono text-sm mb-2">
                    {material.reaction.equation}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-zinc-400">
                      Temperature: {material.conditions.temperature}
                    </div>
                    <div className="text-zinc-400">
                      pH: {material.conditions.pH}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-gradient-to-r from-zinc-900 to-black border border-zinc-800 rounded-lg p-6 text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 rounded-full border-2 border-zinc-700 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-zinc-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            </div>
            <p className="text-zinc-500">
              Select a reaction to view detailed analysis
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComposerTab;