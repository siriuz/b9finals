const expectedExceptionPromise = require("../utils/expectedException.js");
const DepositHolderMock = artifacts.require("../contracts/mock/DepositHolderMock.sol");

contract('DepositHolder', function (accounts) {

    let owner0, owner1, owned, DepositHolderInstance;
    const addressZero = "0x0000000000000000000000000000000000000000";

    before("should prepare", function () {
        assert.isAtLeast(accounts.length, 2);
        owner0 = accounts[0];
        owner1 = accounts[1];
    });

    describe('Deployment', function () {
        it('should deploy correctly with the correct amount of initial deposit', function () {
            return DepositHolderMock.new(105, { from: owner0 })

                .then((instance) => {
                    return instance.getDeposit();
                })

                .then((depositValue) => {
                    assert.strictEqual(depositValue.toNumber(), 105);
                });
        });

        it('should not deploy if initial deposit is 0', function () {
            return expectedExceptionPromise(
                () => DepositHolderMock.new(0, { from: owner0 })
            )
        })
    })

    describe('setDeposit', function () {
        let depositHolderInstance;

        it('should set deposit correctly and emit a log event', function () {
            return DepositHolderMock.new(105, { from: owner0 })

                .then(instance => depositHolderInstance = instance)

                .then((instance) => {
                    return depositHolderInstance.setDeposit(5, { from: owner0 })
                })

                .then((tx) => {
                    assert.strictEqual(tx.receipt.logs.length, 1);
                    assert.strictEqual(tx.logs.length, 1);
                    const logChanged = tx.logs[0];
                    assert.strictEqual(logChanged.event, "LogDepositSet");
                    assert.strictEqual(logChanged.args.depositWeis.toNumber(), 5);
                    assert.strictEqual(logChanged.args.sender, owner0);
                })

                .then(() => {
                    return depositHolderInstance.getDeposit();
                })

                .then((result) => {
                    assert.strictEqual(result.toNumber(), 5)
                })
        });

        it('should revert if setDeposit is called by non-owner', function () {

            return DepositHolderMock.new(105, { from: owner0 })

                .then((instance) => {
                    return expectedExceptionPromise(
                        () => instance.setDeposit(0, { from: owner1 })
                    )
                })
        })

        it('should revert if setDeposit is called with depositWeis = 0', function () {

            return DepositHolderMock.new(105, { from: owner0 })

                .then((instance) => {
                    return expectedExceptionPromise(
                        () => instance.setDeposit(0, { from: owner0 })
                    )
                })
        })

        it('should revert if setDeposit is called with same deposit value as current', function () {
            return DepositHolderMock.new(105, { from: owner0 })

                .then((instance) => {
                    return expectedExceptionPromise(
                        () => instance.setDeposit(105, { from: owner0 })
                    )
                })
        })
    })

})