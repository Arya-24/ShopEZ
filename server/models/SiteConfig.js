import mongoose from "mongoose";

// This is a singleton — only ONE document should ever exist in this collection.
// It represents your doc's "Admin" entity: site-wide banner image + managed categories.
const siteConfigSchema = new mongoose.Schema(
  {
    banner: {
      type: String, // URL to the homepage banner image
      default: "",
    },
    categories: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Always returns the single config document, creating it with defaults if it doesn't exist yet
siteConfigSchema.statics.getSingleton = async function () {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({ banner: "", categories: [] });
  }
  return config;
};

const SiteConfig = mongoose.model("SiteConfig", siteConfigSchema);
export default SiteConfig;