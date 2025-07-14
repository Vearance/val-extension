function formatCountdown(minutes) {
    const hrs = Math.floor(minutes / 60);
    const min = Math.floor(minutes % 60);
    return `${hrs}h ${min}m`;
}

function shortenName(name) {
    return name.length > 16 ? name.slice(0, 16).trim() + '…' : name;
}

function shortenNextName(name) {
    return name.length > 25 ? name.slice(0, 16).trim() + '…' : name;
}

function sum(val1, val2) {
    return (val1 === "N/A" ? 0 : parseInt(val1)) + (val2 === "N/A" ? 0 : parseInt(val2));
}

function renderLive(match) {
    const section = document.getElementById("liveMatchSection");

    if (!match) {
        section.innerHTML = `<p class="no-match-msg">No live match currently.</p>`;
        return;
    }

    const round1 = sum(match.team1_round_ct, match.team1_round_t);
    const round2 = sum(match.team2_round_ct, match.team2_round_t);

    // use fallback logo if broken image is found
    const fallbackLogo = "images/valorant.png";

    const logo1 = match.team1_logo.includes("/img/vlr/tmp/vlr.png") ? fallbackLogo : match.team1_logo;
    const logo2 = match.team2_logo.includes("/img/vlr/tmp/vlr.png") ? fallbackLogo : match.team2_logo;

    section.innerHTML = `
        <div class="live-match-header">
            <div class="match-info">
                <h2>Live Match</h2>
                <p class="match-event">${match.match_event}</p>
                <p class="match-series">${match.match_series}</p>
            </div>
            <a class="open-link" href="${match.match_page}" target="_blank">Open</a>
        </div>

        <div class="match-details">
            <div class="team-column">
                <div class="team-card">
                    <div class="team-logo-placeholder">
                        <img src="${logo1}" width="50" height="50" />
                    </div>
                    <span class="team-name" title="${match.team1}">${shortenName(match.team1)}</span>
                </div>
                <div class="series-score-value">${match.score1}</div>
            </div>

            <div class="map-score-info">
                <p class="score">
                    <span class="score-left">${round1}</span>
                    <span class="score-separator">:</span>
                    <span class="score-right">${round2}</span>
                </p>
                <p class="map">Map ${match.map_number}: ${match.current_map}</p>
            </div>

            <div class="team-column">
                <div class="team-card">
                    <div class="team-logo-placeholder">
                        <img src="${logo2}" width="50" height="50" />
                    </div>
                    <span class="team-name" title="${match.team2}">${shortenName(match.team2)}</span>
                </div>
                <div class="series-score-value">${match.score2}</div>
            </div>
        </div>
    `;
}

function renderUpcoming(match, minutes) {
    const section = document.getElementById("nextMatchSection");

    if (!match) {
        section.innerHTML = `<p>No upcoming match found.</p>`;
        return;
    }

    section.innerHTML = `
        <div class="next-match-info">
            <h3>Next Match</h3>
            <p>
            <span title="${match.team1}">${shortenNextName(match.team1)}</span> vs 
            <span title="${match.team2}">${shortenNextName(match.team2)}</span>
            </p>
        </div>
        <div class="next-match-time">${formatCountdown(minutes)}</div>
    `;
}

function loadData() {
    chrome.storage.local.get(["liveMatches", "nextMatch", "nextMatchInMin"], ({ liveMatches, nextMatch, nextMatchInMin }) => {
        renderLive(liveMatches?.[0]);
        renderUpcoming(nextMatch, nextMatchInMin);
    });
}

loadData();
