import { Token } from "@/src/db/models";
import dbConnect from "@/src/db/utils/db-connect";
import { getAuthTokenInfo } from "@/src/utils/server/auth";

export const POST = async (req, res) => {
  try {
    await dbConnect();
    const authInfo = getAuthTokenInfo(req);
    const body = req.body;
    const isTokenExist = await Token.findOne({
      token_address: body.token_address.toLowerCase(),
    });

    if (isTokenExist) {
      return res.status(200).json({
        status: 200,
        message: "Token already exist",
        data: isTokenExist,
      });
    }
    body.token_owner_id = authInfo._id;
    body.token_owner_address = authInfo.address;
    body.token_address = body.token_address.toLowerCase();

    const token = await Token.create(body);

    return res.status(201).json({
      status: 201,
      message: "token created/deployed successfully",
      data: token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong, try after few seconds ",
      data: error.message.message,
    });
  }
};

export const GET = async (req, res) => {
  try {
    await dbConnect();
    const authInfo = getAuthTokenInfo(req);
    const tokens = await Token.find({ token_owner_address: authInfo.address });

    return res.status(200).json({
      status: 200,
      message: "tokens fetched successfully",
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
