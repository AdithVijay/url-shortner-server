const User = require("../model/user");
const URL = require("../model/url");
const { nanoid } = require('nanoid');
const UAParser = require('ua-parser-js');  
const CustomAlias = require('../model/customAlias');


function extractOS(userAgent) {
  const parser = new UAParser();
  parser.setUA(userAgent);
  const os = parser.getOS();
  return os.name || 'Unknown'; 
}


function extractDevice(userAgent) {
  const parser = new UAParser();
  parser.setUA(userAgent);
  const device = parser.getDevice();


  if (device.type) {
    return device.type;
  } else {
    return 'desktop';
  }
}

// ----------------------------------------------------------------------------------------------------------------------------------

const getUrlData = async (req, res) => {
  try {
    const { id } = req.params; 
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const urls = await URL.find({ user: user._id });

    const customAliases = await CustomAlias.find({ user: user._id });

    const combinedUrls = [
      ...urls.map(url => ({
        _id: url._id,
        longUrl: url.longUrl,
        shortUrl: url.shortUrl,
        clicks: url.clicks || 0,
        createdAt: url.createdAt,
        type: "normal", 
      })),
      ...customAliases.map(alias => ({
        _id: alias._id,
        longUrl: alias.longUrl,
        shortUrl: alias.alias,
        clicks: alias.clicks,
        createdAt: alias.createdAt,
        type: "custom", 
      })),
    ];

    return res.status(200).json(combinedUrls);
  } catch (error) {
    console.log("Error fetching URL data:", error);
    return res.status(500).json({ message: "Error fetching URL data" });
  }
};

// ----------------------------------------------------------------------------------------------------------------------------------

const handleGenerateNewUrl = async (req, res) => {
  try {
    const { url, user, customAlias } = req.body;
    console.log("this is the custom alias:", customAlias);

    if (!url || !user) {
      return res.status(400).json({ message: "Bad Request: Missing URL or User data" });
    }
    
    const urlExists = await URL.findOne({ longUrl: url, user: user });
    if (urlExists) {
      return res.status(409).json({ message: "URL already exists", shortUrl: urlExists.shortUrl });
    }

    if (customAlias) {
      const aliasExists = await CustomAlias.findOne({ alias: customAlias });
      if (aliasExists) {
        return res.status(409).json({ message: "Custom alias already exists. Please choose another one." });
      }

      await CustomAlias.create({
        alias: customAlias,
        longUrl: url,
        user,
      });
      return res.status(200).json({ message: "Custom alias created successfully", shortUrl: customAlias });
    }

    const shortId = nanoid(8);

    await URL.create({
      user: user,
      longUrl: url,
      shortUrl: shortId,
    });

    return res.status(200).json({ message: "URL shortened successfully", shortUrl: shortId });
  } catch (error) {
    console.error("Error in handleGenerateNewUrl:", error);
    return res.status(500).json({ message: "Error generating new URL" });
  }
}

// ----------------------------------------------------------------------------------------------------------------------------------

const handleRedirect = async (req, res) => {
  try {
    const { shortUrl } = req.params;


    const alias = await CustomAlias.findOne({ alias: shortUrl });
    const target = alias || (await URL.findOne({ shortUrl }));

    if (!target) {
      return res.status(404).json({ message: "Short URL not found" });
    }

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    target.clicks += 1;

    const uniqueUserEntry = target.uniqueUserClicks?.find(
      entry => entry.ip === userIP && new Date(entry.date).getTime() === currentDate.getTime()
    );

    if (!uniqueUserEntry) {
      target.uniqueUsers += 1;
      target.uniqueUserClicks.push({ date: currentDate, ip: userIP });
    }

    const clickByDate = target.clicksByDate.find(
      entry => new Date(entry.date).getTime() === currentDate.getTime()
    );

    if (clickByDate) {
      clickByDate.clickCount += 1;
    } else {
      target.clicksByDate.push({ date: currentDate, clickCount: 1 });
    }

    const userAgent = req.headers['user-agent'];
    const osName = extractOS(userAgent);
    const deviceName = extractDevice(userAgent);

    const osTypeEntry = target.osType.find(entry => entry.osName === osName);
    if (osTypeEntry) {
      const osUserEntry = osTypeEntry.uniqueUserIPs?.find(
        entry => entry.ip === userIP && new Date(entry.date).getTime() === currentDate.getTime()
      );

      if (!osUserEntry) {
        osTypeEntry.uniqueClicks += 1;
        osTypeEntry.uniqueUsers += 1;
        osTypeEntry.uniqueUserIPs.push({ ip: userIP, date: currentDate });
      }
    } else {
      target.osType.push({
        osName,
        uniqueClicks: 1,
        uniqueUsers: 1,
        uniqueUserIPs: [{ ip: userIP, date: currentDate }],
      });
    }

    const deviceTypeEntry = target.deviceType.find(entry => entry.deviceName === deviceName);
    if (deviceTypeEntry) {
      const deviceUserEntry = deviceTypeEntry.uniqueUserIPs?.find(
        entry => entry.ip === userIP && new Date(entry.date).getTime() === currentDate.getTime()
      );

      if (!deviceUserEntry) {
        deviceTypeEntry.uniqueClicks += 1;
        deviceTypeEntry.uniqueUsers += 1;
        deviceTypeEntry.uniqueUserIPs.push({ ip: userIP, date: currentDate });
      }
    } else {
      target.deviceType.push({
        deviceName,
        uniqueClicks: 1,
        uniqueUsers: 1,
        uniqueUserIPs: [{ ip: userIP, date: currentDate }],
      });
    }

    await target.save();

    res.redirect(target.longUrl);
  } catch (error) {
    console.error("Error handling redirect:", error);
    res.status(500).json({ message: "Server error" });
  }
}




module.exports = {
  handleGenerateNewUrl,
  getUrlData,
  handleRedirect
};
