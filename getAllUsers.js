async function fetchEndPoint(token, poolYear, campusId, page) {
  try {
    const API_END_POINT =
      `https://api.intra.42.fr/v2/cursus_users?filter[campus_id]=16&filter[active]=true&page[size]=300&sort=-level&page=${page}`;

    const response = await fetch(API_END_POINT, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Error");

    const data = await response.json();

    return data;
  } catch (error) {
    throw new Error("Error");
  }
}

async function getAllUsers(campusId, poolYear) {
  await isLoggedIn();
  const token = (await chrome.storage.local.get(["access_token"]))
    .access_token;
  const data = [];

  let page = 0;
  while (true) {
    try {
      console.log("page = ", page);
      const res = await fetchEndPoint(token, poolYear, campusId, page);
      if (res && res.length > 0) page++;
      if (res && res.length === 0) break;
      data.push(...res.filter((r) => r["grade"] === "Cadet"));
    } catch (error) {
      return [];
    }
  }

  console.log(data);

  return data;
}
