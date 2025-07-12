const UPCOMING_API = 'https://vlrggapi.vercel.app/match?q=upcoming';
const LIVE_API = 'https://vlrggapi.vercel.app/match?q=live_score&num_pages=1&max_retries=3&request_delay=1&timeout=30';

// entry/start up
// checkUpcomingMatches();
// checkLiveMatches();

// check alarms
chrome.alarms.onAlarm.addListener(alarm => {
    if (alarm.name === "checkUpcoming") checkUpcomingMatches();
    if (alarm.name === "checkLive") checkLiveMatches();
});


// on startup
chrome.runtime.onStartup.addListener(() => {
    checkUpcomingMatches();
    checkLiveMatches();
});
chrome.runtime.onInstalled.addListener(() => {
    checkUpcomingMatches();
    checkLiveMatches();
});

// UPCOMING MATCHES LOGIC

function setCooldown(minutes) {
    console.log(`Setting next check in ${minutes} minutes`);
    chrome.alarms.clearAll();
    chrome.alarms.create("checkUpcoming", { delayInMinutes: minutes });
}


// check next matches
async function checkUpcomingMatches() {
    try {
        const res = await fetch(UPCOMING_API);
        const data = await res.json();
        const matches = data.data?.segments || [];  // get matches

        console.log("Raw upcoming matches:", matches);

        if (matches.length === 0) {  // if this one is used, maybe something's wrong with the API
            console.log("No upcoming matches found.");
            chrome.storage.local.set({ nextMatch: null });
            setCooldown(4 * 60);  // check again in 4 hours just in case
            return;
        }

        // get the first match
        const nextMatch = matches[0];
        const matchTime = new Date(nextMatch.unix_timestamp.replace(" ", "T") + "Z").getTime(); // ISO date string to datetime
        const now = Date.now();
        const diffMin = (matchTime - now) / 60000;  // at least 1 minute

        console.log(`[UPCOMING] ${nextMatch.team1} vs ${nextMatch.team2} in ${Math.round(diffMin)} minutes.`);

        // save to storage
        chrome.storage.local.set({ nextMatch, nextMatchInMin: diffMin });

        // cooldown based on time difference
        if (diffMin > 720) setCooldown(660);  // >12h
        else if (diffMin > 360) setCooldown(300);  // 6–12h
        else if (diffMin > 60) setCooldown(60);  // 1–6h
        else if (diffMin > 30) setCooldown(10);  // 30–60min
        else if (diffMin > 5) setCooldown(2);  // 5–30min
        else if (diffMin > 0.5) setCooldown(0.5);  // 30s–5min
        else {
            // Match should have started or already passed
            console.log("Match may be live now. Switch to live polling soon.");
            // switch to live mode
            chrome.alarms.get("checkLive", alarm => {
                if (!alarm) {
                    startLivePolling();
                }
            });
        }

    } catch (err) {
        console.error("Error fetching upcoming matches:", err);
        setCooldown(10);  // wait 10 minutes
    }
}

// LIVE MATCHES LOGIC

function startLivePolling() {
    chrome.alarms.clearAll();
    chrome.alarms.create("checkLive", { periodInMinutes: 0.5 }); // every 30s
    checkLiveMatches(); // call immediately too
}

function stopLivePolling() {
    chrome.alarms.clear("checkLive");
    checkUpcomingMatches(); // back to schedule
}

async function checkLiveMatches() {
    try {
        const res = await fetch(LIVE_API);
        const data = await res.json();
        const matches = data.data?.segments || [];

        console.log("Raw live matches:", matches);

        chrome.storage.local.set({ liveMatches: matches });

        // show badge
        const liveCount = matches.length;
        chrome.action.setBadgeText({ text: liveCount > 0 ? String(liveCount) : "" });
        chrome.action.setBadgeBackgroundColor({ color: "#FF4136" });

        if (liveCount === 0) {
            console.log("No live matches. Back to upcoming matches.");
            chrome.alarms.clear("checkLive");
            checkUpcomingMatches(); // back to schedule
        } else {
            console.log(`Live match(es): ${liveCount}`);

            chrome.alarms.get("checkLive", alarm => {
                if (!alarm) {
                    console.log("Live polling not running — starting now");
                    chrome.alarms.create("checkLive", { periodInMinutes: 0.5 });
                }
            });
        }

    } catch (err) {
        console.error("Live match fetch failed:", err);
    }
}
