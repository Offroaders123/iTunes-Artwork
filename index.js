#!/usr/bin/env node

import { writeFile } from "node:fs/promises";
import { basename } from "node:path";

/**
 * Fetch album artwork from iTunes Search API.
 * @param {string} album - Album name or artist + album.
 */
async function fetchArtwork(album) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(album)}&media=music&entity=album&limit=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    /** @type {import("./iTunesSearchResult.d.ts").iTunesSearchResponse} */
    const json = /** @type {any} */ (await response.json());
    // console.log(json);

    if (json.resultCount > 0) {
      const albumData = /** @type {import("./iTunesSearchResult.d.ts").iTunesSearchResult} */ (json.results[0]);
      const highResUrl = albumData.artworkUrl100.replace("100x100bb", "1200x1200bb");
      const lowResUrl = albumData.artworkUrl100;

      console.log(`Downloading artwork for: ${albumData.collectionName}`);

      await downloadAndSaveImage(highResUrl, `./${sanitizeFilename(albumData.collectionName)}_highres.jpg`);
      await downloadAndSaveImage(lowResUrl, `./${sanitizeFilename(albumData.collectionName)}_lowres.jpg`);

      console.log("Download complete.");
    } else {
      console.log("No results found.");
    }
  } catch (error) {
    console.error("Error parsing response:", error);
  }
}

/**
 * Download an image from a URL and save it to the filesystem.
 * @param {string} url - Image URL.
 * @param {string} filepath - Path to save the file.
 */
async function downloadAndSaveImage(url, filepath) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);

    const buffer = await response.arrayBuffer();
    await writeFile(filepath, Buffer.from(buffer));
    console.log(`Saved: ${basename(filepath)}`);
  } catch (error) {
    console.error(`Error downloading ${url}:`, error);
  }
}

/**
 * Sanitize a filename by replacing invalid characters.
 * @param {string} name - Original filename.
 * @returns {string} - Sanitized filename.
 */
function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9-_]/g, "_");
}

// Example usage
const albumName = process.argv.slice(2).join(" ") || "Dark Side of the Moon"; // Allow CLI input
fetchArtwork(albumName);
