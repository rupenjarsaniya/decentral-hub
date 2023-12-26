import dbConnect from "@/src/db/utils/db-connect";
import { getAuthTokenInfo } from "@/src/utils/server/auth";
import { Stake, Staking } from "@/src/db/models";

export const POST = async (req, res) => {
  try {
    await dbConnect();
    const authInfo = getAuthTokenInfo(req);
    const body = req.body;

    const isExist = await Staking.findOne({
      user: authInfo._id,
      stake: body.stake.toLowerCase(),
    });

    if (!isExist) {
      await Stake.findOneAndUpdate(
        { _id: body.stake.toLowerCase() },
        { $inc: { total_stakers: 1 } },
        { new: true }
      );
    }

    body.stake = body.stake.toLowerCase();
    body.user = authInfo._id;

    const staking = await Staking.create(body);

    await Stake.findOneAndUpdate(
      { _id: body.stake.toLowerCase() },
      { $inc: { staked_token: body.amount } },
      { new: true }
    );

    return res.status(200).json({
      status: 200,
      message: "Staking of token created",
      data: staking ? staking : {},
    });
  } catch (error) {
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
    const stake = await Staking.find({ user: authInfo._id });

    return res.status(200).json({
      status: 200,
      message: "Staking of token fetched",
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
