import SiteConfig from "../models/SiteConfig.js";

// @route  GET /api/config
// @access Public — used by the storefront to show the banner and category filters
export const getSiteConfig = async (req, res, next) => {
  try {
    const config = await SiteConfig.getSingleton();
    res.json(config);
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/config
// @body   { banner?, categories? }
// @access Private/Admin
export const updateSiteConfig = async (req, res, next) => {
  try {
    const { banner, categories } = req.body;
    const config = await SiteConfig.getSingleton();

    if (banner !== undefined) config.banner = banner;
    if (categories !== undefined) config.categories = categories;

    const updated = await config.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};