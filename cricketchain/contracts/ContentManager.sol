// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IFanIdentityForContent {
    function awardXP(address fan, uint256 amount, string calldata reason) external;
    function incrementContentSubmitted(address fan) external;
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

interface IRevenueSplitter {
    function createSplit(
        uint256 contentId,
        address creator,
        address platform,
        address pslTreasury,
        uint256 creatorBPS,
        uint256 platformBPS,
        uint256 pslBPS,
        uint256 sponsorPoolBPS
    ) external;
    function depositRevenue(uint256 contentId) external payable;
}

contract ContentManager is ERC721, AccessControl, ReentrancyGuard {
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");

    enum ContentStatus { Pending, Approved, Rejected }

    struct ContentSubmission {
        uint256 contentId;
        address creator;
        string metadataURI;
        string title;
        string description;
        ContentStatus status;
        uint256 submittedAt;
        uint256 reviewedAt;
    }

    IFanIdentityForContent public immutable fanIdentity;
    IRevenueSplitter public immutable revenueSplitter;

    uint256 public contentCount;
    mapping(uint256 => ContentSubmission) public submissions;
    mapping(address => uint256[]) public creatorSubmissions;
    uint256[] public pendingSubmissions;

    // Default split percentages (in BPS)
    uint256 public defaultCreatorBPS = 5000;
    uint256 public defaultPlatformBPS = 2000;
    uint256 public defaultPslBPS = 1500;
    uint256 public defaultSponsorBPS = 1500;

    address public platform;
    address public pslTreasury;

    event ContentSubmitted(uint256 indexed contentId, address indexed creator, string title);
    event ContentApproved(uint256 indexed contentId, address indexed creator);
    event ContentRejected(uint256 indexed contentId, address indexed creator);
    event ContentTipped(uint256 indexed contentId, address indexed tipper, uint256 amount);
    event SponsorFunded(uint256 indexed contentId, address indexed sponsor, uint256 amount);

    constructor(
        address _fanIdentity,
        address _revenueSplitter,
        address _platform,
        address _pslTreasury
    ) ERC721("PSL Content", "PSLC") {
        fanIdentity = IFanIdentityForContent(_fanIdentity);
        revenueSplitter = IRevenueSplitter(_revenueSplitter);
        platform = _platform;
        pslTreasury = _pslTreasury;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MODERATOR_ROLE, msg.sender);
    }

    function submitContent(
        string calldata metadataURI,
        string calldata title,
        string calldata description
    ) external {
        (, , , , , , bool exists) = fanIdentity.profiles(msg.sender);
        require(exists, "Must be a registered fan");
        require(bytes(metadataURI).length > 0, "MetadataURI cannot be empty");

        contentCount++;
        uint256 contentId = contentCount;

        submissions[contentId] = ContentSubmission({
            contentId: contentId,
            creator: msg.sender,
            metadataURI: metadataURI,
            title: title,
            description: description,
            status: ContentStatus.Pending,
            submittedAt: block.timestamp,
            reviewedAt: 0
        });

        creatorSubmissions[msg.sender].push(contentId);
        pendingSubmissions.push(contentId);

        emit ContentSubmitted(contentId, msg.sender, title);
    }

    function approveContent(uint256 contentId) external onlyRole(MODERATOR_ROLE) {
        ContentSubmission storage sub = submissions[contentId];
        require(sub.creator != address(0), "Content does not exist");
        require(sub.status == ContentStatus.Pending, "Content already reviewed");

        sub.status = ContentStatus.Approved;
        sub.reviewedAt = block.timestamp;

        // Mint NFT to this contract (platform holds it)
        _mint(address(this), contentId);

        // Create revenue split
        revenueSplitter.createSplit(
            contentId,
            sub.creator,
            platform,
            pslTreasury,
            defaultCreatorBPS,
            defaultPlatformBPS,
            defaultPslBPS,
            defaultSponsorBPS
        );

        // Award XP
        fanIdentity.awardXP(sub.creator, 50, "Content Approved");
        fanIdentity.incrementContentSubmitted(sub.creator);

        _removePending(contentId);

        emit ContentApproved(contentId, sub.creator);
    }

    function rejectContent(uint256 contentId) external onlyRole(MODERATOR_ROLE) {
        ContentSubmission storage sub = submissions[contentId];
        require(sub.creator != address(0), "Content does not exist");
        require(sub.status == ContentStatus.Pending, "Content already reviewed");

        sub.status = ContentStatus.Rejected;
        sub.reviewedAt = block.timestamp;

        _removePending(contentId);

        emit ContentRejected(contentId, sub.creator);
    }

    function tipContent(uint256 contentId) external payable nonReentrant {
        require(submissions[contentId].status == ContentStatus.Approved, "Content not approved");
        require(msg.value > 0, "Must tip > 0");

        revenueSplitter.depositRevenue{value: msg.value}(contentId);
        emit ContentTipped(contentId, msg.sender, msg.value);
    }

    function sponsorContent(uint256 contentId) external payable nonReentrant {
        require(submissions[contentId].status == ContentStatus.Approved, "Content not approved");
        require(msg.value > 0, "Must fund > 0");

        revenueSplitter.depositRevenue{value: msg.value}(contentId);
        emit SponsorFunded(contentId, msg.sender, msg.value);
    }

    function getSubmission(uint256 contentId) external view returns (ContentSubmission memory) {
        return submissions[contentId];
    }

    function getSubmissionsByCreator(address creator) external view returns (uint256[] memory) {
        return creatorSubmissions[creator];
    }

    function getPendingSubmissions() external view returns (uint256[] memory) {
        return pendingSubmissions;
    }

    function updateDefaultSplitBPS(
        uint256 creatorBPS,
        uint256 platformBPS,
        uint256 pslBPS,
        uint256 sponsorBPS
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(creatorBPS + platformBPS + pslBPS + sponsorBPS == 10000, "Must sum to 10000");
        defaultCreatorBPS = creatorBPS;
        defaultPlatformBPS = platformBPS;
        defaultPslBPS = pslBPS;
        defaultSponsorBPS = sponsorBPS;
    }

    function _removePending(uint256 contentId) internal {
        for (uint256 i = 0; i < pendingSubmissions.length; i++) {
            if (pendingSubmissions[i] == contentId) {
                pendingSubmissions[i] = pendingSubmissions[pendingSubmissions.length - 1];
                pendingSubmissions.pop();
                break;
            }
        }
    }

    // Required overrides
    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, AccessControl) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
