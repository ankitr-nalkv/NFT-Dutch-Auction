// On file upload (click the upload button)
// onFileUpload = async () => {

import { Web3Storage } from "web3.storage";

const client = new Web3Storage({
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDc5ZDdGQzE2MmZmMTA2NEMwYThBMEZjMEQ3QTVkNmRiMmY1Njc1NDYiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NzY5MDYyNzkxNzQsIm5hbWUiOiJUZXN0In0.q7Da6xOy8E06r2hDLxbVO51He_9KzQjRbVPbRxESxsM",
});

export async function createNFT(
  image: FileList,
  name: string,
  description: string
) {
  console.log("SELECTED FILE :", image);

  const image_name = image[0].name;
  const jsonFileName = name + ".json";

  console.log("Image name : ", image_name);

  const image_cid = await client.put(image);
  console.log("image CID : ", image_cid);

  const imageIPFS_url = `https://ipfs.io/ipfs/${image_cid}/${image_name}`;

  const obj = {
    name,
    description,
    image: imageIPFS_url,
  };
  const blob = new Blob([JSON.stringify(obj)], { type: "application/json" });

  const files = [
    new File(["contents-of-file-1"], "plain-utf8.txt"),
    new File([blob], jsonFileName),
  ];
  const json_cid = await client.put(files);
  const jsonIPFS_url = `ipfs://${json_cid}/${jsonFileName}`; //used for minting NFT

  console.log("Json File Name : ", jsonIPFS_url);
  return { json_cid, jsonIPFS_url, jsonFileName };
  // json_cid: bafybeid2yu7fl3q3dgwxkrv37fi3ty52fpbcgvqraq4g5sjqzhgzdpi4x4
  // jsonIPFS_url: ipfs://bafybeid2yu7fl3q3dgwxkrv37fi3ty52fpbcgvqraq4g5sjqzhgzdpi4x4/maneki2.json
}

export async function fetchNFT(cid: string, jsonFileName: string) {
  const jsonUrlToFetch = `https://ipfs.io/ipfs/${cid}/${jsonFileName}`;
  const jsonData = await fetch(jsonUrlToFetch).then((data) => data.json());
  return jsonData;
}
