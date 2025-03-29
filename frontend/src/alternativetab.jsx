import React from "react";
import { useChemy } from "./chemycontext";

const AlternativeTab = () => {
  const { possibilities, setSelectedPossibility } = useChemy();

  return (
    <div className="h-full flex flex-col p-4 lg:p-6">
      <h2 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent mb-4">
        Alternative Synthesis Routes
      </h2>
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {possibilities.map((possibility, index) => (
          <button
            key={index}
            onClick={() => setSelectedPossibility(possibility)}
            className="w-full text-left bg-gradient-to-r from-zinc-900 to-black hover:from-zinc-800 hover:to-zinc-900 border border-zinc-800 rounded-lg p-4 transition-all duration-200"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <h3 className="text-sm font-medium text-zinc-300">
                    Route {index + 1}
                  </h3>
                </div>
                <span className="text-xs text-zinc-500">
                  Efficiency: {possibility.metrics?.efficiency}%
                </span>
              </div>

              <div className="font-mono text-xs text-purple-400 break-all">
                {possibility.reaction.length > 50
                  ? `${possibility.reaction.substring(0, 50)}...`
                  : possibility.reaction}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <MetricCard
                  label="Yield"
                  value={possibility.metrics?.yield}
                  color="text-green-400"
                  suffix="%"
                />
                <MetricCard
                  label="Cost"
                  value={possibility.metrics?.cost}
                  color="text-blue-400"
                />
                <MetricCard
                  label="Time"
                  value={possibility.metrics?.time}
                  color="text-purple-400"
                />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, color, suffix }) => (
  <div className="bg-zinc-900/50 rounded p-2">
    <span className="text-xs text-zinc-500 block">{label}</span>
    <div className={`text-xs ${color} mt-1 font-mono`}>
      {value || "0"}
      {suffix}
    </div>
  </div>
);

export default AlternativeTab;
