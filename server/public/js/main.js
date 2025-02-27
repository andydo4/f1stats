

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

        // Get the select element for mobile
        const qualifyingSelect = document.getElementById('qualifyingSelect');
        qualifyingSelect.innerHTML = '';  // Clear previous options
        qualifyingSelect.classList.add('mobileSelect');

    fetchAllRaces(year)
        .then(qualifying => {
            if (qualifying && qualifying.length > 0) {
                qualifying.forEach((qualifying, index) => {
                    const btn = document.createElement('button');
                    btn.textContent = qualifying.raceName;
                    btn.classList.add('race-btn');
                    setTimeout(() => {
                        btn.classList.add('animate-in');
                    }, index * 25);
                    btn.addEventListener('click', () => {

                        document.querySelectorAll('.race-btn.active').forEach(button => button.classList.remove('active'));

                        btn.classList.add('active');

                        updateQualifyingResults(qualifying);
                    });
                    qualifyingListContainer.appendChild(btn);
                });
                // mobile select menu
                const defaultOption = document.createElement('option');
                    defaultOption.textContent = "Select a race...";
                    defaultOption.disabled = true;
                    defaultOption.selected = true;
                    qualifyingSelect.appendChild(defaultOption);
                    qualifying.forEach((race) => {
                        const option = document.createElement('option');
                        option.value = race.round;
                        option.textContent = race.raceName;
                        qualifyingSelect.appendChild(option); 
                    });
                    qualifyingSelect.addEventListener('change', () => {
                        const selectedRound = qualifyingSelect.value;
                        const selectedRace = qualifying.find(r => r.round === selectedRound);
                        updateQualifyingResults(selectedRace);
                    })
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

            const table = document.querySelector('#qualifyingResults table');
                const thead = table.querySelector('thead');
                thead.innerHTML = '';

                // Create a new row for race info
                const infoRow = document.createElement('tr');
                const infoCell = document.createElement('th');
                // Set colspan equal to the number of columns (here, 7)
                infoCell.colSpan = 6;
                infoCell.innerHTML = `
                    <div class="race-info-row">
                        <span class="race-title">${qualifyingData.raceName}</span>
                        <span class="race-location">${qualifyingData.Circuit.Location.locality}, ${qualifyingData.Circuit.Location.country}</span>
                        <span class="race-date">${qualifyingData.date}</span>
                    </div>
                `;
                infoRow.appendChild(infoCell);
                thead.appendChild(infoRow);

                const headerRow = document.createElement('tr');

                const thPosition = document.createElement('th');
                thPosition.id = "te-position";
                thPosition.textContent = "Position";
                headerRow.appendChild(thPosition);

                const thDriver = document.createElement('th');
                thDriver.id = "te-driver";
                thDriver.textContent = "Driver";
                headerRow.appendChild(thDriver);

                const thConstructor = document.createElement('th');
                thConstructor.id = "te-constructor";
                thConstructor.textContent = "Constructor";
                headerRow.appendChild(thConstructor);

                const thQ1 = document.createElement('th');
                thQ1.id = "te-q1";
                thQ1.textContent = "Q1";
                headerRow.appendChild(thQ1);

                const thQ2 = document.createElement('th');
                thQ2.id = "te-q2";
                thQ2.textContent = "Q2";
                headerRow.appendChild(thQ2);

                const thQ3 = document.createElement('th');
                thQ3.id = "te-q3";
                thQ3.textContent = "Q3";
                headerRow.appendChild(thQ3);

                thead.appendChild(headerRow);
            
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
            // Add drop-down animation to the race results container
            const qualifyingResultsContainer = document.getElementById('qualifyingResults');
            qualifyingResultsContainer.classList.remove('table-animate-in'); // reset animation
            void qualifyingResultsContainer.offsetWidth; // force reflow to restart animation
            qualifyingResultsContainer.classList.add('table-animate-in');

            updateQualifyingText();
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

        // Get the select element for mobile
        const raceSelect = document.getElementById('raceSelect');
        raceSelect.innerHTML = '';  // Clear previous options
        raceSelect.classList.add('mobileSelect');

        fetchAllRaces(year)
            .then(races => {
                if (races && races.length > 0) {
                    races.forEach((race, index) => {
                        const btn = document.createElement('button');
                        btn.textContent = race.raceName;
                        btn.classList.add('race-btn');
                        setTimeout(() => {
                            btn.classList.add('animate-in');
                        }, index * 25);
                        btn.addEventListener('click', () => {

                            document.querySelectorAll('.race-btn.active').forEach(button => button.classList.remove('active'));

                            btn.classList.add('active');

                            updateRaceResults(race, 'races');
                        });
                        raceListContainer.appendChild(btn);
                    });
                    // mobile select menu
                    const defaultOption = document.createElement('option');
                    defaultOption.textContent = "Select a race...";
                    defaultOption.disabled = true;
                    defaultOption.selected = true;
                    raceSelect.appendChild(defaultOption);
                    races.forEach((race) => {
                        const option = document.createElement('option');
                        option.value = race.round;
                        option.textContent = race.raceName;
                        raceSelect.appendChild(option); 
                    });
                    raceSelect.addEventListener('change', () => {
                        const selectedRound = raceSelect.value;
                        const selectedRace = races.find(r => r.round === selectedRound);
                        updateRaceResults(selectedRace, 'races');
                    })
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

        // Get the select element for mobile
        const sprintSelect = document.getElementById('sprintSelect');
        sprintSelect.innerHTML = '';  // Clear previous options
        sprintSelect.classList.add('mobileSelect');

        fetchAllSprints(year)
            .then(races => {
                if (races && races.length > 0) {
                    races.forEach((race, index) => {
                        const btn = document.createElement('button');
                        btn.textContent = race.raceName;
                        btn.classList.add('race-btn');
                        setTimeout(() => {
                            btn.classList.add('animate-in');
                        }, index * 25);
                        btn.addEventListener('click', () => {

                            document.querySelectorAll('.race-btn.active').forEach(button => button.classList.remove('active'));

                            btn.classList.add('active');

                            updateRaceResults(race, 'sprints');
                        });
                        sprintListContainer.appendChild(btn);
                    });
                    // mobile select menu
                    const defaultOption = document.createElement('option');
                    defaultOption.textContent = "Select a sprint...";
                    defaultOption.disabled = true;
                    defaultOption.selected = true;
                    sprintSelect.appendChild(defaultOption);
                    races.forEach((race) => {
                        const option = document.createElement('option');
                        option.value = race.round;
                        option.textContent = race.raceName;
                        sprintSelect.appendChild(option); 
                    });
                    sprintSelect.addEventListener('change', () => {
                        const selectedRound = sprintSelect.value;
                        const selectedRace = races.find(r => r.round === selectedRound);
                        updateRaceResults(selectedRace, 'sprints');
                    })
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
            
            let fastestLapTime = Infinity;
            if (type === 'races') {
                raceData.Results.forEach(result => {
                    if (result.FastestLap && result.FastestLap.Time && result.FastestLap.Time.time) {
                        const timeStr = result.FastestLap.Time.time;
                        const parts = timeStr.split(':');
                        const seconds = parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
                        if(seconds < fastestLapTime) {
                            fastestLapTime = seconds;
                        }
                    }
                });
            } else { // sprints
                raceData.SprintResults.forEach(result => {
                    if (result.FastestLap && result.FastestLap.Time && result.FastestLap.Time.time) {
                        const timeStr = result.FastestLap.Time.time;
                        const parts = timeStr.split(':');
                        const seconds = parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
                        if(seconds < fastestLapTime) {
                            fastestLapTime = seconds;
                        }
                    }
                });
            }

            if (type === 'races') {
                // Show the race results container and update its elements
                document.getElementById('raceResults').style.display = 'block';

                const table = document.querySelector('#raceResults table');
                const thead = table.querySelector('thead');
                thead.innerHTML = '';

                // !  Create a new row for race info

                const infoRow = document.createElement('tr');
                infoRow.classList.add('info-row');
                const infoCell = document.createElement('th');
                // Set colspan equal to the number of columns (here, 7)
                infoCell.colSpan = 7;
                infoCell.innerHTML = `
                    <div class="race-info-row">
                        <span class="race-title">${raceData.raceName}</span>
                        <span class="race-location">${raceData.Circuit.Location.locality}, ${raceData.Circuit.Location.country}</span>
                        <span class="race-date">${raceData.date}</span>
                    </div>
                `;
                infoRow.appendChild(infoCell);
                thead.appendChild(infoRow);

                // ! Header Row Creation

                const headerRow = document.createElement('tr');

                const thPosition = document.createElement('th');
                thPosition.id = "th-position";
                thPosition.textContent = "Position";
                headerRow.appendChild(thPosition);

                const thDriver = document.createElement('th');
                thDriver.id = "th-driver";
                thDriver.textContent = "Driver";
                headerRow.appendChild(thDriver);

                const thConstructor = document.createElement('th');
                thConstructor.id = "th-constructor";
                thConstructor.textContent = "Constructor";
                headerRow.appendChild(thConstructor);

                const thPoints = document.createElement('th');
                thPoints.id = "th-points";
                thPoints.textContent = "Points";
                headerRow.appendChild(thPoints);

                const thTime = document.createElement('th');
                thTime.id = "th-time";
                thTime.textContent = "Time";
                headerRow.appendChild(thTime);

                const thFastestLap = document.createElement('th');
                thFastestLap.id = "th-fastestlap";
                thFastestLap.textContent = "Fastest Lap";
                headerRow.appendChild(thFastestLap);

                const thAvgSpeed = document.createElement('th');
                thAvgSpeed.id = "th-averagespeed";
                thAvgSpeed.textContent = "Average Speed (kph)";
                headerRow.appendChild(thAvgSpeed);

                thead.appendChild(headerRow);


                // ! Table Body Creation

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
                    // Fastest Lap cell:
                    const fastestLapCell = row.insertCell();
                    if (result.FastestLap && result.FastestLap.Time && result.FastestLap.Time.time) {
                        const lapTimeStr = result.FastestLap.Time.time;
                        fastestLapCell.textContent = lapTimeStr;
                        const parts = lapTimeStr.split(':');
                        const seconds = parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
                        if (Math.abs(seconds - fastestLapTime) < 0.001) {
                            fastestLapCell.style.color = '#2BDE73';
                            // fastestLapCell.classList.add('fastest-lap'); to add it to a class
                        }
                    } else {
                        fastestLapCell.textContent = 'N/A';
                    }
                    row.insertCell().textContent = result.FastestLap && result.FastestLap.AverageSpeed ? result.FastestLap.AverageSpeed.speed : 'N/A';
                });

                // Add drop-down animation to the race results container
                const raceResultsContainer = document.getElementById('raceResults');
                raceResultsContainer.classList.remove('table-animate-in'); // reset animation
                void raceResultsContainer.offsetWidth; // force reflow to restart animation
                raceResultsContainer.classList.add('table-animate-in');

                updateRaceText();
            } else {
                // ! Sprint branch 
                document.getElementById('sprintResults').style.display = 'block';

                const table = document.querySelector('#sprintResults table');
                const thead = table.querySelector('thead');
                thead.innerHTML = '';

                // Create a new row for race info
                const infoRow = document.createElement('tr');
                const infoCell = document.createElement('th');
                // Set colspan equal to the number of columns (here, 7)
                infoCell.colSpan = 6;
                infoCell.innerHTML = `
                    <div class="race-info-row">
                        <span class="race-title">${raceData.raceName}</span>
                        <span class="race-location">${raceData.Circuit.Location.locality}, ${raceData.Circuit.Location.country}</span>
                        <span class="race-date">${raceData.date}</span>
                    </div>
                `;
                infoRow.appendChild(infoCell);
                thead.appendChild(infoRow);

                const headerRow = document.createElement('tr');

                const thPosition = document.createElement('th');
                thPosition.id = "tw-position";
                thPosition.textContent = "Position";
                headerRow.appendChild(thPosition);

                const thDriver = document.createElement('th');
                thDriver.id = "tw-driver";
                thDriver.textContent = "Driver";
                headerRow.appendChild(thDriver);

                const thConstructor = document.createElement('th');
                thConstructor.id = "tw-constructor";
                thConstructor.textContent = "Constructor";
                headerRow.appendChild(thConstructor);

                const thPoints = document.createElement('th');
                thPoints.id = "tw-points";
                thPoints.textContent = "Points";
                headerRow.appendChild(thPoints);

                const thTime = document.createElement('th');
                thTime.id = "tw-time";
                thTime.textContent = "Time";
                headerRow.appendChild(thTime);

                const thFastestLap = document.createElement('th');
                thFastestLap.id = "tw-fastestlap";
                thFastestLap.textContent = "Fastest Lap";
                headerRow.appendChild(thFastestLap);

                thead.appendChild(headerRow);

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
                    // Fastest Lap cell:
                    const fastestLapCell = row.insertCell();
                    if (result.FastestLap && result.FastestLap.Time && result.FastestLap.Time.time) {
                        const lapTimeStr = result.FastestLap.Time.time;
                        fastestLapCell.textContent = lapTimeStr;
                        const parts = lapTimeStr.split(':');
                        const seconds = parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
                        if (Math.abs(seconds - fastestLapTime) < 0.001) {
                            fastestLapCell.style.color = '#2BDE73';
                            // fastestLapCell.classList.add('fastest-lap'); to add it to a class
                        }
                    } else {
                        fastestLapCell.textContent = 'N/A';
                    }
                });
                // Add drop-down animation to the race results container
                const sprintResultsContainer = document.getElementById('sprintResults');
                sprintResultsContainer.classList.remove('table-animate-in'); // reset animation
                void sprintResultsContainer.offsetWidth; // force reflow to restart animation
                sprintResultsContainer.classList.add('table-animate-in');

                updateSprintText();
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

            let multiplier;
            if(window.innerWidth <= 768){
                if (year < 1970) multiplier = 1;
                else if (year < 2010) multiplier = 0.6;
                else if (year < 2016) multiplier = 0.4;
                else multiplier = 0.37;
            } else {
                if (year < 1970) multiplier = 8;
                else if (year < 2010) multiplier = 6;
                else multiplier = 2;
            }

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

                const finalWidth = points * multiplier;

                bar.style.width = '0px';
                let color = getComputedStyle(document.documentElement).getPropertyValue(`--${constructorId}`).trim();
                if (!color) {
                    color = '#ffffff';
                }
                bar.style.backgroundColor = color;
                bar.style.boxShadow = `0 0 5px ${color}`;
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

function updateRaceText() {
    if (window.innerWidth <= 768) {
        document.getElementById('th-position').innerText = "Pos";
        document.getElementById('th-constructor').innerText = "Team";
        document.getElementById('th-points').innerText = "Pts";
        document.getElementById('th-averagespeed').innerText = "Avg Spd";
    } else {
        document.getElementById('th-position').innerText = "Position";
        document.getElementById('th-points').innerText = "Points";
        document.getElementById('th-averagespeed').innerText = "Average Speed (kph)";
    }
}

function updateSprintText() {
    if (window.innerWidth <= 768) {
        document.getElementById('tw-position').innerText = "Pos";
        document.getElementById('tw-constructor').innerText = "Team";
        document.getElementById('tw-points').innerText = "Pts";
    } else {
        document.getElementById('tw-position').innerText = "Position";
        document.getElementById('tw-points').innerText = "Points";
    }
}

function updateQualifyingText() {
    if (window.innerWidth <= 768) {
        document.getElementById('te-position').innerText = "Pos";
        document.getElementById('te-constructor').innerText = "Team";
    } else {
        document.getElementById('te-position').innerText = "Position";
    }
}
