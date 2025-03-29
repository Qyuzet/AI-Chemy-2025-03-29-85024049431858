import React from "react";
import { ChemyProvider } from "./chemycontext";
import RetractableChatbox from "./chatbox";
import AlternativeTab from "./alternativetab";
import GeneralTab from "./generaltab";
import ComposerTab from "./composertab";
import { ResearchProvider } from "./researchlab";
import { ResearchPaperGenerator } from "./researchlab"; 

const HomePage = () => {
  return (
    <ChemyProvider>
      <ResearchProvider> 
        <div className="flex flex-col w-full bg-gradient-to-b from-black via-zinc-900 to-black min-h-screen min-w-screen">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-1/3 xl:w-1/4">
                <div className="sticky top-6 space-y-6"> 
                  <RetractableChatbox />
                </div>
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-zinc-900/50 backdrop-blur-xl rounded-xl border border-zinc-800 shadow-xl hover:shadow-purple-500/10 transition-all duration-300 h-[500px]">
                    <AlternativeTab />
                  </div>
                  <div className="bg-zinc-900/50 backdrop-blur-xl rounded-xl border border-zinc-800 shadow-xl hover:shadow-blue-500/10 transition-all duration-300 h-[500px]">
                    <GeneralTab />
                  </div>
                </div>
                <div className="bg-zinc-900/50 backdrop-blur-xl rounded-xl border border-zinc-800 shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
                  <ComposerTab />
                </div>
                <div className="bg-zinc-900/50 backdrop-blur-xl rounded-xl border border-zinc-800 shadow-xl hover:shadow-purple-500/10 transition-all duration-300 mt-6">
                    <ResearchPaperGenerator />
                  </div>
              </div>
            </div>
          </div>
        </div>
      </ResearchProvider>
    </ChemyProvider>
  );
};

export default HomePage;