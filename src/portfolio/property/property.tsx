import { useEffect, useState } from "react";

function ListProperty(props) {
  const {
    row,
    sellItem,
    bidItem,
    purchaseItem,
    ownerView,
    bidView,
    purchaseView,
  } = props;
  console.log("here");

  const [listProp, setListProp] = useState({});

  useEffect(() => {
    if (row && row.nftData)
      row.nftData.then((data) => {
        const { name, description, image } = data;
        setListProp({ name, description, image });
      });
  }, []);

  return (
    //   {Object.keys(listProp).length && (
    <tr className="row">
      <td>
        <img
          className="item-image"
          src={listProp["image"]}
          alt=""
          width={100}
          height="auto"
          loading="lazy"
        />
      </td>
      <td>{listProp["name"]}</td>
      <td>{listProp["description"]}</td>
      {!ownerView && <td>{row.owner}</td>}
      {bidView && (
        <td>
          <form onSubmit={(e) => bidItem(e, row.itemId)} className="form-field">
            <input
              type="text"
              name="bidPrice"
              id="bidPrice"
              placeholder="Bid Price"
            />
            <input type="submit" value="BID" />
          </form>
        </td>
      )}
      {purchaseView && (
        <td>
          <form
            onSubmit={(e) => purchaseItem(e, row.itemId)}
            className="form-field"
            style={{ display: "flex", alignItems: "center" }}
          >
            <span style={{ margin: "0 1rem" }}>Price: {row.price}</span>
            <input type="submit" value="BUY" />
          </form>
        </td>
      )}
      {ownerView && (
        <td>
          <form
            onSubmit={(e) => sellItem(e, row.itemId)}
            className="form-field"
          >
            <input
              type="text"
              name="basePrice"
              id="basePrice"
              placeholder="Base Price"
            />
            <input type="submit" value="SELL" />
          </form>
        </td>
      )}
    </tr>
    //   )}
  );
}

export default ListProperty;
