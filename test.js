const {
    addDriver,
    addRider,
    match,
    startRide,
    stopRide,
    bill,
    drivers,
    riders,
} = require("./geektrust");

describe("Ride Sharing App", () => {
    

    describe("addDriver", () => {
        it("should add a driver", () => {
            addDriver("D1", 0, 0);
            expect(drivers["D1"]).toEqual({ x: 0, y: 0, status: "available" });
        });

        it("should not add a driver with the same id", () => {
            addDriver("D1", 4, 4);
            addDriver("D1", 1, 1);
            expect(drivers["D1"]).toEqual({ x: 0, y: 0, status: "available" });
        });
    });

    describe("addRider", () => {
        it("should add a rider", () => {
            addRider("R1", 2, 2);
            expect(riders["R1"]).toEqual({ x: 2, y: 2 });
        });

        it("should not add a rider with the same id", () => {
            addRider("R1", 5, 5);
            addRider("R1", 6, 6);
            expect(riders["R1"]).toEqual({ x: 2, y: 2 });
        });
    });

    describe("match", () => {

        beforeEach(() => {
            
            addDriver("D1", 0, 0);
            addDriver("D2", 10, 10);
            addRider("R1", 2, 2);
            addRider("R2", 15, 15);
        });
 
        it("should match the rider with the nearest available drivers", () => {
            const logSpy = jest.spyOn(console, "log");

            match("R1");

            expect(logSpy).toHaveBeenCalledWith("DRIVERS_MATCHED D1");
        });

        it("should log 'NO_DRIVERS_AVAILABLE' if there are no available drivers", () => {
            const logSpy = jest.spyOn(console, "log");

            addDriver("D3", 20, 20);
            addDriver("D4", 30, 30);
            addDriver("D5", 40, 40);
            match("R2");

            expect(logSpy).toHaveBeenCalledWith("NO_DRIVERS_AVAILABLE");
        });

        it("should not match a rider with a driver more than 5 km away", () => {
            const logSpy = jest.spyOn(console, "log");

            addDriver("D3", 50, 50);
            match("R1");

            expect(logSpy).toHaveBeenCalledWith("NO_DRIVERS_AVAILABLE");
        });
    });

    describe("startRide", () => {
        beforeEach(() => {
            addDriver("D1", 0, 0);
            addDriver("D2", 10, 10);
            addRider("R1", 5, 5);
            addRider("R2", 15, 15);
        });

        it("should start a ride with the Nth driver", () => {
            const logSpy = jest.spyOn(console, "log");

            startRide("R1-D1", 1, "R1");

            expect(logSpy).toHaveBeenCalledWith("RIDE_STARTED R1-D1");
            expect(drivers["D1"]).toHaveProperty("status", "unavailable");
        });


        it("should not start a ride if the driver is not available", () => {
            const logSpy = jest.spyOn(console, "log");

            addDriver("D3", 5, 5);
            startRide("R1-D3", 6, "R1");

            expect(logSpy).toHaveBeenCalledWith("INVALID_RIDE");
        });
    });

    describe("stopRide", () => {
        beforeEach(() => {
            addDriver("D4", 30, 30);
            addRider("R7", 2, 2);
            startRide("R7-D7", 4, "R7");
        });


        it("should stop a ride and log the trip details", () => {

            stopRide("R1-D3", 3, 15, 30);


  
            expect(drivers["D4"]).toHaveProperty("status", "available");
            expect(riders["R7"]).not.toHaveProperty("rideId");
        });

        it("should not stop a ride if the ride id is invalid", () => {
            const logSpy = jest.spyOn(console, "log");

            stopRide("R3-D3", 3, 15, 30);

            expect(logSpy).toHaveBeenCalledWith("INVALID_RIDE");
        });
    });

    describe("bill", () => {
        beforeEach(() => {
            addDriver("D5", 40, 40);
            addRider("R6", 38, 38);
            startRide("R1-D1", 5, "R1");
            stopRide("R1-D1", 3, 15, 30);
        });


        it("should return the bill for the ride", () => {
            const logSpy = jest.spyOn(console, "log");

            bill("R1-D1");
            expect(logSpy).toHaveBeenCalledWith(
                "BILL R1-D1 D1 233.71"
            );
        });

        it("should return null if the ride id is invalid", () => {
            const logSpy = jest.spyOn(console, "log");
            
            bill("R3-D3");
            expect(logSpy).toHaveBeenCalledWith(
                "INVALID_RIDE"
            );
        });
    });
});
