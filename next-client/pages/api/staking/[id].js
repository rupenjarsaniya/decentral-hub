import Staking from "@/src/db/models/staking.model";
import dbConnect from "@/src/db/utils/db-connect";

export const PUT = async (req, res) => {
  try {
    const { id } = req.query;
    await dbConnect();
    const body = req.body;

    const stake = await Staking.findOneAndUpdate(
      { _id: id },
      { $set: body },
      { new: true }
    );

    if (!stake) {
      return res.status(404).json({
        status: 404,
        message: "Stake not found",
        data: {},
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Stake updated",
      data: stake,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Something went wrong, try after few seconds",
      data: error.message,
    });
  }
};

export default async function handler(req, res) {
  switch (req.method) {
    case "PUT":
      return await PUT(req, res);
    default:
      return res.status(405).json({
        status: 405,
        message: "Method not allowed",
        data: {},
      });
  }
}
