// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract AAAAuction is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    // Member Details
    struct Member {
        string name;
        address uaddress;
        string imageUrl;
    }
    // States of an item
    enum State {
        Bidding,
        ToPurchase,
        Default
    }
    // Item data
    struct Item {
        address owner;
        uint256 itemId;
        uint256 reserve;
        uint256 highestItemBidValue;
        uint256 currentPrice;
        uint bidStartTime;
    }

    struct ItemWrapper {
        Item item;
        State state;
        string tokenUrl;
    }
    // mapping of an Item with tokenId
    mapping(uint256 => Item) public itemPerId;

    // store total tokens count
    uint public tokenCount;
    uint timeToBidInSeconds = 120;
    uint timeToPurchaseInSeconds = 300;
    uint discountAmount = 1;
    uint depreciationTime = 120;
    // store members who bid on item
    mapping(uint256 => mapping(address => uint)) bidPerItem;
    // fetch owner details based on address
    mapping(address => Member) public memberInfo;
    // store total members count
    uint public memberCount;
    // Auction Fees
    uint8 auctionFeePercent = 2;
    // Auctioneer
    address payable public auctioneer;

    event Minted(uint256 tokenId);
    event MemberAdded(string memberName, address uaddress);
    event BuySuccess(uint256 tokenId, address to);
    event AuctionSuccess(uint256 tokenId, address from);

    constructor() ERC721("AAA Auction", "AAA") {
        auctioneer = payable(msg.sender);
    }

    modifier onlyAuctioneer() {
        require(msg.sender == auctioneer, "Not Authorized to make this call");
        _;
    }

    modifier onlyMember() {
        require(
            memberInfo[msg.sender].uaddress == msg.sender,
            "Only Members can make this call"
        );
        _;
    }

    function getAllItems(uint256 currentTimestamp)
        public
        view
        returns (ItemWrapper[] memory items)
    {
        items = new ItemWrapper[](tokenCount);
        for (uint8 tokenId = 0; tokenId < tokenCount; tokenId++) {
            string memory tokenUrl = tokenURI(tokenId);
            ItemWrapper memory item = ItemWrapper(
                itemPerId[tokenId],
                getBidState(tokenId, currentTimestamp),
                tokenUrl
            );
            items[tokenId] = item;
        }
        return items;
    }

    function getBidState(uint256 tokenId, uint256 currentTimestamp)
        public
        view
        returns (State)
    {
        Item memory item = itemPerId[tokenId];
        if (
            (uint256(item.bidStartTime) < currentTimestamp) &&
            (currentTimestamp <=
                uint256(item.bidStartTime + timeToBidInSeconds))
        ) {
            return State.Bidding;
        } else if (
            (uint256(item.bidStartTime + timeToBidInSeconds) <
                currentTimestamp) &&
            (currentTimestamp <=
                uint256(
                    item.bidStartTime +
                        timeToBidInSeconds +
                        timeToPurchaseInSeconds
                ))
        ) {
            return State.ToPurchase;
        } else {
            return State.Default;
        }
    }

    function safeMint(string memory uri) public onlyMember {
        address to = msg.sender;
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        Item memory newItem = Item(to, tokenId, 0, 0, 0, 0);
        itemPerId[tokenId] = newItem;
        tokenCount++;
        emit Minted(tokenId);
    }

    function addMember(string memory memberName, string memory memberImage)
        public
    {
        address memberAddress = msg.sender;
        require(memberAddress != address(0), "Not a valid Address");
        require(
            memberInfo[memberAddress].uaddress == address(0),
            "Member already exists"
        );
        memberInfo[memberAddress] = Member(
            memberName,
            memberAddress,
            memberImage
        );
        memberCount++;
        emit MemberAdded(memberName, memberAddress);
    }

    function bid(uint256 tokenId, uint256 bidValue) public onlyMember {
        address from = msg.sender;
        require(ERC721.ownerOf(tokenId) != address(0), "No such token exists");
        require(
            getBidState(tokenId, block.timestamp) == State.Bidding,
            "Not available for bidding"
        );
        bidPerItem[tokenId][from] = block.timestamp;
        if (itemPerId[tokenId].highestItemBidValue < bidValue) {
            Item storage curItem = itemPerId[tokenId];
            curItem.highestItemBidValue = bidValue;
        }
    }

    function getPrice(uint256 tokenId, uint256 currentTimestamp)
        public
        view
        returns (uint256 currentPrice)
    {
        require(
            getBidState(tokenId, currentTimestamp) == State.ToPurchase,
            "Price cannot be disclosed right now"
        );
        currentPrice =
            itemPerId[tokenId].highestItemBidValue +
            ((itemPerId[tokenId].highestItemBidValue / 100) *
                (auctionFeePercent));

        currentPrice =
            currentPrice -
            (((currentPrice * discountAmount) / 100) *
                ((currentTimestamp -
                    uint256(
                        itemPerId[tokenId].bidStartTime + timeToBidInSeconds
                    )) / depreciationTime));
        return currentPrice;
    }

    function buy(address to, uint256 tokenId) public payable onlyMember {
        uint buyerBidTime = bidPerItem[tokenId][to];
        Item memory item = itemPerId[tokenId];
        require(ERC721.ownerOf(tokenId) != address(0), "No such token exists");
        require(
            (uint256(item.bidStartTime) < buyerBidTime) &&
                (buyerBidTime <=
                    uint256(item.bidStartTime + timeToBidInSeconds)),
            "Did not bid for the item"
        );
        require(
            getBidState(tokenId, block.timestamp) == State.ToPurchase,
            "Cant purchase when not in buy state"
        );
        uint256 currentPrice = getPrice(tokenId, block.timestamp);
        require(
            msg.value >= currentPrice,
            "Value should be greater than or equal to current token price"
        );
        if (msg.value < itemPerId[tokenId].reserve) {
            Item storage curItemToReset = itemPerId[tokenId];
            curItemToReset.highestItemBidValue = 0;
            curItemToReset.reserve = 0;
            curItemToReset.bidStartTime = 0;
            revert("Owner does not want to sell below a base price");
        }
        uint256 amount = msg.value;
        uint256 auctionFees = amount * (auctionFeePercent / 100);
        uint256 amountToOwner = amount - auctionFees;
        address owner = ERC721.ownerOf(tokenId);
        (bool success, ) = owner.call{value: amountToOwner}("");
        require(success, "Payment failed");
        _safeTransfer(owner, to, tokenId, "");
        Item storage curItem = itemPerId[tokenId];
        curItem.owner = to;
        curItem.highestItemBidValue = 0;
        curItem.currentPrice = amount;
        curItem.reserve = 0;
        curItem.bidStartTime = 0;
        emit BuySuccess(tokenId, to);
    }

    function sell(uint tokenId, uint256 basePrice) public onlyMember {
        address tokenOwner = ERC721.ownerOf(tokenId);
        require(tokenOwner != address(0), "No such token exists");
        require(tokenOwner == msg.sender, "Only owner can sell");
        require(
            getBidState(tokenId, block.timestamp) == State.Default,
            "Can't Sell when already in auction"
        );
        Item storage curItem = itemPerId[tokenId];
        curItem.highestItemBidValue = 0;
        curItem.currentPrice = 0;
        curItem.reserve = basePrice;
        curItem.bidStartTime = uint256(block.timestamp);
        emit AuctionSuccess(tokenId, tokenOwner);
    }

    function extractAuctionFess() public onlyAuctioneer {
        (bool success, ) = auctioneer.call{value: address(this).balance}("");
        require(success, "Payment failed");
    }

    function setAuctioneer(address payable to) public onlyAuctioneer {
        auctioneer = to;
    }

    function setAuctionFees(uint8 percent) public onlyAuctioneer {
        auctionFeePercent = percent;
    }

    function setTimeToBidInSeconds(uint bidTime) public onlyAuctioneer {
        timeToBidInSeconds = bidTime;
    }

    function setDiscountRate(uint discountRate) public onlyAuctioneer {
        discountAmount = discountRate;
    }

    function setDepreciationTime(uint to) public onlyAuctioneer {
        depreciationTime = to;
    }

    function setTimeToPurchase(uint to) public onlyAuctioneer {
        require(msg.sender == auctioneer, "Not Authorized to make this call");
        timeToPurchaseInSeconds = to;
    }

    // The following functions are overrides required by Solidity.
    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}
