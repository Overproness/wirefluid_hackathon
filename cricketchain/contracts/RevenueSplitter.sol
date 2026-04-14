// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract RevenueSplitter is AccessControl, ReentrancyGuard {
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    uint256 public constant BPS_DENOMINATOR = 10000;

    struct Split {
        uint256 contentId;
        address creator;
        address platform;
        address pslTreasury;
        uint256 creatorBPS;
        uint256 platformBPS;
        uint256 pslBPS;
        uint256 sponsorPoolBPS;
        uint256 totalDeposited;
    }

    mapping(uint256 => Split) public splits;
    mapping(uint256 => mapping(address => uint256)) public claimed;
    address public sponsorPool;

    event SplitCreated(uint256 indexed contentId, address indexed creator);
    event RevenueDeposited(uint256 indexed contentId, address indexed depositor, uint256 amount);
    event RevenueClaimed(uint256 indexed contentId, address indexed claimant, uint256 amount);

    constructor(address _platform, address _pslTreasury, address _sponsorPool) {
        sponsorPool = _sponsorPool;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        // Store platform and treasury addresses for reference, but they're set per-split
    }

    function createSplit(
        uint256 contentId,
        address creator,
        address platform,
        address pslTreasury,
        uint256 creatorBPS,
        uint256 platformBPS,
        uint256 pslBPS,
        uint256 sponsorPoolBPS
    ) external onlyRole(MANAGER_ROLE) {
        require(
            creatorBPS + platformBPS + pslBPS + sponsorPoolBPS == BPS_DENOMINATOR,
            "BPS must sum to 10000"
        );
        require(splits[contentId].creator == address(0), "Split already exists");

        splits[contentId] = Split({
            contentId: contentId,
            creator: creator,
            platform: platform,
            pslTreasury: pslTreasury,
            creatorBPS: creatorBPS,
            platformBPS: platformBPS,
            pslBPS: pslBPS,
            sponsorPoolBPS: sponsorPoolBPS,
            totalDeposited: 0
        });

        emit SplitCreated(contentId, creator);
    }

    function depositRevenue(uint256 contentId) external payable {
        require(splits[contentId].creator != address(0), "Split does not exist");
        require(msg.value > 0, "Must deposit > 0");

        splits[contentId].totalDeposited += msg.value;
        emit RevenueDeposited(contentId, msg.sender, msg.value);
    }

    function getClaimable(uint256 contentId, address claimant) public view returns (uint256) {
        Split storage s = splits[contentId];
        uint256 bps = _getBPS(contentId, claimant);
        if (bps == 0) return 0;

        uint256 totalEntitled = s.totalDeposited * bps / BPS_DENOMINATOR;
        uint256 alreadyClaimed = claimed[contentId][claimant];
        if (totalEntitled <= alreadyClaimed) return 0;
        return totalEntitled - alreadyClaimed;
    }

    function claimRevenue(uint256 contentId) external nonReentrant {
        uint256 claimable = getClaimable(contentId, msg.sender);
        require(claimable > 0, "Nothing to claim");

        claimed[contentId][msg.sender] += claimable;

        (bool sent, ) = msg.sender.call{value: claimable}("");
        require(sent, "Transfer failed");

        emit RevenueClaimed(contentId, msg.sender, claimable);
    }

    function _getBPS(uint256 contentId, address claimant) internal view returns (uint256) {
        Split storage s = splits[contentId];
        if (claimant == s.creator) return s.creatorBPS;
        if (claimant == s.platform) return s.platformBPS;
        if (claimant == s.pslTreasury) return s.pslBPS;
        if (claimant == sponsorPool) return s.sponsorPoolBPS;
        return 0;
    }

    function getContentRevenue(uint256 contentId) external view returns (
        uint256 totalDeposited,
        uint256 creatorClaimed,
        uint256 platformClaimed,
        uint256 pslClaimed,
        uint256 sponsorClaimed
    ) {
        Split storage s = splits[contentId];
        return (
            s.totalDeposited,
            claimed[contentId][s.creator],
            claimed[contentId][s.platform],
            claimed[contentId][s.pslTreasury],
            claimed[contentId][sponsorPool]
        );
    }
}
