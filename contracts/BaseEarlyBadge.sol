// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title BaseEarlyBadge
 * @notice Soulbound NFT badge proving how early a wallet was on Base
 * @dev Non-transferable ERC721 with on-chain metadata
 */
contract BaseEarlyBadge is ERC721, Ownable {
    using Strings for uint256;

    struct BadgeData {
        uint256 walletOrder;
        uint256 percentile; // Stored as basis points (9540 = 95.40%)
        uint8 tierIndex;
        uint256 firstTxTimestamp;
        uint256 mintTimestamp;
    }

    // Tier names
    string[6] public tierNames = [
        "Insider Trader",
        "Unemployed Base Bro",
        "Serial Butt Sniffer",
        "Thinks He's Early",
        "Part-Time Amazon Delivery Guy",
        "Chillhouse Staker"
    ];

    // Tier colors (hex without #)
    string[6] public tierColors = [
        "FFD700",
        "C0C0C0",
        "CD7F32",
        "4A90D9",
        "6B7280",
        "9CA3AF"
    ];

    // Tier emojis (unicode)
    string[6] public tierEmojis = [
        unicode"👑",
        unicode"🏠",
        unicode"👃",
        unicode"🤔",
        unicode"📦",
        unicode"🧘"
    ];

    uint256 public totalMinted;
    uint256 public mintPrice = 0.001 ether;

    mapping(uint256 => BadgeData) public badges;
    mapping(address => bool) public hasMinted;

    event BadgeMinted(
        address indexed wallet,
        uint256 indexed tokenId,
        uint256 walletOrder,
        uint8 tierIndex
    );

    error AlreadyMinted();
    error InsufficientPayment();
    error TransferNotAllowed();
    error InvalidTier();

    constructor() ERC721("How Early on Base?", "EARLYBASE") Ownable(msg.sender) {}

    /**
     * @notice Mint a badge NFT
     * @param walletOrder The wallet's order on Base
     * @param percentile The percentile (in basis points, e.g., 9540 = 95.40%)
     * @param tierIndex The tier index (0-5)
     * @param firstTxTimestamp The timestamp of the wallet's first Base transaction
     */
    function mint(
        uint256 walletOrder,
        uint256 percentile,
        uint8 tierIndex,
        uint256 firstTxTimestamp
    ) external payable returns (uint256) {
        if (hasMinted[msg.sender]) revert AlreadyMinted();
        if (msg.value < mintPrice) revert InsufficientPayment();
        if (tierIndex >= 6) revert InvalidTier();

        totalMinted++;
        uint256 tokenId = totalMinted;

        badges[tokenId] = BadgeData({
            walletOrder: walletOrder,
            percentile: percentile,
            tierIndex: tierIndex,
            firstTxTimestamp: firstTxTimestamp,
            mintTimestamp: block.timestamp
        });

        hasMinted[msg.sender] = true;
        _safeMint(msg.sender, tokenId);

        emit BadgeMinted(msg.sender, tokenId, walletOrder, tierIndex);

        return tokenId;
    }

    /**
     * @notice Generate on-chain SVG for the badge
     */
    function generateSVG(uint256 tokenId) public view returns (string memory) {
        BadgeData memory badge = badges[tokenId];
        string memory tierName = tierNames[badge.tierIndex];
        string memory tierColor = tierColors[badge.tierIndex];
        string memory tierEmoji = tierEmojis[badge.tierIndex];

        return string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" style="background:#0A0B0D">',
                '<defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">',
                '<stop offset="0%" style="stop-color:#', tierColor, ';stop-opacity:0.3"/>',
                '<stop offset="100%" style="stop-color:#', tierColor, ';stop-opacity:0.1"/>',
                '</linearGradient></defs>',
                '<rect width="400" height="500" fill="url(#g)" rx="20"/>',
                '<rect x="10" y="10" width="380" height="480" fill="none" stroke="#', tierColor, '" stroke-width="2" rx="15" opacity="0.5"/>',
                '<text x="200" y="60" text-anchor="middle" fill="#fff" font-family="Arial" font-size="18" font-weight="bold">How Early on Base?</text>',
                '<text x="200" y="140" text-anchor="middle" font-size="60">', tierEmoji, '</text>',
                '<text x="200" y="200" text-anchor="middle" fill="#', tierColor, '" font-family="Arial" font-size="20" font-weight="bold">', tierName, '</text>',
                '<text x="200" y="270" text-anchor="middle" fill="#fff" font-family="Arial" font-size="36" font-weight="bold">#', badge.walletOrder.toString(), '</text>',
                '<text x="200" y="310" text-anchor="middle" fill="#888" font-family="Arial" font-size="14">Wallet Order</text>',
                '<text x="200" y="370" text-anchor="middle" fill="#0052FF" font-family="Arial" font-size="28" font-weight="bold">', _formatPercentile(badge.percentile), '%</text>',
                '<text x="200" y="400" text-anchor="middle" fill="#888" font-family="Arial" font-size="14">Earlier than this % of wallets</text>',
                '<text x="200" y="470" text-anchor="middle" fill="#444" font-family="Arial" font-size="12">v1 | Soulbound</text>',
                '</svg>'
            )
        );
    }

    /**
     * @notice Get token URI with on-chain metadata
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        BadgeData memory badge = badges[tokenId];
        string memory svg = generateSVG(tokenId);
        string memory tierName = tierNames[badge.tierIndex];

        string memory json = string(
            abi.encodePacked(
                '{"name":"Base Early Badge #', tokenId.toString(),
                '","description":"This wallet was #', badge.walletOrder.toString(),
                ' on Base, earlier than ', _formatPercentile(badge.percentile),
                '% of all wallets. Tier: ', tierName,
                '","image":"data:image/svg+xml;base64,', Base64.encode(bytes(svg)),
                '","attributes":[',
                '{"trait_type":"Wallet Order","value":', badge.walletOrder.toString(), '},',
                '{"trait_type":"Percentile","value":"', _formatPercentile(badge.percentile), '%"},',
                '{"trait_type":"Tier","value":"', tierName, '"},',
                '{"trait_type":"First Transaction","display_type":"date","value":', badge.firstTxTimestamp.toString(), '},',
                '{"trait_type":"Version","value":"v1"},',
                '{"trait_type":"Soulbound","value":"Yes"}',
                ']}'
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
    }

    /**
     * @dev Format percentile from basis points to string with 1 decimal
     */
    function _formatPercentile(uint256 basisPoints) internal pure returns (string memory) {
        uint256 whole = basisPoints / 100;
        uint256 decimal = (basisPoints % 100) / 10;
        return string(abi.encodePacked(whole.toString(), ".", decimal.toString()));
    }

    // ============ Soulbound Implementation ============

    /**
     * @dev Override to prevent transfers (soulbound)
     */
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);

        // Allow minting (from == address(0)) but not transfers
        if (from != address(0) && to != address(0)) {
            revert TransferNotAllowed();
        }

        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Override approve to prevent approvals (soulbound)
     */
    function approve(address, uint256) public pure override {
        revert TransferNotAllowed();
    }

    /**
     * @dev Override setApprovalForAll to prevent approvals (soulbound)
     */
    function setApprovalForAll(address, bool) public pure override {
        revert TransferNotAllowed();
    }

    // ============ Admin Functions ============

    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
    }

    function withdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
}
