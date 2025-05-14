
export type GasRefundMerkleTree = {
  root: {
    merkleRoot: string;
    epoch: number;
    totalAmount: string;
  },
  proofs: {
    user: `0x${string}`;
    amount: string;
    merkleProofs: string[];
  }[];
}
  

export type RewardsMerkleTree = {
  merkleRoot: string;
  proofs: {
    account: `0x${string}`;
    cumulativeClaimableAmount: string;
    amount: string;
    merkleProofs: string[];
  }[];
}
  