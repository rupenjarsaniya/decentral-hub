import config from "@/src/config";
import axios from "axios";

const key = config.PINATA_API_KEY;
const secret = config.PINATA_API_SECRET;

export const pinJSONToIPFS = async (json) => {
  const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

  return axios
    .post(url, json, {
      headers: {
        pinata_api_key: key,
        pinata_secret_api_key: secret,
      },
    })
    .then((response) => {
      return response.data.IpfsHash;
    })
    .catch((error) => {
      console.error(error);
    });
};

export const pinFileToIPFS = async (file, pinataMetadata) => {
  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";

  let data = new FormData();

  data.append("file", file);
  data.append("pinataMetadata", JSON.stringify(pinataMetadata));

  return axios
    .post(url, data, {
      headers: {
        "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
        pinata_api_key: key,
        pinata_secret_api_key: secret,
      },
    })
    .then((response) => {
      return response.data.IpfsHash;
    })
    .catch((error) => {
      console.error(error);
    });
};
