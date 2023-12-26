import Stake from "@/src/db/models/stake.model";
import { getAuthTokenInfo } from "@/src/utils/server/auth";
import dbConnect from "@/src/db/utils/db-connect";

export const POST = async (req, res) => {
  try {
    await dbConnect();
    const authInfo = getAuthTokenInfo(req);
    const body = req.body;

    const isStakeExist = await Stake.findOne({
      token_address: body.token_address.toLowerCase(),
    });

    if (isStakeExist) {
      return res.status(200).json({
        status: 200,
        message: "Stake of token already exist",
        data: isStakeExist,
      });
    }

    body.token_address = body.token_address.toLowerCase();
    body.stake_address = body.stake_address.toLowerCase();
    body.owner = authInfo._id;
    body.owner_address = authInfo.address;

    const stake = await Stake.create(body);

    return res.status(200).json({
      status: 200,
      message: "Stake of token created",
      data: stake ? stake : {},
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
    const stake = await Stake.find({ owner_address: authInfo.address });

    if (stake.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No stake found",
        data: [],
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Stakes found",
      data: stake ? stake : [],
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
    case "POST":
      return await POST(req, res);
    case "GET":
      return await GET(req, res);
    default:
      return res.status(405).json({
        status: 405,
        message: "Method not allowed",
        data: {},
      });
  }
}
