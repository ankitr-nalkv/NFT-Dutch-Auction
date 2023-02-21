import React, { useEffect, useState } from "react";
import ListProperty from "../portfolio/property/property";
import {
  bidNft,
  buyNft,
  getNfts,
  getNftsToBid,
  getNftsToBuy,
  sellNft,
  State,
} from "../service/contract";
import "./Home.scss";

let setItemState;

function Home() {
  const [bidItems, setBidItems] = useState([]);
  const [buyItems, setBuyItems] = useState([]);
  const [state, setState] = useState(State.Bidding);
  const [reload, setReload] = useState(1);
  const tableHeaders = ["IMAGE", "NAME", "DESCRIPTION", "OWNER", "ACTIONS"];
  const tableData = [
    {
      image: "ss",
      name: "assa",
      description: "asasa",
      owner: "aasasa",
    },
  ];

  setItemState = () => {
    return { setReload };
  };

  async function bidItem(e, tokenId) {
    e.preventDefault();
    const formData = Object.fromEntries(
      new FormData(e.target as any).entries()
    );
    const { bidPrice } = formData;
    await bidNft(bidPrice as string, tokenId);
  }

  async function purchaseItem(e, tokenId) {
    e.preventDefault();
    await buyNft(tokenId);
  }

  useEffect(() => {
    if (state === State.Bidding) {
      getNftsToBid().then((data) => {
        setBidItems(data);
      });
    } else if (state === State.ToPurchase) {
      getNftsToBuy().then((data) => {
        setBuyItems(data);
      });
    }
  }, [state, reload]);

  return (
    <div className="home-page">
      <div className="tab-container">
        <button
          className={state === State.Bidding ? "active" : ""}
          onClick={(e) => setState(State.Bidding)}
        >
          Bid for Items
        </button>
        <button
          className={state === State.ToPurchase ? "active" : ""}
          onClick={(e) => setState(State.ToPurchase)}
        >
          Buy Items
        </button>
      </div>
      <table className="auction-table">
        <thead>
          <tr className="row">
            {tableHeaders.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {state === State.Bidding &&
            bidItems.map((row, i) => (
              <ListProperty
                bidItem={bidItem}
                row={row}
                bidView={true}
                key={i}
              ></ListProperty>
            ))}
          {state === State.ToPurchase &&
            buyItems.map((row, i) => (
              <ListProperty
                purchaseItem={purchaseItem}
                row={row}
                purchaseView={true}
                key={i}
              ></ListProperty>
            ))}
        </tbody>
      </table>
    </div>
  );
}

// export { Home, setItemState };
export default Home;
// export { setItemState, Home };
