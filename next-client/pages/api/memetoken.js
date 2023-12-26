import { Memetoken } from "@/src/db/models";
import dbConnect from "@/src/db/utils/db-connect";

export const POST = async (req, res) => {
  try {
    await dbConnect();
    const body = req.body;

    const isTokenExist = await Memetoken.findOne({
      meme_token_address: body.meme_token_address.toLowerCase(),
    });

    if (isTokenExist) {
      return res.status(200).json({
        status: 200,
        message: "Token already exist",
        data: isTokenExist,
      });
    }

    body.meme_token_address = body.meme_token_address.toLowerCase();

    const memetoken = await Memetoken.create(body);

    return res.status(200).json({
      status: 200,
      message: "Meme token created",
      data: memetoken ? memetoken : {},
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
    const memetoken = await Memetoken.find();

    return res.status(200).json({
      status: 200,
      message: "Meme token found",
      data: memetoken ? memetoken : {},
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
