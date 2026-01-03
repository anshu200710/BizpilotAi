// controllers/searchController.js
import fetch from "node-fetch";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const searchBusiness = async (req, res) => {
  try {
    const { business, city, page = 1 } = req.body;

    if (!business || !city) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    console.log(`🔍 Searching: ${business} in ${city} (page ${page})`);

    // 1️⃣ Fetch Geocode
    const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      city
    )}&key=${process.env.GOOGLE_API_KEY}`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.results.length)
      return res.json({ success: true, data: [], message: "Invalid city" });

    const location = geoData.results[0].geometry.location;
    const lat = location.lat + (page - 1) * 0.05;
    const lng = location.lng + (page - 1) * 0.05;

    let allPlaces = [];
    let nextPageToken = null;
    let fetchCount = 0;

    // 2️⃣ Fetch up to 60 results
    do {
      const apiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        business
      )}&location=${lat},${lng}&radius=5000&key=${process.env.GOOGLE_API_KEY}${
        nextPageToken ? `&pagetoken=${nextPageToken}` : ""
      }`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.results) {
        for (const p of data.results) {
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${p.place_id}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total&key=${process.env.GOOGLE_API_KEY}`;
          const detailsRes = await fetch(detailsUrl);
          const detailsData = await detailsRes.json();
          const d = detailsData.result;

          allPlaces.push({
            name: d?.name || "N/A",
            address: d?.formatted_address || "N/A",
            phone: d?.formatted_phone_number || "N/A",
            website: d?.website || "N/A",
            rating: d?.rating || "N/A",
            total_ratings: d?.user_ratings_total || "N/A",
          });
        }
      }

      nextPageToken = data.next_page_token;
      fetchCount++;

      if (nextPageToken && fetchCount < 3) {
        await delay(2000);
      }
    } while (nextPageToken && fetchCount < 3);

    console.log(`✅ Found ${allPlaces.length} places on page ${page}`);

    // ❌ Removed Google Sheets append section completely

    res.json({ success: true, data: allPlaces });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};