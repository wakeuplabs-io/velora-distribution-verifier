// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleTreeStore {
    using MerkleProof for bytes32[];

    function verifyClaim(
        address user,
        uint256 amount,
        bytes32 rootHash,
        bytes32[] memory proofs
    ) public pure returns (bool) {
        bytes32 hashedLeaf = keccak256(abi.encodePacked(user, amount));
        return proofs.verify(rootHash, hashedLeaf);
    }
}
