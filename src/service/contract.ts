import abi from "../../abi.json";
import { BigNumber, ethers } from "ethers";
import { fetchNFT } from "./createNFT";
// import { setItemState } from "../Home/Home";

const contractAddress = "0xf721be304E7B5902bF94Ae2b0B973908C5893f22";
let provider, signer: any, contract: any, memberAddress: any;

export const enum State {
  Bidding,
  ToPurchase,
  Default,
}

export async function connectWallet() {
  provider = new ethers.providers.Web3Provider((window as any).ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  memberAddress = await signer.getAddress();
  contract = new ethers.Contract(contractAddress, abi, signer);
  stoListenForEvents();
  listenForEvents();
  return { provider, signer, memberAddress, contract };
}

function listenForEvents() {
  contract.on({ topics: [] }, (a, b) => {
    console.log(a, b);
    // if (a?.event === "BuySuccess") {
    //   setItemState().setReload((val) => {
    //     return val === 1 ? 2 : 1;
    //   });
    // } else if (a?.event === "MemberAdded") {
    //   setItemState().setReload((val) => {
    //     return val === 1 ? 2 : 1;
    //   });
    // }
  });
}

function stoListenForEvents() {
  contract.off({ topics: [] }, (a, b) => {
    console.log(a, b);
  });
}

export async function getMember() {
  console.log(memberAddress);

  if (!memberAddress) {
    await connectWallet();
  }
  const memberDetails = await contract.memberInfo(memberAddress);
  return memberDetails;
}

export async function createMember(name: string, imageUrl: string) {
  return await contract.addMember(name, imageUrl);
}

export async function mintNFT(nftUrl: string) {
  await contract.safeMint(nftUrl);
}

export async function getNfts(): Promise<Array<any>> {
  if (!memberAddress) {
    await connectWallet();
  }
  const currentTimeInSec = Math.round(new Date().getTime() / 1000);
  const currentTime = BigNumber.from(currentTimeInSec);
  const items = await contract.getAllItems(currentTime);
  console.log(items);

  const discloseNFT = [],
    nftPrice = [];
  for (const item of items) {
    const { tokenUrl, item: itemData, state } = item;
    const { cid, jsonFileName } = extractCIDJson(tokenUrl);
    discloseNFT.push(fetchNFT(cid, jsonFileName));
    nftPrice.push(
      state === State.ToPurchase
        ? getNFTPrice((itemData.itemId as BigNumber).toString())
        : ""
    );
  }
  const priceArray = await Promise.all(nftPrice).catch(() => NaN);

  const formattedItems = [];
  for (let i = 0; i < items.length; i++) {
    const itemData = items[i];
    const { item, state, tokenUrl } = itemData;
    let {
      bidStartTime,
      currentPrice,
      highestItemBidValue,
      itemId,
      owner,
      reserve,
    } = item;
    bidStartTime = (bidStartTime as BigNumber).toString();
    currentPrice = (currentPrice as BigNumber).toString();
    highestItemBidValue = (highestItemBidValue as BigNumber).toString();
    itemId = (itemId as BigNumber).toString();
    reserve = (reserve as BigNumber).toString();

    const price = priceArray[i];

    formattedItems.push({
      nftData: discloseNFT[i],
      bidStartTime,
      currentPrice,
      highestItemBidValue,
      itemId,
      owner,
      reserve,
      state,
      tokenUrl,
      price,
    });
  }

  return formattedItems;
}

export async function getOwnedNfts() {
  const allItems = await getNfts();
  return allItems.filter((item) => item.owner === memberAddress);
  // .map((item) => {
  //   const { name, description, image } = item;
  //   return { image, name, description };
  // });
}

export async function getNftsToBid() {
  const allItems = await getNfts();
  return allItems.filter((item) => item.state === State.Bidding);
  // .map((item) => {
  //   const { name, description, image } = item;
  //   return { image, name, description };
  // });
}

export async function getNftsToBuy() {
  const allItems = await getNfts();
  return allItems.filter((item) => item.state === State.ToPurchase);
  // .map((item) => {
  //   const { name, description, image } = item;
  //   return { image, name, description };
  // });
}

export async function sellNft(basePrice: string, itemId) {
  const reserve = BigNumber.from(basePrice);
  const tokenId = BigNumber.from(itemId);
  await contract.sell(tokenId, reserve);
}

export async function bidNft(bidPrice: string, itemId) {
  const bidValue = BigNumber.from(bidPrice);
  const tokenId = BigNumber.from(itemId);
  await contract.bid(tokenId, bidValue);
}

export async function buyNft(itemId) {
  const itemPrice = await getNFTPrice(itemId);
  const tokenId = BigNumber.from(itemId);
  await contract.buy(memberAddress, tokenId, {
    value: itemPrice,
  });
}

export async function getNFTPrice(itemId) {
  const tokenId = BigNumber.from(itemId);
  const currentTimeInSec = Math.round(new Date().getTime() / 1000);
  const currentTime = BigNumber.from(currentTimeInSec);

  const price = await contract.getPrice(tokenId, currentTime);
  return (price as BigNumber).toString();
}

export async function getAuctioneer() {
  return await contract.auctioneer();
}

export async function setAuctioneer(address: string) {
  return await contract.setAuctioneer(address);
}

export async function extractAuctionFess() {
  return await contract.extractAuctionFess();
}

export async function setAuctionFees(fees: string) {
  const feesInBig = BigNumber.from(fees);
  return await contract.setAuctionFees(feesInBig);
}

export async function setTimeToBidInSeconds(bidTime: string) {
  const bidTimeInBig = BigNumber.from(bidTime);
  return await contract.setTimeToBidInSeconds(bidTimeInBig);
}

export async function setDiscountRate(rate: string) {
  const rateInBig = BigNumber.from(rate);
  return await contract.setDiscountRate(rateInBig);
}

export async function setDepreciationTime(time: string) {
  const timeInBig = BigNumber.from(time);
  return await contract.setDepreciationTime(timeInBig);
}

export async function setTimeToPurchase(time: string) {
  const timeInBig = BigNumber.from(time);
  return await contract.setTimeToPurchase(timeInBig);
}

function extractCIDJson(url: string) {
  const [cid, jsonFileName] = url.split("://")[1].split("/");
  return { cid, jsonFileName };
}
