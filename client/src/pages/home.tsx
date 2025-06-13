import Navigation from "@/components/navigation";
import AiModels from "@/components/ai-models";
import ChatInterface from "@/components/chat-interface";
import VipUpgradeModal from "@/components/vip-upgrade-modal";
import { useState } from "react";

export default function Home() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);

  const handleUpgrade = () => {
    setShowUpgradeModal(true);
  };

  const handleSelectModel = (modelId: number) => {
    setSelectedModelId(modelId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation onUpgrade={handleUpgrade} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Models Section */}
          <div className="lg:col-span-1">
            <AiModels onSelectModel={handleSelectModel} />
          </div>
          
          {/* Chat Interface Section */}
          <div className="lg:col-span-2">
            <ChatInterface selectedModelId={selectedModelId} />
          </div>
        </div>
      </main>

      <VipUpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </div>
  );
}
