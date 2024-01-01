import { User } from "@/src/db/models";
import dbConnect from "@/src/db/utils/db-connect";
import Config from "@/src/config";
import { getAuthTokenInfo } from "@/src/utils/server/auth";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

const POST = async (req, res) => {
  try {
    await dbConnect();
    const body = req.body;
    const isUserExist = await User.findOne({ address: body.address });

    let user;

    if (!isUserExist) {
      user = await User.create(body);
    } else {
      user = isUserExist;
    }

    const TOKEN_LIFE = 60 * 60 * 24 * 7;
    const expiredOn = Date.now() + TOKEN_LIFE * 1000;
    const authInfo = {
      _id: user._id.toJSON(),
      address: user.address,
      issuedOn: Date.now(),
      expiredOn,
    };
    const token = jwt.sign(JSON.stringify(authInfo), Config.JWT_SECRET_KEY);

    res.setHeader(
      "Set-Cookie",
      `token=${token}; Path=/; maxAge: ${TOKEN_LIFE}; HttpOnly`
    );

    return res.json(
      {
        status: 200,
        message: "Login Successfully",
        data: user,
        token,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(error);
    return res.json(
      {
        status: 500,
        message: "Something went wrong, try after few seconds ",
        data: error.message,
      },
      {
        status: 500,
      }
    );
  }
};

const GET = async (req, res) => {
  try {
    await dbConnect();
    const authInfo = getAuthTokenInfo(req);
    const user = await User.findById(new Types.ObjectId(authInfo._id));

    return res.json(
      {
        status: 200,
        message: "User found",
        data: user ? user : {},
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(error);
    return res.json(
      {
        status: 500,
        message: "Something went wrong, try after few seconds ",
        data: error.message,
      },
      {
        status: 500,
      }
    );
  }
};

const PUT = async (req, res) => {
  try {
    const authInfo = getAuthTokenInfo(req);
    const body = req.body;
    const user = await User.findById(new Types.ObjectId(authInfo._id));

    if (!user) {
      return res.json(
        {
          status: 200,
          message: "User not found",
          data: {},
        },
        {
          status: 200,
        }
      );
    }

    await User.findOneAndUpdate({ _id: user._id }, body);

    const updatedUser = await User.findById(new Types.ObjectId(authInfo._id));

    return res.json(
      {
        status: 200,
        message: "User updated Successfully",
        data: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    return res.json(
      {
        status: 500,
        message: "Something went wrong, try after few seconds ",
        data: error.message,
      },
      { status: 500 }
    );
  }
};

export default async function handler(req, res) {
  switch (req.method) {
    case "POST":
      return await POST(req, res);
    case "GET":
      return await GET(req, res);
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
