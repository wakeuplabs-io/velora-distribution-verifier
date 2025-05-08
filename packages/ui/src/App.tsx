import { useCallback, useState } from "react";
import { readFile } from "./lib/utils";
import type {
  GasRefundMerkleTree,
  RewardsMerkleTree,
} from "./types/merkle-tree";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dropzone } from "./components/dropzone";
import { FilenameButton } from "./components/filename-button";
import { WakeupPowered } from "./components/wakeup-powered";
import { GithubLink } from "./components/github-link";
import { RootsDiff } from "./components/roots-diff";
import { ClaimSearch } from "./components/claim-search";

export default function App() {
  const [root, setRoot] = useState<string>();
  const [proofs, setProofs] =
    useState<
      { account: `0x${string}`; amount: string; path: string[] }[]
    >();
  const [filename, setFilename] = useState<string>();

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

        return {
          account: account as `0x${string}`,
          amount,
          path: p.merkleProofs,
        };
      });

      if (merkleRoot === undefined || proofs === undefined) {
        throw new Error("Invalid file");
      }

      setRoot(merkleRoot);
      setProofs(proofs);
      setFilename(files[0].name);
    } catch (e) {
      toast.error("Invalid file", {
        description:
          "File must match `merkledata-chain-....json` schema for rewards or gas refunds",
      });
    }
  }, []);

  const onReset = useCallback(() => {
    setFilename(undefined);
    setRoot(undefined);
    setProofs(undefined);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen max-w-2xl mx-auto gap-8 py-10 px-4">
      <div className="flex flex-col items-center justify-center gap-2">
        <h1 className="text-2xl font-bold">Velora Rewards/Refunds Verifier</h1>
        <p className="text-sm max-w-lg text-center">
          Upload the `merkledata-chain-....json` file to validate the
          rewards/refunds distribution root.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 w-full">
        {root === undefined || proofs === undefined ? (
          <Dropzone onFileChange={onFileChange} />
        ) : (
          <Tabs defaultValue="root" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="root">Root</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>

            <TabsContent value="root">
              <RootsDiff expectedRoot={root!} proofs={proofs!} />
            </TabsContent>
            <TabsContent value="account">
              <ClaimSearch root={root!} proofs={proofs!} />
            </TabsContent>
          </Tabs>
        )}

        <FilenameButton filename={filename} onClick={onReset} />
      </div>

      <WakeupPowered />

      <GithubLink />
    </div>
  );
}
