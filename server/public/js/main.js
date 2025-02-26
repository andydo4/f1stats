

document.getElementById('driverBtn').addEventListener('click', () => {
    setActiveButton('driverBtn')
    const selectedYear = document.getElementById('yearSelect').value
    // Fetch and update the drivers standings for the selected year
    updateStandings('drivers', selectedYear)
})

document.getElementById('constructorBtn').addEventListener('click', () => {
    setActiveButton('constructorBtn')
    const selectedYear = document.getElementById('yearSelect').value
    // Fetch and update the constructors standings for the selected year
    updateStandings('constructors', selectedYear)
})

document.getElementById('racesBtn').addEventListener('click', () => {
    setActiveButton('racesBtn')
    // Fetch and update
    const selectedYear = document.getElementById('yearSelect').value
    updateRaceList(selectedYear)
})

// When the year selection changes, update the currently active view
document.getElementById('yearSelect').addEventListener('change', () => {
    const activeButton = document.querySelector('button.active')?.id;
    const selectedYear = document.getElementById('yearSelect').value;
    if (activeButton === 'driverBtn') {
        updateStandings('drivers', selectedYear);
    } else if (activeButton === 'constructorBtn') {
        updateStandings('constructors', selectedYear);
    } else if (activeButton === 'racesBtn') {
        updateRaceList(selectedYear);
    }
});

function setActiveButton(buttonId) {
    // Remove the active class from all buttons
    document.querySelectorAll('button').forEach(button => button.classList.remove('active'));
    // Add the active class to the clicked button
    document.getElementById(buttonId).classList.add('active');

    // Hide all content containers
    document.getElementById('driversContent').style.display = 'none';
    document.getElementById('constructorsContent').style.display = 'none';
    document.getElementById('racesContent').style.display = 'none';

    // Show the content corresponding to the clicked button
    if (buttonId === 'driverBtn') {
        document.getElementById('driversContent').style.display = 'block';
    } else if (buttonId === 'constructorBtn') {
        document.getElementById('constructorsContent').style.display = 'block';
    } else if (buttonId === 'racesBtn') {
        document.getElementById('racesContent').style.display = 'block';
    }
}

function fetchAllRaces(year) {
    const url = `/api/ergast/f1/${year}/races/?limit=1000`; // using the races endpoint
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            return data.MRData.RaceTable.Races;
        });
}

function updateRaceList(year) {
    const raceListContainer = document.getElementById('raceList');
    raceListContainer.innerHTML = '';
    document.getElementById('raceResults').style.display = 'none';
    document.getElementById('raceResultsTable').innerHTML = '';

    fetchAllRaces(year)
        .then(races => {
            if (races && races.length > 0) {
                races.forEach((race) => {
                    const btn = document.createElement('button');
                    btn.textContent = race.raceName;
                    btn.addEventListener('click', () => {
                        updateRaceResults(race);
                    });
                    raceListContainer.appendChild(btn);
                });
            } else {
                raceListContainer.textContent = 'No race data available.';
            }
        })
        .catch(error => console.error('Error fetching race list:', error));
}

// Function to update race details for a selected race
function updateRaceResults(race) {
    const selectedYear = document.getElementById('yearSelect').value;
    const url = `/api/ergast/f1/${selectedYear}/${race.round}/results/?limit=1000`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const raceData = data.MRData.RaceTable.Races[0];
            
            document.getElementById('raceResults').style.display = 'block';
            document.getElementById('raceTitle').textContent = raceData.raceName + ' at ' + raceData.Circuit.circuitName;
            document.getElementById('raceLocation').textContent = raceData.Circuit.Location.locality + ', ' + raceData.Circuit.Location.country;
            document.getElementById('raceDate').textContent = raceData.date;
            
            const resultsTableBody = document.getElementById('raceResultsTable');
            resultsTableBody.innerHTML = ''; // Clear previous results

            raceData.Results.forEach((result, index) => {
                const row = resultsTableBody.insertRow();
                const position = result.positionText === 'R' ? 'DNF' : result.positionText;
                row.insertCell().textContent = position; // Position
                const driverName = result.Driver.code //! if I want to use the driver code
                    ? result.Driver.code
                    : `${result.Driver.givenName} ${result.Driver.familyName}`;
                row.insertCell().textContent = `${result.Driver.givenName} ${result.Driver.familyName}`;
                row.insertCell().textContent = result.Constructor.name;
                row.insertCell().textContent = result.points;
                row.insertCell().textContent = result.Time ? result.Time.time : result.status;
                // Optionally include fastest lap and average speed if available:
                row.insertCell().textContent = result.FastestLap ? result.FastestLap.Time.time : 'N/A';
                row.insertCell().textContent = result.FastestLap && result.FastestLap.AverageSpeed ? result.FastestLap.AverageSpeed.speed : 'N/A';
            });
        })
        .catch(error => console.error('Error fetching full race results:', error));
}


function updateStandings(type, year) {
    
    const url = type === 'drivers' 
        ? `/api/ergast/f1/${year}/driverstandings/`
        : `/api/ergast/f1/${year}/constructorstandings/`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(data); // Check the full API response

            const standingsList = data.MRData.StandingsTable.StandingsLists[0];
            const tableBody = document.getElementById(
                type === 'drivers' ? 'driversTable' : 'constructorsTable'
            )
            tableBody.innerHTML = ''; // Clear existing rows

            if (standingsList) {
                const standings = type === 'drivers' 
                    ? standingsList.DriverStandings 
                    : standingsList.ConstructorStandings;

                standings.forEach((standing, index) => {
                    const row = tableBody.insertRow(); // Create a new row
                    row.insertCell().textContent = index + 1; // Insert and set the first cell (Position)
                    if (type === 'drivers') {
                        row.insertCell().textContent = `${standing.Driver.givenName} ${standing.Driver.familyName}`;
                        row.insertCell().textContent = standing.Constructors[0].name;
                    } else {
                        row.insertCell().textContent = standing.Constructor.name;
                        row.insertCell().textContent = standing.Constructor.nationality;
                    }
                    row.insertCell().textContent = standing.points; // Insert and set the third cell (Points)
                    row.insertCell().textContent = standing.wins || 'N/A'; // Insert and set the fourth cell (Wins)
                });
            } else {
                console.log(`No ${type} standings data available.`);
            }
        })
        .catch(error => console.error(`Error fetching ${type} standings:`, error));
}
