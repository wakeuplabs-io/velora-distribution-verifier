import { MerkleTree } from "merkletreejs";
import { encodePacked, keccak256 } from "viem";

export function computeMerkleRoot(
  leafs: { account: `0x${string}`; amount: string }[]
): string {
  const hashedLeaves = leafs.map(({ account, amount }) =>
    keccak256(encodePacked(["address", "uint256"], [account, BigInt(amount)]))
  );

  const merkleTree = new MerkleTree(hashedLeaves, keccak256, {
    sort: true,
  });

  return merkleTree.getHexRoot();
}
