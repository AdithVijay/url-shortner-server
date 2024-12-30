const URL = require("../model/url");
const CustomAlias = require("../model/customAlias");

const fetchUrlAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const trimmedId = id.trim();

    const aliasData = await CustomAlias.findById(trimmedId);

    if (aliasData) {
      const refinedData = {
        longUrl: aliasData.longUrl,
        shortUrl: aliasData.alias,
        clicks: aliasData.clicks,
        uniqueUsers: aliasData.uniqueUsers,
        clicksByDate: aliasData.clicksByDate.map(entry => ({
          date: entry.date,
          clickCount: entry.clickCount,
        })),
        osType: aliasData.osType.map(os => ({
          osName: os.osName,
          uniqueClicks: os.uniqueClicks,
          uniqueUsers: os.uniqueUsers,
        })),
        deviceType: aliasData.deviceType.map(device => ({
          deviceName: device.deviceName,
          uniqueClicks: device.uniqueClicks,
          uniqueUsers: device.uniqueUsers,
        })),
      };

      return res.status(200).json(refinedData);
    }

    const urlData = await URL.findById(trimmedId);

    if (urlData) {
      const refinedData = {
        longUrl: urlData.longUrl,
        shortUrl: urlData.shortUrl,
        clicks: urlData.clicks,
        uniqueUsers: urlData.uniqueUsers,
        clicksByDate: urlData.clicksByDate.map(entry => ({
          date: entry.date,
          clickCount: entry.clickCount,
        })),
        osType: urlData.osType.map(os => ({
          osName: os.osName,
          uniqueClicks: os.uniqueClicks,
          uniqueUsers: os.uniqueUsers,
        })),
        deviceType: urlData.deviceType.map(device => ({
          deviceName: device.deviceName,
          uniqueClicks: device.uniqueClicks,
          uniqueUsers: device.uniqueUsers,
        })),
      };

      return res.status(200).json(refinedData);
    }

    return res.status(404).json({ message: "No URL or Custom Alias found for the provided ID." });
  } catch (error) {
    console.error("Error fetching URL analytics:", error);
    return res.status(500).json({ message: "Error fetching analytics." });
  }
};

//---------------------------------------------------------------------------

const fetchUserAnalytics = async (req, res) => {
  const { id } = req.params;
  console.log("User ID in analytics:", id);

  try {
    const urls = await URL.find({ user: id });
    const customAliases = await CustomAlias.find({ user: id });
    const combinedData = [...urls, ...customAliases];

    const uniqueIPs = new Set();

    combinedData.forEach((data) => {
      const seenIPs = new Set()
      data.osType.forEach((os) => {
        os.uniqueUserIPs.forEach((userIP) => {
          if (!seenIPs.has(userIP.ip)) {
            uniqueIPs.add(userIP.ip)
            seenIPs.add(userIP.ip)
          }
        })
      })

      data.deviceType.forEach((device) => {
        device.uniqueUserIPs.forEach((userIP) => {
          if (!seenIPs.has(userIP.ip)) {
            uniqueIPs.add(userIP.ip);
            seenIPs.add(userIP.ip);
          }
        });
      });
    });

    const totalUniqueUsers = uniqueIPs.size;

    const refinedData = combinedData.map((data) => ({
      longUrl: data.longUrl,
      shortUrl: data.shortUrl || data.alias, 
      clicks: data.clicks,
      uniqueUsers: data.uniqueUsers,
      clicksByDate: data.clicksByDate.map((entry) => ({
        date: entry.date,
        clickCount: entry.clickCount,
      })),
      osType: data.osType.map((os) => ({
        osName: os.osName,
        uniqueClicks: os.uniqueClicks,
        uniqueUsers: os.uniqueUsers,
      })),
      deviceType: data.deviceType.map((device) => ({
        deviceName: device.deviceName,
        uniqueClicks: device.uniqueClicks,
        uniqueUsers: device.uniqueUsers,
      })),
    }));

    return res.status(200).json({
      refinedData,
      totalUniqueUsers,
    });
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    return res.status(500).json({ error: "An error occurred while fetching analytics data." });
  }
};



module.exports = {
  fetchUrlAnalytics,
  fetchUserAnalytics
};
