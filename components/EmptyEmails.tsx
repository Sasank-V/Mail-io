"use client"

import { Mail } from "lucide-react";

export const SyncPrompt = () => {
  return (
    <div className="h-full backdrop-blur-md flex items-center justify-center z-50">
      <div className="p-12 rounded-xl shadow-lg flex flex-col items-center">
        <Mail className="w-16 h-16 text-primary mb-6" />
        <p className="text-xl font-semibold text-primary">
          Sync to see your mail
        </p>
      </div>
    </div>
  );
};

export default SyncPrompt;
