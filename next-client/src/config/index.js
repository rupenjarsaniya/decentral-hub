const Config = {
  get MONGODB_URI() {
    return process.env.MONGODB_URL;
  },
  get JWT_SECRET_KEY() {
    return process.env.JWT_SECRET_KEY;
  },
  get RPC_URL() {
    return process.env.RPC_URL;
  },
  get TOKENFACTOY_ADDRESS() {
    process.env.TOKENFACTOY_ADDRESS;
  },
  get MEMETOKEN_ADDRESS() {
    process.env.MEMETOKEN_ADDRESS;
  },
  get IDOFACTORY_ADDRESS() {
    process.env.IDOFACTORY_ADDRESS;
  },
  get NODE_ENV() {
    return process.env.NODE_ENV;
  },
  get PINATA_API_SECRET() {
    return process.env.NEXT_PUBLIC_PINATA_API_SECRET;
  },
  get PINATA_API_KEY() {
    return process.env.NEXT_PUBLIC_PINATA_API_KEY;
  },
};

export default Config;
