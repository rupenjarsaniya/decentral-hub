import { Token721 } from "@/src/db/models";
import dbConnect from "@/src/db/utils/db-connect";
import { getAuthTokenInfo } from "@/src/utils/server/auth";

export const POST = async (req, res) => {
  try {
    await dbConnect();
    const authInfo = getAuthTokenInfo(req);
    const body = req.body;

    body.nft_owner_id = authInfo._id;
    body.nft_owner_address = authInfo.address;

    const token = await Token721.create(body);

    return res.status(201).json({
      status: 201,
      message: "NFT minted successfully",
      data: token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong, try after few seconds ",
      data: error.message,
    });
  }
};

export const GET = async (req, res) => {
  try {
    await dbConnect();
    const authInfo = getAuthTokenInfo(req);
    const tokens = await Token721.find({
      nft_owner_address: authInfo.address,
    });

    return res.status(200).json({
      status: 200,
      message: "NFTs fetched successfully",
      data: tokens,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Something went wrong, try after few seconds ",
      data: error.message,
    });
  }
};

export default async function handler(req, res) {
  switch (req.method) {
    case "GET":
      return await GET(req, res);
    case "POST":
      return await POST(req, res);
    default:
      return res.status(405).json({
        status: 405,
        message: "Method not allowed",
        data: {},
      });
  }
}
