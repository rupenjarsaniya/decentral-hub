export default class NetworkService {
  static BASE_URL = `/api`;

  get = async (url) => {
    try {
      const res = await fetch(`${NetworkService.BASE_URL}${url}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const resJson = await res.json();
        return resJson;
      } else {
        throw new Error(res.statusText);
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  post = async (url, payload) => {
    try {
      const res = await fetch(`${NetworkService.BASE_URL}${url}`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
      const resJson = await res.json();

      return resJson;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  put = async (url, payload) => {
    try {
      const res = await fetch(`${NetworkService.BASE_URL}${url}`, {
        method: "PUT",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
      const resJson = await res.json();

      return resJson;
    } catch (error) {
      console.log(error);
      return error;
    }
  };
}
