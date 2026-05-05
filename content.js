console.log("✅ Content script loaded");

/* ---------------- EMAIL EXTRACTION ---------------- */
function extractEmails() {
  const emails = new Set();

  const text = document.body.innerText;
  const regex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

  (text.match(regex) || []).forEach((e) => emails.add(e));

  document.querySelectorAll("a[href^='mailto:']").forEach((a) => {
    const email = a.href.replace("mailto:", "").split("?")[0];
    if (email) emails.add(email);
  });

  return [...emails];
}

/* ---------------- STORE NAME ---------------- */
function getStoreName() {
  return (
    document.querySelector("h1")?.innerText ||
    document.querySelector("meta[property='og:site_name']")?.content ||
    document.title ||
    "Unknown"
  );
}

/* ---------------- CLEAN WEBSITE URL (FIX) ---------------- */
function cleanWebsite(url) {
  try {
    const parsed = new URL(url);

    // remove query params + hash
    parsed.search = "";
    parsed.hash = "";

    // OPTIONAL: force root domain only (remove paths)
    // https://www.stiiizy.com/pages/... → https://www.stiiizy.com/
    parsed.pathname = "/";

    return parsed.origin + "/";
  } catch (e) {
    return url;
  }
}

/* ---------------- WEBSITE DETECTION ---------------- */
function getStoreWebsite() {
  const links = [...document.querySelectorAll("a")];

  for (let el of links) {
    const text = (el.innerText || "").toLowerCase();

    if (
      text.includes("website") ||
      text.includes("visit website") ||
      text.includes("official website")
    ) {
      const href = el.href;
      if (href?.startsWith("http")) {
        return cleanWebsite(href);
      }
    }
  }

  // fallback
  return cleanWebsite(window.location.origin);
}

/* ---------------- SCRAPE ---------------- */
function scrape() {
  return {
    store_name: getStoreName(),
    website: getStoreWebsite(),
    emails: extractEmails(),
    page_url: window.location.href,
  };
}

/* ---------------- LISTENER ---------------- */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "GET_DATA") {
    sendResponse(scrape());
  }
});
