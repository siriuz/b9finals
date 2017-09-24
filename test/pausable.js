const expectedExceptionPromise = require("../utils/expectedException.js");
const PausableMock = artifacts.require("../contracts/mock/PausableMock.sol");

contract('Pausable', function (accounts) {

    let owner0, owner1, owned, pausableInstance;
    const addressZero = "0x0000000000000000000000000000000000000000";

    before("should prepare", function () {
        assert.isAtLeast(accounts.length, 2);
        owner0 = accounts[0];
        owner1 = accounts[1];
    });

    describe('isPaused', function () {

        it('should be paused when deployed with initial state paused', function () {
            return PausableMock.new(true, { from: owner0, })

                .then((instance) => {
                    return instance.isPaused();
                })

                .then(isPaused => {
                    assert.strictEqual(isPaused, true);
                })
        })

        it('should not be paused when deployed with initial state not paused', function () {
            return PausableMock.new(false, { from: owner0, })

                .then((instance) => {
                    return instance.isPaused();
                })

                .then(isPaused => {
                    assert.strictEqual(isPaused, false);
                })
        })
    })

    describe('setPaused', function () {

        let pausableInstance;

        beforeEach('should set up a PausableMock instance', function () {
            return PausableMock.new(false, { from: owner0 })
                .then(instance => pausableInstance = instance);
        })

        it('should allow pausing by the owner', function () {
            return pausableInstance.setPaused(true, { from: owner0 })

                .then((result) => {
                    return pausableInstance.isPaused();
                })

                .then((isPaused) => {
                    assert.strictEqual(isPaused, true)
                })
        })

        it('should disallow pausing if not by the owner', function () {
            return expectedExceptionPromise(
                () => pausableInstance.setPaused(true, { from: owner1 })
            );
        })

        it('should fail if it pause when it is already paused', function () {
            return pausableInstance.setPaused(true, { from: owner0 })
                .then(() => {
                    return expectedExceptionPromise(
                        () => pausableInstance.setPaused(true, { from: owner0 })
                    )
                })
        })

        it('should emit the correct event when paused', function () {
            return pausableInstance.setPaused(true, { from: owner0 })
                .then((tx) => {
                    assert.strictEqual(tx.receipt.logs.length, 1);
                    assert.strictEqual(tx.logs.length, 1);
                    const logChanged = tx.logs[0];
                    assert.strictEqual(logChanged.event, "LogPausedSet");
                    assert.strictEqual(logChanged.args.newPausedState, true);
                    assert.strictEqual(logChanged.args.sender, owner0);
                })
        })
        it('should emit the correct event when unpaused', function () {
            return pausableInstance.setPaused(true, { from: owner0 })
                .then(() => {
                    return pausableInstance.setPaused(false, { from: owner0 });
                })
                .then((tx) => {
                    assert.strictEqual(tx.receipt.logs.length, 1);
                    assert.strictEqual(tx.logs.length, 1);
                    const logChanged = tx.logs[0];
                    assert.strictEqual(logChanged.event, "LogPausedSet");
                    assert.strictEqual(logChanged.args.newPausedState, false);
                    assert.strictEqual(logChanged.args.sender, owner0);
                })
        })

    })

    describe('whenPaused', function () {

        let pausableInstance;

        beforeEach('should set up a PausableMock instance', function () {
            return PausableMock.new(true, { from: owner0 })
                .then(instance => pausableInstance = instance);
        })

        it('should allow actions when paused', function () {
            return pausableInstance.countUpWhenPaused()

                .then((tx) => {
                    return pausableInstance.counters(true)
                })

                .then((result) => {
                    assert.strictEqual(result.toNumber(), 1)
                })
        })

        it('should disallow actions when not paused', function () {

            return pausableInstance.setPaused(false, { from: owner0 })
                .then((tx) => {
                    return expectedExceptionPromise(
                        () => pausableInstance.countUpWhenPaused()
                    )

                })
        })

        it('should allow resuming when paused', function () {
            return pausableInstance.setPaused(false, { from: owner0 })
                .then((result) => {
                    return pausableInstance.countUpWhenNotPaused();
                })
                .then((result) => {
                    return pausableInstance.counters(false);
                })
                .then((result) => {
                    assert.strictEqual(result.toNumber(), 1)
                })
        })
    })


    describe('whenNotPaused', function () {

        let pausableInstance;

        beforeEach('should set up a PausableMock instance', function () {
            return PausableMock.new(false, { from: owner0 })
                .then(instance => pausableInstance = instance);
        })

        it('should allow actions when not paused', function () {

            return pausableInstance.countUpWhenNotPaused()

                .then((tx) => {
                    return pausableInstance.counters(false)
                })

                .then((result) => {
                    assert.strictEqual(result.toNumber(), 1)
                })
        })
        
        it('should disallow actions when paused', function () {

            return pausableInstance.setPaused(true, { from: owner0 })
                .then((tx) => {
                    return expectedExceptionPromise(
                        () => pausableInstance.countUpWhenNotPaused()
                    )

                })
        })


    })


})