const fs = require("fs")

const filename = process.argv[2]

if (!filename) {
    // console.error('Please provide a filename as an input')
    process.exit(1)
  }

fs.readFile(filename, "utf8", (err, data) => {
    if (err) throw err
    let inputLines = data.toString().split("\n")
    inputLines.forEach(command => {
        const tokens = command.trim().split(' ');
        const commandName = tokens[0];
        switch (commandName) {
            case 'ADD_DRIVER':
                addDriver(tokens[1], tokens[2], tokens[3]);
                break;

            case 'ADD_RIDER':
                addRider(tokens[1], tokens[2], tokens[3]);
                console.log(tokens[1], tokens[2], tokens[3]);
                break;

            case 'MATCH':
                match(tokens[1]);
                break;

            case 'START_RIDE':
                startRide(tokens[1], tokens[2], tokens[3]);
                break;

            case 'STOP_RIDE':
                stopRide(tokens[1], tokens[2], tokens[3], tokens[4]);
                break;

            case 'BILL':
                bill(tokens[1]);
                break;

            default:
                console.log('INVALID_COMMAND');
                break;
        }
    });
})


let drivers = {};
let riders = {};
let rides = {};


// function to add a driver
function addDriver(driverId, x, y) {
    if (drivers.hasOwnProperty(driverId)) {
        // console.log('DRIVER_EXISTS');
        return;
    }
    drivers[driverId] = { x, y, status: 'available' };
    // console.log('DRIVER_ADDED');
}

// function to add a Rider

function addRider(riderId, x, y) {
    if (riders.hasOwnProperty(riderId)) {
        // console.log('RIDER_EXISTS');
        return;
    }
    riders[riderId] = { x, y };
    // console.log('RIDER_ADDED');
}




function calculateDistance(x1, y1, x2, y2) {
    const xDiff = x2 - x1;
    const yDiff = y2 - y1;
    return Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
}

// function to match the rider with the nearest available drivers
function match(riderId) {
    let driverDistances = [];

    for (const driverId in drivers) {
        if (drivers.hasOwnProperty(driverId) && drivers[driverId].status === 'available') {
            const driverX = drivers[driverId].x;
            const driverY = drivers[driverId].y;
            const distance = calculateDistance(riders[riderId].x, riders[riderId].y, driverX, driverY);
            if(distance < 5){
                driverDistances.push({ driverId, distance });
            }
        }
    }

    driverDistances.sort((a, b) => {
        if (a.distance !== b.distance) {
            return a.distance - b.distance;
        } else {
            return a.driverId.localeCompare(b.driverId);
        }
    });

    if (driverDistances.length === 0) {
        console.log('NO_DRIVERS_AVAILABLE');
    } else {
        const driversMatched = driverDistances.slice(0, 5).map(driver => driver.driverId);
        console.log('DRIVERS_MATCHED ' + driversMatched.join(' '));
    }
}

// function to start a ride with the Nth driver
function startRide(rideId, n, riderId) {
    if (rides.hasOwnProperty(rideId) || !riders.hasOwnProperty(riderId) || n < 1 || n > 5) {
        console.log('INVALID_RIDE');
        return;
    }

    let availableDrivers = [];

    for (const driverId in drivers) {
        if (drivers.hasOwnProperty(driverId) && drivers[driverId].status === 'available') {
            const driverX = drivers[driverId].x;
            const driverY = drivers[driverId].y;
            const distance = calculateDistance(riders[riderId].x, riders[riderId].y, driverX, driverY);
            availableDrivers.push({ driverId, distance });
        }
    }

    availableDrivers.sort((a, b) => {
        if (a.distance !== b.distance) {
            return a.distance - b.distance;
        } else {
            return a.driverId.localeCompare(b.driverId);
        }
    });

    if (availableDrivers.length < n) {
        console.log('INVALID_RIDE');
        return;
    }

    const driverId = availableDrivers[n - 1].driverId;
    drivers[driverId].status = 'unavailable';
    rides[rideId] = { riderId, driverId };

    console.log('RIDE_STARTED ' + rideId);
}

// function to stop a ride
function stopRide(rideId, destinationX, destinationY, timeTaken) {
    if (!rides.hasOwnProperty(rideId)) {
        console.log('INVALID_RIDE');
        return;
    }

    const ride = rides[rideId];
    const driver = drivers[ride.driverId];

    driver.status = 'available';
    ride.destinationX = destinationX;
    ride.destinationY = destinationY;
    ride.timeTaken = timeTaken;

    console.log(`RIDE_STOPPED ${rideId}`);
}

// function to bill a ride
function bill(rideId) {
    if (!rides.hasOwnProperty(rideId) || rides[rideId].endTime === null) {
        console.log('INVALID_RIDE');
        return;
    }

    const riderId = rides[rideId].riderId;
    const driverId = rides[rideId].driverId;
    const startX = riders[riderId].x;
    const startY = riders[riderId].y;
    const endX = rides[rideId].destinationX;
    const endY = rides[rideId].destinationY;

    const distance = calculateDistance(startX, startY, endX, endY);
    const timeTaken = rides[rideId].timeTaken;

    const baseFare = 50;
    const distanceFare = 6.5 * distance.toFixed(2);
    const timeFare = 2 * timeTaken;
    const totalFare = baseFare + distanceFare + timeFare;
    const serviceTax = 0.2 * totalFare.toFixed(2);
    const finalFare = totalFare + serviceTax;

    console.log(`BILL ${rideId} ${driverId} ${finalFare.toFixed(2)}`);
}


module.exports = {
    addDriver,
    addRider,
    match,
    startRide,
    stopRide,
    bill,
    drivers, 
    riders,
    rides,
}


