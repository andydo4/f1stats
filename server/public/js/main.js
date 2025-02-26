

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
    updateRaceList(selectedYear, 'races')
})

document.getElementById('sprintsBtn').addEventListener('click', () => {
    setActiveButton('sprintsBtn')
    // Fetch and update
    const selectedYear = document.getElementById('yearSelect').value
    updateRaceList(selectedYear, 'sprints')
})

document.getElementById('qualifyingBtn').addEventListener('click', () => {
    setActiveButton('qualifyingBtn')
    // Fetch and update
    const selectedYear = document.getElementById('yearSelect').value
    updateQualifyingList(selectedYear)
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
        updateRaceList(selectedYear, 'races');
    } else if (activeButton === 'sprintsBtn') {
        updateRaceList(selectedYear, 'sprints');
    } else if (activeButton === 'qualifyingBtn') {
        updateQualifyingList(selectedYear);
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
    document.getElementById('sprintsContent').style.display = 'none';
    document.getElementById('qualifyingContent').style.display = 'none';

    // Show the content corresponding to the clicked button
    if (buttonId === 'driverBtn') {
        document.getElementById('driversContent').style.display = 'block';
    } else if (buttonId === 'constructorBtn') {
        document.getElementById('constructorsContent').style.display = 'block';
    } else if (buttonId === 'racesBtn') {
        document.getElementById('racesContent').style.display = 'block';
    } else if (buttonId === 'sprintsBtn') {
        document.getElementById('sprintsContent').style.display = 'block';
    } else if (buttonId === 'qualifyingBtn') {
        document.getElementById('qualifyingContent').style.display = 'block';
    }
}

function updateQualifyingList(year) {
    const qualifyingListContainer = document.getElementById('qualifyingList');
    qualifyingListContainer.innerHTML = '';
    document.getElementById('qualifyingResults').style.display = 'none';
    document.getElementById('qualifyingResultsTable').innerHTML = '';

    fetchAllRaces(year)
        .then(qualifying => {
            if (qualifying && qualifying.length > 0) {
                qualifying.forEach((qualifying) => {
                    const btn = document.createElement('button');
                    btn.textContent = qualifying.raceName;
                    btn.classList.add('race-btn');
                    btn.addEventListener('click', () => {

                        document.querySelectorAll('.race-btn.active').forEach(button => button.classList.remove('active'));

                        btn.classList.add('active');

                        updateQualifyingResults(qualifying);
                    });
                    qualifyingListContainer.appendChild(btn);
                });
            } else {
                qualifyingListContainer.textContent = 'No qualifying data available.';
            }
        })
        .catch(error => console.error('Error fetching qualifying list:', error));
}

function updateQualifyingResults(qualifying) {
    const selectedYear = document.getElementById('yearSelect').value;
    const url = `/api/ergast/f1/${selectedYear}/${qualifying.round}/qualifying/?limit=1000`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const qualifyingData = data.MRData.RaceTable.Races[0];
            document.getElementById('qualifyingResults').style.display = 'block';
            
            const resultsTableBody = document.getElementById('qualifyingResultsTable');
            resultsTableBody.innerHTML = '';
            qualifyingData.QualifyingResults.forEach((result) => {
                const row = resultsTableBody.insertRow();
                row.insertCell().textContent = result.position;
                row.insertCell().textContent = `${result.Driver.givenName} ${result.Driver.familyName}`;
                row.insertCell().textContent = result.Constructor.name;
                row.insertCell().textContent = result.Q1 || ''
                row.insertCell().textContent = result.Q2 || '';
                row.insertCell().textContent = result.Q3 || '';
            });
        })
        .catch(error => console.error('Error fetching full qualifying results:', error));
}

function fetchAllSprints(year) {
    const url = `/api/ergast/f1/${year}/sprint/?limit=1000`; // using the sprints endpoint
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            return data.MRData.RaceTable.Races;
        });
}

function fetchAllRaces(year) {
    const url = `/api/ergast/f1/${year}/races/?limit=1000`; // using the races endpoint
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            return data.MRData.RaceTable.Races;
        });
}

function updateRaceList(year, type) {
    if (type === 'races') {
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
                        btn.classList.add('race-btn');
                        btn.addEventListener('click', () => {

                            document.querySelectorAll('.race-btn.active').forEach(button => button.classList.remove('active'));

                            btn.classList.add('active');

                            updateRaceResults(race, 'races');
                        });
                        raceListContainer.appendChild(btn);
                    });
                } else {
                    raceListContainer.textContent = 'No race data available.';
                }
            })
            .catch(error => console.error('Error fetching race list:', error));
    } else if (type === 'sprints') {
        const sprintListContainer = document.getElementById('sprintList');
        sprintListContainer.innerHTML = '';
        document.getElementById('sprintResults').style.display = 'none';
        document.getElementById('sprintResultsTable').innerHTML = '';

        fetchAllSprints(year)
            .then(races => {
                if (races && races.length > 0) {
                    races.forEach((race) => {
                        const btn = document.createElement('button');
                        btn.textContent = race.raceName;
                        btn.classList.add('race-btn');
                        btn.addEventListener('click', () => {

                            document.querySelectorAll('.race-btn.active').forEach(button => button.classList.remove('active'));

                            btn.classList.add('active');

                            updateRaceResults(race, 'sprints');
                        });
                        sprintListContainer.appendChild(btn);
                    });
                } else {
                    sprintListContainer.textContent = 'No sprint data available (Sprints were first introduced in 2021)';
                }
            })
            .catch(error => console.error('Error fetching sprint list:', error));
    }
}


// Function to update race details for a selected race
function updateRaceResults(race, type = 'races') {
    const selectedYear = document.getElementById('yearSelect').value;
    // Use the correct endpoint based on the type
    const url = type === 'races'
        ? `/api/ergast/f1/${selectedYear}/${race.round}/results/?limit=1000`
        : `/api/ergast/f1/${selectedYear}/${race.round}/sprint/?limit=1000`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const raceData = data.MRData.RaceTable.Races[0];
            
            if (type === 'races') {
                // Show the race results container and update its elements
                document.getElementById('raceResults').style.display = 'block';
                document.getElementById('raceTitle').textContent = raceData.raceName + ' at ' + raceData.Circuit.circuitName;
                // If available, update additional details (if these elements exist)
                if(document.getElementById('raceLocation')) {
                    document.getElementById('raceLocation').textContent = raceData.Circuit.Location.locality + ', ' + raceData.Circuit.Location.country;
                }
                if(document.getElementById('raceDate')) {
                    document.getElementById('raceDate').textContent = raceData.date;
                }
                const resultsTableBody = document.getElementById('raceResultsTable');
                resultsTableBody.innerHTML = '';
                raceData.Results.forEach((result) => {
                    const row = resultsTableBody.insertRow();
                    const position = result.positionText === 'R' ? 'DNF' : result.positionText;
                    row.insertCell().textContent = position;
                    row.insertCell().textContent = `${result.Driver.givenName} ${result.Driver.familyName}`;
                    row.insertCell().textContent = result.Constructor.name;
                    row.insertCell().textContent = result.points;
                    row.insertCell().textContent = result.Time ? result.Time.time : result.status;
                    row.insertCell().textContent = result.FastestLap ? result.FastestLap.Time.time : 'N/A';
                    row.insertCell().textContent = result.FastestLap && result.FastestLap.AverageSpeed ? result.FastestLap.AverageSpeed.speed : 'N/A';
                });
            } else {
                // For sprints, update the sprint results container
                document.getElementById('sprintResults').style.display = 'block';
                document.getElementById('sprintTitle').textContent = raceData.raceName + ' at ' + raceData.Circuit.circuitName;
                const resultsTableBody = document.getElementById('sprintResultsTable');
                resultsTableBody.innerHTML = '';
                raceData.SprintResults.forEach((result) => {
                    const row = resultsTableBody.insertRow();
                    const position = result.positionText === 'R' ? 'DNF' : result.positionText;
                    row.insertCell().textContent = position;
                    row.insertCell().textContent = `${result.Driver.givenName} ${result.Driver.familyName}`;
                    row.insertCell().textContent = result.Constructor.name;
                    row.insertCell().textContent = result.points;
                    row.insertCell().textContent = result.Time ? result.Time.time : result.status;
                    row.insertCell().textContent = result.FastestLap ? result.FastestLap.Time.time : 'N/A';
                });
            }
        })
        .catch(error => console.error('Error fetching full race/sprint results:', error));
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
        
        // ! go make the graph
        updateStandingsGraph(type, year);

}

function updateStandingsGraph(type, year) {
    const url = type === 'drivers'
        ? `/api/ergast/f1/${year}/driverstandings/`
        : `/api/ergast/f1/${year}/constructorstandings/`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const standingsList = data.MRData.StandingsTable.StandingsLists[0];
            const standings = type === 'drivers'
                ? standingsList.DriverStandings
                : standingsList.ConstructorStandings;

            // Determine the container ID for the graph
            const containerId = type === 'drivers' ? 'driversGraph' : 'constructorsGraph';
            const graphContainer = document.getElementById(containerId);
            graphContainer.innerHTML = ''; // Clear existing graph
            graphContainer.style.display = 'block'; // Show the graph container

            standings.forEach(standing => {
                let points = parseFloat(standing.points);
                let code = '';
                let constructorId = '';

                if (type === 'drivers') {
                    // Use the driver's code if available, otherwise use an abbreviated last name
                    code = standing.Driver.code ? standing.Driver.code : standing.Driver.familyName.substr(0, 3).toUpperCase();
                    // Use the constructor ID from the first constructor
                    constructorId = standing.Constructors[0].constructorId;
                } else {
                     // For constructors, you can use an abbreviation of the name
                    code = standing.Constructor.name.substr(0, 3).toUpperCase();
                     // Try to use the constructorId property if available, otherwise process the name
                    constructorId = standing.Constructor.constructorId || standing.Constructor.name.toLowerCase().replace(/\s+/g, '_');
                }

                const row = document.createElement('div');
                row.classList.add('graph-row');

                // Create box for the code / name
                const codeBox = document.createElement('div');
                codeBox.classList.add('graph-code');
                codeBox.textContent = code;
                row.appendChild(codeBox);

                // Create the bar 
                const bar = document.createElement('div');
                bar.classList.add('graph-bar');

                const finalWidth = points * 2;

                bar.style.width = '0px';
                bar.style.backgroundColor = `var(--${constructorId})`;
                bar.style.boxShadow = `0 0 5px var(--${constructorId})`;
                row.appendChild(bar);

                setTimeout(() => {
                    bar.style.width = `${finalWidth}px`;
                }, 50);

                // Show the points value
                const pointsLabel = document.createElement('span');
                pointsLabel.classList.add('graph-points');
                pointsLabel.textContent = points;
                row.appendChild(pointsLabel);

                graphContainer.appendChild(row);
            })
        })
        .catch(error => console.error(`Error fetching ${type} standings for graph:`, error));
}