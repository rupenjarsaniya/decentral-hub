import { Memetoken } from "@/src/db/models";
import dbConnect from "@/src/db/utils/db-connect";

export const PUT = async (req, res) => {
  try {
    const { id } = req.query;
    await dbConnect();
    const body = req.body;

    const memetoken = await Memetoken.findOneAndUpdate({ _id: id }, body, {
      new: true,
    });

    if (!memetoken) {
      return res.status(404).json({
        status: 404,
        message: "Token not found",
        data: {},
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Meme token updated",
      data: memetoken,
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
    const { id } = req.query;
    await dbConnect();
    const memetoken = await Memetoken.findOne({
      _id: id,
    });

    if (!memetoken) {
      return res.status(404).json({
        status: 404,
        message: "Token not found",
        data: {},
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Meme token found",
      data: memetoken,
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
    case "PUT":
      return await PUT(req, res);
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
