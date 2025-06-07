import React from "react";

interface TerminalProps {
  folder: string;
  children: React.ReactNode;
}

export function Terminal({ folder, children }: TerminalProps) {
  return (
    <div className="bg-black rounded-lg shadow-lg font-mono my-6 overflow-x-auto border border-gray-700">
      <div className="flex items-center px-4 py-2 border-b border-gray-700 rounded-t-lg">
        <span className="text-xs font-semibold">{folder}</span>
      </div>
      <pre className="px-4 py-3 whitespace-pre-wrap text-sm">
        {children}
      </pre>
    </div>
  );
}

export default Terminal;
