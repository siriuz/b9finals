pragma solidity ^0.4.13;

import { RegulatedI } from './interfaces/RegulatedI.sol';
import { RegulatorI } from './interfaces/RegulatorI.sol';

contract Regulated is RegulatedI {

    RegulatorI currentRegulator;

    modifier notZeroAddress(address aAddress) {
        require(aAddress != address(0));
        _;
    }

    modifier onlyRegulator() {
        require (msg.sender == address(currentRegulator));
        _;
    }

    function Regulated(address regulatorAddress) notZeroAddress(regulatorAddress) {
        currentRegulator = RegulatorI(regulatorAddress);
    }

    /**
     * Event emitted when a new regulator has been set.
     * @param previousRegulator The previous regulator of the contract.
     * @param newRegulator The new, and current, regulator of the contract.
     */
    event LogRegulatorSet(
        address indexed previousRegulator,
        address indexed newRegulator);

    /**
     * Sets the new regulator for this contract.
     *     It should roll back if any address other than the current regulator of this contract
     *       calls this function.
     *     It should roll back if the new regulator address is 0.
     *     It should roll back if the new regulator is the same as the current regulator.
     * @param newRegulator The new desired regulator of the contract.
     * @return Whether the action was successful.
     * Emits LogRegulatorSet.
     */
    function setRegulator(address newRegulator)
        public
        onlyRegulator()
        notZeroAddress(newRegulator)
        returns(bool success) 
        {
            require(address(currentRegulator) != newRegulator);

            address previousRegulator = currentRegulator;
            currentRegulator = RegulatorI(newRegulator);

            LogRegulatorSet(previousRegulator, currentRegulator);
            return(currentRegulator == newRegulator);
        }

    /**
     * @return The current regulator.
     */
    function getRegulator()
        constant
        public
        returns(RegulatorI regulator) 
        {
            return RegulatorI(currentRegulator);
        }

    /*
     * You need to create:
     *
     * - a contract named `Regulated` that:
     *     - is a `RegulatedI`.
     *     - has a constructor that takes one `address` parameter, the initial regulator, which cannot be 0.
     */
}