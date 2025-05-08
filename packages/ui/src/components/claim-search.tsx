import { cn } from "@/lib/utils";
import MerkleTree from "merkletreejs";
import { useMemo, useState } from "react";
import { encodePacked, keccak256 } from "viem";

export const ClaimSearch: React.FC<{
  root: string;
  proofs: { account: `0x${string}`; amount: string; path: string[] }[];
}> = ({ root, proofs }) => {
  const [search, setSearch] = useState<string>("");

  const proof = useMemo(() => {
    const proof = proofs.find((p) => p.account === search);
    if (proof === undefined) {
      return undefined;
    }
    const isValid = MerkleTree.verify(
      proof.path,
      keccak256(
        encodePacked(
          ["address", "uint256"],
          [proof.account, BigInt(proof.amount)]
        )
      ),
      root,
      keccak256,
      { sort: true }
    );

    return { proof, isValid };
  }, [proofs, search, root]);

  return (
    <div className="flex flex-col items-center gap-2 mt-2">
      <input
        type="text"
        className="w-full p-2 border border-gray-300 rounded-md text-center"
        placeholder="Search Address"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {proof ? (
        <div
          className={cn(
            "flex flex-col w-full border divide-y border-gray-300 rounded-lg bg-gray-50 overflow-scroll mt-2",
            proof.isValid
              ? "bg-green-50 border-green-300 divide-green-300"
              : "bg-red-50 border-red-300 divide-red-300"
          )}
        >
          <div className="p-4 text-center space-y-1">
            <div className="font-medium text-sm">Claimable amount</div>
            <div>{proof.proof.amount}</div>
          </div>
          <div className="p-4 text-center space-y-1">
            <div className="font-medium text-sm">Root</div>
            <div>{root}</div>
          </div>
          <div className="p-4 text-center space-y-1">
            <div className="font-medium text-sm">Proof</div>
            <div>{proof.proof.path.join(", ")}</div>
          </div>
          <div className="p-4 text-center space-y-1">
            <div className=" font-medium text-sm">
              Input details at{" "}
              <a href="https://eth-sepolia.blockscout.com/address/0xEca298c34670898F5E06c2856658e096675099E3?tab=read_contract#0x3c8c6cc1" target="_blank" className="underline">
                etherscan
              </a>{" "}
              to double check
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg border border-gray-300 w-full divide-y divide-gray-300">
          <div className="p-4 text-center space-y-1">
            <div className="font-medium text-sm">No results</div>
          </div>
        </div>
      )}
    </div>
  );
};
