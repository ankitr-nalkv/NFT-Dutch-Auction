import { FormEvent, useEffect, useState } from "react";
import "./Layout.scss";
import { Link, Outlet } from "react-router-dom";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import { connectWallet, createMember, getMember } from "../service/contract";
import { ethers } from "ethers";
import { setCurrentUser } from "../service/user";
// import abi from "../../abi.json";

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

function Layout() {
  const [address, setAddress] = useState("");
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  // const contractAddress = "0xF43cd13CF9b8D593d9a7e0FD5CF6BEF11b30d63F";

  async function connectToWallet() {
    const member = await getMember();
    const isValidMember = ethers.constants.AddressZero !== member.uaddress;
    console.log(isValidMember);
    if (!isValidMember) {
      handleOpen();
    } else {
      setAddress(member.uaddress);
    }
  }

  async function createNewMember(e: FormEvent) {
    e.preventDefault();
    const formData = Object.fromEntries(
      new FormData(e.target as any).entries()
    );
    const { memberName, memberUrl } = formData;

    await createMember(memberName as string, memberUrl as string);
    // setAddress(member.uaddress);
  }

  useEffect(() => {
    connectToWallet();
  }, []);

  return (
    <>
      <header>
        <Link to="/">
          <h3 className="header-title">AAA Auction</h3>
        </Link>
        <nav>
          <ul>
            {address ? (
              <Link to="portfolio">
                <button>{address}</button>
              </Link>
            ) : (
              <button onClick={(e) => connectToWallet()}>
                Connect your Wallet{" "}
              </button>
            )}
          </ul>
        </nav>
      </header>
      <main>
        <Outlet></Outlet>
      </main>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h3">
            <strong>Sign Up</strong>
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            <form onSubmit={(e) => createNewMember(e)}>
              <div className="form-field">
                <label htmlFor="memberName">Name</label>
                <input type="text" name="memberName" id="memberName" />
              </div>
              <div className="form-field">
                <label htmlFor="memberUrl">ImageUrl</label>
                <input type="text" name="memberUrl" id="memberUrl" />
              </div>
              <input type="submit" value="Join" />
            </form>
          </Typography>
        </Box>
      </Modal>
    </>
  );
}

export default Layout;
