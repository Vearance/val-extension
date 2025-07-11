const API = 'https://vlrggapi.vercel.app/match?q=live_score';

async function getMatches() {
    try {
        const res = await fetch(API);
        const json = await res.json();
        const matches = json.data.segments || [];

        const container = document.getElementById('live');
        container.innerHTML = '';

        if (matches.length === 0) {
            container.textContent = 'No live matches';
            return;
        }

        matches.forEach(m => {
            const div = document.createElement('div');
            div.className = 'match';
            div.textContent = `${m.team1} ${m.score1} – ${m.score2} ${m.team2} | Map ${m.map_number} (${m.current_map})`;
            container.appendChild(div);
        });
    } catch (err) {
        document.getElementById('live').textContent = 'Error loading scores';
    }
}

getMatches();
