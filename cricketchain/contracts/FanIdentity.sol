// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

interface IFanToken {
    function mint(address to, uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
    function totalSupply() external view returns (uint256);
}

contract FanIdentity is AccessControl {
    bytes32 public constant XP_AWARDER_ROLE = keccak256("XP_AWARDER_ROLE");

    enum Tier { Bronze, Silver, Gold, Platinum, Diamond }

    struct FanProfile {
        string username;
        uint256 totalXP;
        uint256 matchesAttended;
        uint256 votesParticipated;
        uint256 contentSubmitted;
        uint256 registeredAt;
        bool exists;
    }

    IFanToken public immutable fanToken;
    mapping(address => FanProfile) public profiles;
    address[] public allFans;

    uint256 public constant TIER_BRONZE = 0;
    uint256 public constant TIER_SILVER = 500;
    uint256 public constant TIER_GOLD = 2000;
    uint256 public constant TIER_PLATINUM = 5000;
    uint256 public constant TIER_DIAMOND = 15000;

    uint256 public constant XP_TO_TOKEN_RATIO = 1e18;

    event FanRegistered(address indexed fan, string username);
    event XPAwarded(address indexed fan, uint256 amount, string reason);

    constructor(address _fanToken) {
        fanToken = IFanToken(_fanToken);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function register(string calldata username) external {
        require(!profiles[msg.sender].exists, "Already registered");
        require(bytes(username).length > 0, "Username cannot be empty");

        profiles[msg.sender] = FanProfile({
            username: username,
            totalXP: 0,
            matchesAttended: 0,
            votesParticipated: 0,
            contentSubmitted: 0,
            registeredAt: block.timestamp,
            exists: true
        });
        allFans.push(msg.sender);

        emit FanRegistered(msg.sender, username);
    }

    function awardXP(address fan, uint256 amount, string calldata reason) external onlyRole(XP_AWARDER_ROLE) {
        require(profiles[fan].exists, "Fan not registered");
        profiles[fan].totalXP += amount;
        fanToken.mint(fan, amount * XP_TO_TOKEN_RATIO);
        emit XPAwarded(fan, amount, reason);
    }

    function getProfile(address fan) external view returns (FanProfile memory) {
        return profiles[fan];
    }

    function getTier(address fan) public view returns (Tier) {
        uint256 xp = profiles[fan].totalXP;
        if (xp >= TIER_DIAMOND) return Tier.Diamond;
        if (xp >= TIER_PLATINUM) return Tier.Platinum;
        if (xp >= TIER_GOLD) return Tier.Gold;
        if (xp >= TIER_SILVER) return Tier.Silver;
        return Tier.Bronze;
    }

    function getTierMultiplier(address fan) public view returns (uint256) {
        Tier tier = getTier(fan);
        if (tier == Tier.Diamond) return 300;
        if (tier == Tier.Platinum) return 200;
        if (tier == Tier.Gold) return 150;
        if (tier == Tier.Silver) return 120;
        return 100; // Bronze
    }

    function getVoteWeight(address fan) external view returns (uint256) {
        return fanToken.balanceOf(fan) * getTierMultiplier(fan) / 100;
    }

    function incrementMatchesAttended(address fan) external onlyRole(XP_AWARDER_ROLE) {
        require(profiles[fan].exists, "Fan not registered");
        profiles[fan].matchesAttended++;
    }

    function incrementVotesParticipated(address fan) external onlyRole(XP_AWARDER_ROLE) {
        require(profiles[fan].exists, "Fan not registered");
        profiles[fan].votesParticipated++;
    }

    function incrementContentSubmitted(address fan) external onlyRole(XP_AWARDER_ROLE) {
        require(profiles[fan].exists, "Fan not registered");
        profiles[fan].contentSubmitted++;
    }

    function totalFans() external view returns (uint256) {
        return allFans.length;
    }
}
