import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MerkleTreeStoreModule = buildModule("MerkleTreeStoreModule", (m) => {
  const merkleTreeStore = m.contract("MerkleTreeStore", []);

  return { merkleTreeStore };
});

export default MerkleTreeStoreModule;
