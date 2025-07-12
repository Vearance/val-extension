// change minutes to hour-minute format
function formatCountdown(minutes) {
    const hrs = Math.floor(minutes / 60);
    const min = Math.floor(minutes % 60);
    return `${hrs}h ${min}m`;
}

// pop-up design for live matches
function renderLive(matches) {
    const liveSection = document.getElementById("liveSection");
    liveSection.innerHTML = "<h2>🔴 Live Matches</h2>";

    if (!matches || matches.length === 0) {
        liveSection.innerHTML += "<p>No live matches.</p>";
        return;
    }

    matches.forEach(match => {
        const div = document.createElement("div");
        div.className = "match live";

        // Parse helper
        const parseScore = (val) => val === "N/A" ? 0 : parseInt(val);

        const t1_ct = parseScore(match.team1_round_ct);
        const t1_t  = parseScore(match.team1_round_t);
        const t2_ct = parseScore(match.team2_round_ct);
        const t2_t  = parseScore(match.team2_round_t);

        const round_t1 = t1_ct + t1_t;
        const round_t2 = t2_ct + t2_t;

        // HTML
        div.innerHTML = `
            <div class="team-row">
                <img src="${match.team1_logo}" alt="${match.team1}" class="team-logo">
                <span class="team-name">${match.team1}</span>
                <span class="match-score">${match.score1}</span>
            </div>

            <div class="round-score">
                <span> ${round_t1} — ${round_t2} </span>
            </div>

            <div class="team-row">
                <img src="${match.team2_logo}" alt="${match.team2}" class="team-logo">
                <span class="team-name">${match.team2}</span>
                <span class="match-score">${match.score2}</span>
            </div>

            <div class="map-info">
                Map ${match.map_number}: <strong>${match.current_map}</strong>
            </div>
            <div class="series-info">
                ${match.match_event} — ${match.match_series}
            </div>
            <a href="${match.match_page}" target="_blank" class="match-link">🔗 Open Match</a>
        `;

        liveSection.appendChild(div);
    });
}


// pop-up design for upcoming matches
function renderUpcoming(match, minutes) {
    const upcomingSection = document.getElementById("upcomingSection");
    upcomingSection.innerHTML = "<h2>Next Match</h2>";

    if (!match) {
        upcomingSection.innerHTML += "<p>No upcoming match found.</p>";
        return;
    }

    const div = document.createElement("div");
    div.className = "match";
    div.innerHTML = `
        ${match.team1} vs ${match.team2}<br>
        Starts in: <span class="countdown">${formatCountdown(minutes)}</span>
    `;
    upcomingSection.appendChild(div);
}

function loadData() {
    chrome.storage.local.get(["liveMatches", "nextMatch", "nextMatchInMin"], (result) => {
        renderLive(result.liveMatches || []);
        renderUpcoming(result.nextMatch, result.nextMatchInMin);
    });
}

loadData();
