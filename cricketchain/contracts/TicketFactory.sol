// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IFanIdentity {
    function awardXP(address fan, uint256 amount, string calldata reason) external;
    function incrementMatchesAttended(address fan) external;
}

contract TicketFactory is ERC1155, AccessControl, ReentrancyGuard {
    bytes32 public constant ORGANIZER_ROLE = keccak256("ORGANIZER_ROLE");

    struct Match {
        uint256 matchId;
        string name;
        uint256 date;
        bool active;
    }

    struct TicketCategory {
        uint256 tokenId;
        uint256 matchId;
        string categoryName;
        uint256 price;
        uint256 maxResalePrice;
        uint256 totalSupply;
        uint256 sold;
    }

    struct Listing {
        address seller;
        uint256 tokenId;
        uint256 price;
        bool active;
    }

    IFanIdentity public immutable fanIdentity;
    address public treasury;

    uint256 public matchCount;
    uint256 public tokenIdCounter;
    mapping(uint256 => Match) public matches;
    mapping(uint256 => TicketCategory) public categories;
    mapping(uint256 => mapping(address => bool)) public checkedIn;

    Listing[] public listings;
    uint256 public constant RESALE_ROYALTY_BPS = 700; // 7%

    // Track whether an address is allowed to transfer (bypass the transfer block)
    bool private _internalTransfer;

    event MatchCreated(uint256 indexed matchId, string name, uint256 date);
    event CategoryCreated(uint256 indexed tokenId, uint256 indexed matchId, string categoryName, uint256 price, uint256 supply);
    event TicketPurchased(uint256 indexed tokenId, address indexed buyer, uint256 price);
    event TicketListed(uint256 indexed listingId, uint256 indexed tokenId, address indexed seller, uint256 price);
    event TicketResold(uint256 indexed listingId, uint256 indexed tokenId, address indexed buyer, uint256 price);
    event ListingCancelled(uint256 indexed listingId);
    event CheckedIn(uint256 indexed tokenId, address indexed fan);

    constructor(address _fanIdentity, address _treasury) ERC1155("") {
        fanIdentity = IFanIdentity(_fanIdentity);
        treasury = _treasury;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORGANIZER_ROLE, msg.sender);
    }

    function createMatch(string calldata name, uint256 date) external onlyRole(ORGANIZER_ROLE) {
        matchCount++;
        matches[matchCount] = Match({
            matchId: matchCount,
            name: name,
            date: date,
            active: true
        });
        emit MatchCreated(matchCount, name, date);
    }

    function createTicketCategory(
        uint256 matchId,
        string calldata categoryName,
        uint256 price,
        uint256 maxResalePriceBPS,
        uint256 supply
    ) external onlyRole(ORGANIZER_ROLE) {
        require(matches[matchId].active, "Match does not exist or inactive");
        require(supply > 0, "Supply must be > 0");

        tokenIdCounter++;
        uint256 tokenId = tokenIdCounter;
        uint256 maxResalePrice = price * maxResalePriceBPS / 10000;

        categories[tokenId] = TicketCategory({
            tokenId: tokenId,
            matchId: matchId,
            categoryName: categoryName,
            price: price,
            maxResalePrice: maxResalePrice,
            totalSupply: supply,
            sold: 0
        });

        _internalTransfer = true;
        _mint(address(this), tokenId, supply, "");
        _internalTransfer = false;

        emit CategoryCreated(tokenId, matchId, categoryName, price, supply);
    }

    function buyTicket(uint256 tokenId) external payable nonReentrant {
        TicketCategory storage cat = categories[tokenId];
        require(cat.totalSupply > 0, "Category does not exist");
        require(msg.value == cat.price, "Incorrect price");
        require(cat.sold < cat.totalSupply, "Sold out");

        cat.sold++;
        _internalTransfer = true;
        _safeTransferFrom(address(this), msg.sender, tokenId, 1, "");
        _internalTransfer = false;

        (bool sent, ) = treasury.call{value: msg.value}("");
        require(sent, "Failed to send to treasury");

        emit TicketPurchased(tokenId, msg.sender, msg.value);
    }

    function listForResale(uint256 tokenId, uint256 price) external nonReentrant {
        require(balanceOf(msg.sender, tokenId) >= 1, "No ticket to sell");
        require(price <= categories[tokenId].maxResalePrice, "Price exceeds max resale price");

        _internalTransfer = true;
        _safeTransferFrom(msg.sender, address(this), tokenId, 1, "");
        _internalTransfer = false;

        uint256 listingId = listings.length;
        listings.push(Listing({
            seller: msg.sender,
            tokenId: tokenId,
            price: price,
            active: true
        }));

        emit TicketListed(listingId, tokenId, msg.sender, price);
    }

    function buyResaleTicket(uint256 listingId) external payable nonReentrant {
        require(listingId < listings.length, "Listing does not exist");
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(msg.value == listing.price, "Incorrect price");

        listing.active = false;

        uint256 royalty = msg.value * RESALE_ROYALTY_BPS / 10000;
        uint256 sellerProceeds = msg.value - royalty;

        _internalTransfer = true;
        _safeTransferFrom(address(this), msg.sender, listing.tokenId, 1, "");
        _internalTransfer = false;

        (bool sentSeller, ) = listing.seller.call{value: sellerProceeds}("");
        require(sentSeller, "Failed to send to seller");

        (bool sentTreasury, ) = treasury.call{value: royalty}("");
        require(sentTreasury, "Failed to send royalty");

        emit TicketResold(listingId, listing.tokenId, msg.sender, msg.value);
    }

    function cancelListing(uint256 listingId) external nonReentrant {
        require(listingId < listings.length, "Listing does not exist");
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not the seller");

        listing.active = false;

        _internalTransfer = true;
        _safeTransferFrom(address(this), msg.sender, listing.tokenId, 1, "");
        _internalTransfer = false;

        emit ListingCancelled(listingId);
    }

    function checkIn(uint256 tokenId, address fan) external onlyRole(ORGANIZER_ROLE) {
        require(balanceOf(fan, tokenId) >= 1, "Fan does not hold ticket");
        require(!checkedIn[tokenId][fan], "Already checked in");

        checkedIn[tokenId][fan] = true;
        fanIdentity.awardXP(fan, 100, "Match Attendance");
        fanIdentity.incrementMatchesAttended(fan);

        emit CheckedIn(tokenId, fan);
    }

    function isCheckedIn(uint256 tokenId, address fan) external view returns (bool) {
        return checkedIn[tokenId][fan];
    }

    function getMatch(uint256 matchId) external view returns (Match memory) {
        return matches[matchId];
    }

    function getCategory(uint256 tokenId) external view returns (TicketCategory memory) {
        return categories[tokenId];
    }

    function getListing(uint256 listingId) external view returns (Listing memory) {
        require(listingId < listings.length, "Listing does not exist");
        return listings[listingId];
    }

    function totalListings() external view returns (uint256) {
        return listings.length;
    }

    // Override _update to block direct peer-to-peer transfers
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override {
        // Allow: mints (from=0), burns (to=0), internal contract transfers
        if (from != address(0) && to != address(0)) {
            require(
                _internalTransfer,
                "Direct transfers blocked: use marketplace"
            );
        }
        super._update(from, to, ids, values);
    }

    // Required override for AccessControl + ERC1155
    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // Allow contract to receive ERC1155 tokens
    function onERC1155Received(address, address, uint256, uint256, bytes memory) public pure returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(address, address, uint256[] memory, uint256[] memory, bytes memory) public pure returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }
}
