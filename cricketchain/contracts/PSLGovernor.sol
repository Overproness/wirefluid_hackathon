// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IFanTokenForGov {
    function balanceOf(address account) external view returns (uint256);
    function totalSupply() external view returns (uint256);
}

interface IFanIdentityForGov {
    function getVoteWeight(address fan) external view returns (uint256);
    function awardXP(address fan, uint256 amount, string calldata reason) external;
    function incrementVotesParticipated(address fan) external;
    function profiles(address fan) external view returns (
        string memory username,
        uint256 totalXP,
        uint256 matchesAttended,
        uint256 votesParticipated,
        uint256 contentSubmitted,
        uint256 registeredAt,
        bool exists
    );
}

contract PSLGovernor is AccessControl, ReentrancyGuard {
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");

    enum ProposalType { MVP_VOTE, FAN_AWARD, CHARITY, GENERAL }
    enum ProposalState { Active, Succeeded, Defeated, Executed }

    struct Proposal {
        uint256 proposalId;
        ProposalType proposalType;
        string title;
        string description;
        string[] options;
        uint256 startTime;
        uint256 endTime;
        address proposer;
        ProposalState state;
        uint256 totalVotes;
    }

    IFanTokenForGov public immutable fanToken;
    IFanIdentityForGov public immutable fanIdentity;

    uint256 public proposalCount;
    mapping(uint256 => Proposal) internal _proposals;
    mapping(uint256 => mapping(uint256 => uint256)) public optionVotes;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    uint256 public quorumBPS = 1000; // 10%

    event ProposalCreated(uint256 indexed proposalId, string title, ProposalType proposalType, string[] options);
    event Voted(uint256 indexed proposalId, address indexed voter, uint256 optionIndex, uint256 weight);
    event ProposalFinalized(uint256 indexed proposalId, ProposalState state, uint256 winningOption, uint256 winningVotes);
    event ProposalExecuted(uint256 indexed proposalId);

    constructor(address _fanToken, address _fanIdentity) {
        fanToken = IFanTokenForGov(_fanToken);
        fanIdentity = IFanIdentityForGov(_fanIdentity);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PROPOSER_ROLE, msg.sender);
    }

    function createProposal(
        ProposalType proposalType,
        string calldata title,
        string calldata description,
        string[] calldata options,
        uint256 duration
    ) external onlyRole(PROPOSER_ROLE) {
        require(options.length >= 2, "Need at least 2 options");
        require(duration >= 1 hours, "Duration too short");
        require(duration <= 7 days, "Duration too long");

        proposalCount++;
        uint256 proposalId = proposalCount;

        Proposal storage p = _proposals[proposalId];
        p.proposalId = proposalId;
        p.proposalType = proposalType;
        p.title = title;
        p.description = description;
        p.startTime = block.timestamp;
        p.endTime = block.timestamp + duration;
        p.proposer = msg.sender;
        p.state = ProposalState.Active;
        p.totalVotes = 0;

        for (uint256 i = 0; i < options.length; i++) {
            p.options.push(options[i]);
        }

        emit ProposalCreated(proposalId, title, proposalType, options);
    }

    function vote(uint256 proposalId, uint256 optionIndex) external nonReentrant {
        Proposal storage p = _proposals[proposalId];
        require(p.state == ProposalState.Active, "Proposal not active");
        require(block.timestamp >= p.startTime, "Voting not started");
        require(block.timestamp <= p.endTime, "Voting ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");
        require(optionIndex < p.options.length, "Invalid option");

        (, , , , , , bool exists) = fanIdentity.profiles(msg.sender);
        require(exists, "Must be registered fan");

        uint256 weight = fanIdentity.getVoteWeight(msg.sender);
        require(weight > 0, "No voting power");

        optionVotes[proposalId][optionIndex] += weight;
        hasVoted[proposalId][msg.sender] = true;
        p.totalVotes += weight;

        fanIdentity.awardXP(msg.sender, 25, "DAO Vote");
        fanIdentity.incrementVotesParticipated(msg.sender);

        emit Voted(proposalId, msg.sender, optionIndex, weight);
    }

    function finalizeProposal(uint256 proposalId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        Proposal storage p = _proposals[proposalId];
        require(p.state == ProposalState.Active, "Not active");
        require(block.timestamp > p.endTime, "Voting not ended");

        uint256 totalSupply = fanToken.totalSupply();
        uint256 quorumRequired = totalSupply * quorumBPS / 10000;

        if (p.totalVotes >= quorumRequired && totalSupply > 0) {
            p.state = ProposalState.Succeeded;
        } else {
            p.state = ProposalState.Defeated;
        }

        (uint256 winIdx, uint256 winVotes) = _getWinningOption(proposalId);
        emit ProposalFinalized(proposalId, p.state, winIdx, winVotes);
    }

    function executeProposal(uint256 proposalId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        Proposal storage p = _proposals[proposalId];
        require(p.state == ProposalState.Succeeded, "Not succeeded");

        p.state = ProposalState.Executed;
        emit ProposalExecuted(proposalId);
    }

    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        return _proposals[proposalId];
    }

    function getOptionVotes(uint256 proposalId, uint256 optionIndex) external view returns (uint256) {
        return optionVotes[proposalId][optionIndex];
    }

    function getWinningOption(uint256 proposalId) external view returns (uint256 winningIndex, uint256 winningVotes) {
        return _getWinningOption(proposalId);
    }

    function hasUserVoted(uint256 proposalId, address voter) external view returns (bool) {
        return hasVoted[proposalId][voter];
    }

    function setQuorum(uint256 newQuorumBPS) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newQuorumBPS <= 10000, "Cannot exceed 100%");
        quorumBPS = newQuorumBPS;
    }

    function _getWinningOption(uint256 proposalId) internal view returns (uint256 winIdx, uint256 winVotes) {
        Proposal storage p = _proposals[proposalId];
        for (uint256 i = 0; i < p.options.length; i++) {
            uint256 votes = optionVotes[proposalId][i];
            if (votes > winVotes) {
                winVotes = votes;
                winIdx = i;
            }
        }
    }

    function supportsInterface(bytes4 interfaceId) public view override(AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
