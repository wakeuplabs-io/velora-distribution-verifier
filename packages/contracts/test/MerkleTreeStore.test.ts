import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { MerkleTree } from "merkletreejs";
import { encodePacked, keccak256 } from "viem";

describe("MerkleTreeStore", function () {
  async function deployContractFixture() {
    // Prepare test data
    const user = "0x1234567890123456789012345678901234567890";
    const amount = ethers.parseEther("100");

    // Deploy contract
    const MerkleTreeStoreFactory = await ethers.getContractFactory(
      "MerkleTreeStore"
    );
    const merkleTreeStore = await MerkleTreeStoreFactory.deploy();

    // Create a sample merkle tree
    const elements = (
      [
        [user, amount],
        [
          "0x9876543210987654321098765432109876543210",
          ethers.parseEther("200"),
        ],
      ] as [`0x${string}`, bigint][]
    ).map((el) =>
      keccak256(encodePacked(["address", "uint256"], [el[0], el[1]]))
    );

    const tree = new MerkleTree(elements, keccak256, { sort: true });
    const rootHash = tree.getHexRoot();

    return {
      merkleTreeStore,
      user,
      amount,
      rootHash,
      tree,
      elements,
    };
  }

  describe("verifyClaim", function () {
    it("should verify a valid claim", async function () {
      const { merkleTreeStore, user, amount, rootHash, tree, elements } =
        await loadFixture(deployContractFixture);

      // Get proof for the first element
      const proof = tree.getProof(elements[0]);

      // Verify claim
      const isValidClaim = await merkleTreeStore.verifyClaim(
        user,
        amount,
        rootHash,
        proof.map((p) => p.data)
      );

      expect(isValidClaim).to.be.true;
    });

    it("should reject an invalid claim", async function () {
      const { merkleTreeStore, user, rootHash, tree, elements } = await loadFixture(
        deployContractFixture
      );
      const invalidAmount = ethers.parseEther("150");

      // Get proof for the first element
      const proof = tree.getProof(elements[0]);

      // Verify claim with incorrect amount
      const isValidClaim = await merkleTreeStore.verifyClaim(
        user,
        invalidAmount,
        rootHash,
        proof.map((p) => p.data)
      );

      expect(isValidClaim).to.be.false;
    });
  });
});
