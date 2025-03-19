#!/usr/bin/env node

import { get } from "node:https";

/**
 * Fetch album artwork from iTunes Search API.
 * @param {string} album - Album name or artist + album.
 */
function fetchArtwork(album) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(album)}&media=music&entity=album&limit=1`;

  get(url, (res) => {
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      try {
        const json = JSON.parse(data);
        if (json.resultCount > 0) {
          const artworkUrl = json.results[0].artworkUrl100.replace("100x100bb", "1200x1200bb"); // Get high-res version
          console.log(`Artwork URL: ${artworkUrl}`);
        } else {
          console.log("No results found.");
        }
      } catch (error) {
        console.error("Error parsing response:", error);
      }
    });

  }).on("error", (err) => {
    console.error("Request failed:", err);
  });
}

// Example usage
const albumName = process.argv.slice(2).join(" ") || "Dark Side of the Moon"; // Allow CLI input
fetchArtwork(albumName);
