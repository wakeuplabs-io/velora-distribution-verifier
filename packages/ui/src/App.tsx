import { computeMerkleRoot } from "./lib/merkle-tree";
import { useCallback, useState } from "react";
import { cn, readFile } from "./lib/utils";
import { useDropzone } from "react-dropzone";
import wakeupPowered from "./assets/wakeup-powered.svg";
import type {
  GasRefundMerkleTree,
  RewardsMerkleTree,
} from "./types/merkle-tree";
import { toast } from "sonner";

export default function App() {
  const [computedMerkleRoot, setComputedMerkleRoot] = useState<string | null>(
    null
  );
  const [expectedMerkleRoot, setExpectedMerkleRoot] = useState<string | null>(
    null
  );
  const [filename, setFilename] = useState<string | null>(null);

  const onFileChange = useCallback(async (files: File[]) => {
    try {
      const fileContent = await readFile(files[0]);

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

      setFilename(files[0].name);
      setExpectedMerkleRoot(merkleRoot);
      setComputedMerkleRoot(computeMerkleRoot(proofs));
    } catch (e) {
      toast.error("Invalid file", {
        description:
          "File must match `merkledata-chain-....json` schema for rewards or gas refunds",
      });
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
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
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
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
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

      <a href="https://wakeuplabs.io" target="_blank" rel="noopener noreferrer">
        <img src={wakeupPowered} alt="Wakeup Powered" />
      </a>

      <a
        href="https://github.com/wakeuplabs-io/velora-distribution-verifier"
        target="_blank"
        className="fixed right-0 top-0"
        aria-label="View source on Github"
      >
        <svg
          viewBox="0 0 250 250"
          aria-hidden="true"
          className="fill-[#42b983] h-20 w-20"
        >
          <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
          <path
            d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
            fill="currentColor"
            style={{ transformOrigin: "130px 106px" }}
            className="fill-white"
          ></path>
          <path
            d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"
            fill="currentColor"
            className="fill-white"
          ></path>
        </svg>
      </a>
    </div>
  );
}
