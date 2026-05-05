const storeEl = document.getElementById("store");
const websiteEl = document.getElementById("website");
const emailsEl = document.getElementById("emails");
const status = document.getElementById("status");

document.getElementById("grab").addEventListener("click", async () => {
  status.innerText = "Loading...";

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  chrome.tabs.sendMessage(tab.id, { type: "GET_DATA" }, async (data) => {
    if (!data) return;

    storeEl.value = data.store_name;
    websiteEl.value = data.website;
    emailsEl.value = data.emails.join("\n");

    try {
      const res = await fetch(
        "https://lead-scraper-zeta-eight.vercel.app/api/save",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      const result = await res.json();

      status.innerText = result.success
        ? "✅ Saved to DB"
        : "⚠️ No emails found";
    } catch (err) {
      status.innerText = "❌ Server error";
    }
  });
});

document.getElementById("copy").addEventListener("click", () => {
  navigator.clipboard.writeText(
    `STORE: ${storeEl.value}
WEBSITE: ${websiteEl.value}
EMAILS:
${emailsEl.value}`,
  );

  status.innerText = "Copied!";
});
