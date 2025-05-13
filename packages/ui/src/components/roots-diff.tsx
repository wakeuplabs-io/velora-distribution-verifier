import { computeMerkleRoot } from "@/lib/merkle-tree";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

export const RootsDiff: React.FC<{
  expectedRoot: string;
  proofs: { account: `0x${string}`; amount: string }[];
}> = ({ expectedRoot, proofs }) => {
  const computedRoot = useMemo(() => computeMerkleRoot(proofs), [proofs]);

  return (
    <div
      className={cn(
        "flex flex-col w-full border divide-y border-gray-300 rounded-lg bg-gray-50 mt-2",
        computedRoot !== null
          ? computedRoot === expectedRoot
            ? "bg-green-50 border-green-300 divide-green-300"
            : "bg-red-50 border-red-300 divide-red-300"
          : ""
      )}
    >
      <div className="p-4 text-center space-y-1 overflow-scroll">
        <div className="font-medium text-sm">Expected Root:</div>
        <div>{expectedRoot}</div>
      </div>
      
      <div className="p-4 text-center space-y-1 overflow-scroll">
        <div className="font-medium text-sm">Computed Root:</div>
        <div>{computedRoot}</div>
      </div>
    </div>
  );
};
