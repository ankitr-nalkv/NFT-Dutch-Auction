import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import React, { FormEvent, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import {
  extractAuctionFess,
  getAuctioneer,
  getMember,
  getOwnedNfts,
  mintNFT,
  sellNft,
  setAuctioneer,
  setAuctionFees,
  setDepreciationTime,
  setDiscountRate,
  setTimeToBidInSeconds,
  setTimeToPurchase,
} from "../service/contract";
import { createNFT, fetchNFT } from "../service/createNFT";
import { getCurrentUser } from "../service/user";
import "./portfolio.scss";
import ListProperty from "./property/property";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const Portfolio = () => {
  const [open, setOpen] = useState(false);
  const [portfolioData, setPortfolioData] = useState<
    Partial<{
      name: string;
      address: string;
      imageUrl: string;
    }>
  >();
  const [ownedItems, setOwnedItems] = useState([]);
  const [isAuctioneer, setIsAuctioneer] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    getMember().then((data) => {
      setPortfolioData({
        name: data.name,
        address: data.uaddress,
        imageUrl: data.imageUrl,
      });
      getAuctioneer().then((auctioneerAddress) => {
        const isAuctioneer = auctioneerAddress === data.uaddress;
        setIsAuctioneer(isAuctioneer);
      });
      getOwnedNfts().then((data) => {
        console.log(data);
        setOwnedItems(data);
      });
    });
  }, []);

  const tableHeaders = ["IMAGE", "NAME", "DESCRIPTION", "ACTIONS"];
  const tableData = [
    {
      image: "ss",
      name: "assa",
      description: "asasa",
      owner: "aasasa",
    },
  ];

  async function sellItem(e: FormEvent, itemId) {
    e.preventDefault();
    const formData = Object.fromEntries(
      new FormData(e.target as any).entries()
    );
    const { basePrice } = formData;
    await sellNft(basePrice, itemId);
  }

  async function createNewNft(e: FormEvent) {
    e.preventDefault();
    const formData = Object.fromEntries(
      new FormData(e.target as any).entries()
    );
    const { itemName, itemDescription, itemFile } = formData;

    const { json_cid, jsonIPFS_url, jsonFileName } = await createNFT(
      [itemFile] as any,
      itemName as string,
      itemDescription as string
    );
    // const cid = "bafybeid2yu7fl3q3dgwxkrv37fi3ty52fpbcgvqraq4g5sjqzhgzdpi4x4";
    // const jsonFileName = "maneki2.json";
    // await fetchNFT(cid, jsonFileName);
    const ipfsUrl = `ipfs://${json_cid}/${jsonFileName}`;
    await mintNFT(ipfsUrl);
    handleClose();
  }

  async function performAction(e, actionFn) {
    e.preventDefault();
    const formData = Object.fromEntries(
      new FormData(e.target as any).entries()
    );
    const { newAddress, bidSec, rate, fees, depTime, purchaseTime } = formData;
    if (newAddress) await actionFn(newAddress);
    else if (bidSec) await actionFn(bidSec);
    else if (rate) await actionFn(rate);
    else if (fees) await actionFn(fees);
    else if (depTime) await actionFn(depTime);
    else if (purchaseTime) await actionFn(purchaseTime);
    else await actionFn();
  }

  return (
    <section className="portfolio-page">
      <div className="portfolio-container">
        <div className="image-container">
          <img
            src={portfolioData?.imageUrl}
            alt=""
            loading="lazy"
            height="auto"
            width={400}
          />
        </div>
        <div className="details-container">
          <h3>Details</h3>
          <div>
            <span className="details-label"> Name:</span> {portfolioData?.name}
          </div>
          <div>
            <span className="details-label"> Address:</span>{" "}
            {portfolioData?.address}
          </div>
          {isAuctioneer && (
            <div>
              <form
                className="form-field auction-actions"
                onSubmit={(e) => performAction(e, setAuctioneer)}
              >
                <input
                  type="text"
                  name="newAddress"
                  id="newAddress"
                  placeholder="Address"
                />
                <button>Set New Auctioneer</button>
              </form>
              <form
                className="form-field auction-actions"
                onSubmit={(e) => performAction(e, setTimeToBidInSeconds)}
              >
                <input
                  type="text"
                  name="bidSec"
                  id="bidSec"
                  placeholder="Time in sec"
                />
                <button>Set Bid Time</button>
              </form>
              <form
                className="form-field auction-actions"
                onSubmit={(e) => performAction(e, setDiscountRate)}
              >
                <input type="text" name="rate" id="rate" placeholder="rate" />
                <button>Set Decreasing rate of Buy Items</button>
              </form>
              <form
                className="form-field auction-actions"
                onSubmit={(e) => performAction(e, setAuctionFees)}
              >
                <input type="text" name="fees" id="fees" placeholder="Fees" />
                <button>Set Auction Fees</button>
              </form>
              <form
                className="form-field auction-actions"
                onSubmit={(e) => performAction(e, setDepreciationTime)}
              >
                <input
                  type="text"
                  name="depTime"
                  id="depTime"
                  placeholder="depreciation Time during purchase"
                />
                <button>Set Depreciation Time</button>
              </form>
              <form
                className="form-field auction-actions"
                onSubmit={(e) => performAction(e, setTimeToPurchase)}
              >
                <input
                  type="text"
                  name="purchaseTime"
                  id="purchaseTime"
                  placeholder="Time in sec"
                />
                <button>Set Time Limit To Purchase</button>
              </form>
              <form
                className="form-field auction-actions"
                onSubmit={(e) => performAction(e, extractAuctionFess)}
              >
                <button>Extract Auction Fees</button>
              </form>
            </div>
          )}
        </div>
      </div>
      <div className="owned-container">
        <h3>My Collection</h3>
        {ownedItems.length ? (
          <table className="auction-table">
            <thead>
              <tr className="row">
                {tableHeaders.map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ownedItems.map((row, i) => (
                <ListProperty
                  sellItem={sellItem}
                  row={row}
                  ownerView={true}
                  key={i}
                ></ListProperty>
              ))}
            </tbody>
          </table>
        ) : (
          ""
        )}
      </div>
      <button onClick={(e) => handleOpen()}>Add NFT</button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h3">
            <strong>Add New NFT</strong>
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            <form onSubmit={(e) => createNewNft(e)}>
              <div className="form-field">
                <label htmlFor="itemName">Name</label>
                <input type="text" name="itemName" id="itemName" />
              </div>
              <div className="form-field">
                <label htmlFor="itemDescription">Description</label>
                <input
                  type="text"
                  name="itemDescription"
                  id="itemDescription"
                />
              </div>
              <div className="form-field">
                <label htmlFor="itemFile">ImageUrl</label>
                <input type="file" name="itemFile" id="itemFile" />
              </div>
              <input type="submit" value="Create" />
            </form>
          </Typography>
        </Box>
      </Modal>
    </section>
  );
};

export default Portfolio;
