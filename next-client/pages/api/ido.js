import { Ido } from "@/src/db/models";
import dbConnect from "@/src/db/utils/db-connect";
import { getAuthTokenInfo } from "@/src/utils/server/auth";

export const POST = async (req, res) => {
  try {
    await dbConnect();
    const authInfo = getAuthTokenInfo(req);
    const body = req.body;

    const isIdoExist = await Ido.findOne({
      ido_token: body.ido_token.toLowerCase(),
    });

    if (isIdoExist) {
      return res.status(200).json({
        status: 200,
        message: "Ido already exist",
        data: isIdoExist,
      });
    }

    body.meme_token = body.meme_token.toLowerCase();
    body.ido_token = body.ido_token.toLowerCase();
    body.owner = authInfo._id;
    body.owner_address = authInfo.address;

    const ido = await Ido.create(body);

    return res.status(200).json({
      status: 200,
      message: "Ido created",
      data: ido ? ido : {},
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
    const ido = await Ido.find({ owner_address: authInfo.address });

    if (ido.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No Ido found",
        data: [],
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Ido found",
      data: ido ? ido : {},
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
