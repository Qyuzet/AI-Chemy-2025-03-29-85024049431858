import React from "react";
import { useChemy } from "./chemycontext";
import Tooltip from "./tooltip";

const GeneralTab = () => {
  const { selectedPossibility } = useChemy();

  return (
    <div className="h-full flex flex-col p-4 lg:p-6 overflow-y-auto custom-scrollbar">
      <div className="flex items-center mb-4">
        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
          Technical Analysis
        </h2>
        <Tooltip content="A comprehensive analysis of the chemical reaction, including efficiency metrics, safety considerations, and environmental impact." />
      </div>

      {selectedPossibility ? (
        <div className="space-y-4">
          {/* Title and Overview */}
          <div className="bg-gradient-to-r from-zinc-900 to-black border border-zinc-800 rounded-lg p-4 lg:p-6 shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                <h3 className="text-lg font-medium text-purple-400">
                  {selectedPossibility.title}
                </h3>
              </div>
              <div className="pl-4 border-l-2 border-zinc-800 overflow-y-auto">
                <p className="text-zinc-300 leading-relaxed">
                  {selectedPossibility.explanation}
                </p>
              </div>
            </div>
          </div>

          {/* Efficiency Metrics */}
          <div className="bg-gradient-to-r from-zinc-900 to-black border border-zinc-800 rounded-lg p-4 lg:p-6">
            <div className="flex items-center mb-4">
              <h3 className="text-sm font-semibold text-zinc-300">
                Efficiency Analysis
              </h3>
              <Tooltip content="Key performance indicators that measure the effectiveness and efficiency of the chemical reaction process." />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              <MetricCard
                label="Yield Efficiency"
                tooltip="The percentage of actual product obtained compared to the theoretical maximum possible yield. Higher percentages indicate more efficient reactions."
                value={`${selectedPossibility.metrics?.yield || 0}%`}
              />
              <MetricCard
                label="Atom Economy"
                tooltip="The percentage of atoms from reactants that end up in the desired product. Higher atom economy means less waste and more sustainable chemistry."
                value={`${selectedPossibility.metrics?.atomEconomy || 0}%`}
              />
              <MetricCard
                label="Energy Efficiency"
                tooltip="A measure of how effectively energy is used in the reaction. Higher efficiency indicates less energy waste and lower operational costs."
                value={selectedPossibility.metrics?.energyEfficiency || "N/A"}
              />
              <MetricCard
                label="Cost Index"
                tooltip="A relative measure of the economic feasibility of the reaction, considering reagents, energy, and equipment costs. Lower values indicate more cost-effective processes."
                value={selectedPossibility.metrics?.costIndex || "N/A"}
              />
            </div>
          </div>

          {/* Safety and Environmental Impact */}
          <div className="bg-gradient-to-r from-zinc-900 to-black border border-zinc-800 rounded-lg p-4 lg:p-6">
            <div className="flex items-center mb-4">
              <h3 className="text-sm font-semibold text-zinc-300">
                Safety & Environmental Considerations
              </h3>
              <Tooltip content="Important safety protocols and environmental impacts to consider when performing this reaction, including hazards, protective measures, and ecological effects." />
            </div>
            <div className="space-y-3">
              {selectedPossibility.safety?.map((item, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0"></div>
                  <p className="text-zinc-300 text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-zinc-500 text-sm">
            Select a synthesis route to view detailed analysis
          </p>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ label, value, tooltip }) => (
  <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
    <div className="flex flex-col h-full">
      <div className="flex items-center mb-2">
        <span className="text-zinc-400 text-sm">{label}</span>
        <Tooltip content={tooltip} />
      </div>
      <div className="text-green-400 font-mono text-lg">{value}</div>
    </div>
  </div>
);

export default GeneralTab;
