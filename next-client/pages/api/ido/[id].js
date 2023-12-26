import Ido from "@/src/db/models/ido.model";
import dbConnect from "@/src/db/utils/db-connect";

export const GET = async (req, res) => {
  try {
    const { id } = req.query;
    await dbConnect();

    if (id === "0x") {
      const ido = await Ido.find();

      return res.status(200).json({
        status: 200,
        message: "Ido found",
        data: ido.length ? ido : {},
      });
    }

    const ido = await Ido.findOne({ _id: id });

    if (!ido) {
      return res.status(404).json({
        status: 404,
        message: "Ido not found",
        data: {},
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

export const PUT = async (req, res) => {
  try {
    const { id } = req.query;
    await dbConnect();
    const body = req.body;

    const ido = await Ido.findOneAndUpdate({ _id: id }, body, {
      new: true,
    });

    if (!ido) {
      return res.status(404).json({
        status: 404,
        message: "Ido not found",
        data: {},
      });
    }

    return res.json({
      status: 200,
      message: "Ido updated",
      data: ido,
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
