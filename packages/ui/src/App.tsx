import { computeMerkleRoot } from "./lib/merkle-tree";
import { useCallback, useState } from "react";
import { cn } from "./lib/utils";
import { useDropzone } from "react-dropzone";
import wakeupPowered from "./assets/wakeup-powered.svg";
import type {
  GasRefundMerkleTree,
  RewardsMerkleTree,
} from "./types/merkle-tree";

export default function App() {
  const [computedMerkleRoot, setComputedMerkleRoot] = useState<string | null>(
    null
  );
  const [expectedMerkleRoot, setExpectedMerkleRoot] = useState<string | null>(
    null
  );
  const [filename, setFilename] = useState<string | null>(null);

  const onFileChange = useCallback((files: File[]) => {
    try {
      const file = files[0];

      const fileReader = new FileReader();
      fileReader.onload = async (event) => {
        const fileContent = event.target?.result as string;
        const parsedContent = JSON.parse(fileContent) as
          | RewardsMerkleTree
          | GasRefundMerkleTree;

        const merkleRoot =
          "merkleRoot" in parsedContent
            ? parsedContent.merkleRoot
            : parsedContent.root.merkleRoot;

        const proofs = (
          "proofs" in parsedContent ? parsedContent.proofs : []
        ).map((p) => {
          const amount =
            "cumulativeClaimableAmount" in p
              ? p.cumulativeClaimableAmount
              : p.amount;
          if (amount === undefined) {
            throw new Error("Invalid file");
          }

          const account = "account" in p ? p.account : p.user;
          if (account === undefined) {
            throw new Error("Invalid file");
          }

          return { account, amount };
        });

        if (merkleRoot === undefined || proofs === undefined) {
          throw new Error("Invalid file");
        }

        setFilename(file.name);
        setExpectedMerkleRoot(merkleRoot);
        setComputedMerkleRoot(computeMerkleRoot(proofs));
      };
      fileReader.readAsText(file);
    } catch (e) {
      console.error(e);
      alert("Invalid file");
    }
  }, []);

  const onReset = useCallback(() => {
    setFilename(null);
    setExpectedMerkleRoot(null);
    setComputedMerkleRoot(null);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onFileChange,
    accept: {
      "application/json": [".json"],
    },
    maxFiles: 1,
  });

  return (
    <div className="flex flex-col items-center justify-center h-screen max-w-2xl mx-auto gap-8">
      <div className="flex flex-col items-center justify-center gap-2">
        <h1 className="text-2xl font-bold">Velora Rewards/Refunds Verifier</h1>
        <p className="text-sm max-w-lg text-center">
          Upload the `merkledata-chain-....json` file to validate the
          rewards/refunds distribution root.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 w-full">
        {filename !== null ? (
          <div className="flex items-center  gap-2  border border-gray-300 rounded-md py-2 px-4 bg-gray-50">
            <span className="text-sm font-medium text-gray-800">
              {filename}
            </span>
            <button className="cursor-pointer" onClick={onReset}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="lucide lucide-x-icon lucide-x"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        ) : null}

        {expectedMerkleRoot === null ? (
          <div
            {...getRootProps()}
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-5 hover:bg-gray-100"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-4 text-gray-500"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500 ">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500 ">
                merkle-data-chain-....json
              </p>
            </div>
            <input type="file" className="hidden" {...getInputProps()} />
          </div>
        ) : (
          <div
            className={cn(
              "flex flex-col w-full border divide-y border-gray-300 rounded-lg bg-gray-50 overflow-scroll",
              computedMerkleRoot !== null
                ? computedMerkleRoot === expectedMerkleRoot
                  ? "bg-green-50 border-green-300 divide-green-300"
                  : "bg-red-50 border-red-300 divide-red-300"
                : ""
            )}
          >
            <div className="p-4 text-center space-y-1">
              <div className="font-medium text-sm">Expected Merkle Root:</div>
              <div>{expectedMerkleRoot}</div>
            </div>
            <div className="p-4 text-center space-y-1">
              <div className="font-medium text-sm">Computed Merkle Root:</div>
              <div>{computedMerkleRoot}</div>
            </div>
          </div>
        )}
      </div>

      <img src={wakeupPowered} alt="Wakeup Powered" />
    </div>
  );
}
