pragma solidity ^0.4.13;

import { Owned } from './Owned.sol';
import { MultiplierHolderI } from './interfaces/MultiplierHolderI.sol';

contract MultiplierHolder is MultiplierHolderI, Owned {

    mapping (uint => uint256) multiplierMapping;


    /**
     * Event emitted when a new multiplier has been set.
     * @param sender The account that ran the action.
     * @param vehicleType The type of vehicle for which the multiplier was set.
     * @param multiplier The actual multiplier set.
     */
    event LogMultiplierSet(
        address indexed sender,
        uint indexed vehicleType,
        uint multiplier);

    /**
     * Called by the owner of the TollBoothOperator.
     *   Can be used to update a value.
     *   It should roll back if the vehicle type is 0.
     *   Setting the multiplier to 0 is equivalent to removing it.
     *   It should roll back if the same multiplier is already set to the vehicle type.
     * @param vehicleType The type of the vehicle being set.
     * @param multiplier The multiplier to use.
     * @return Whether the action was successful.
     * Emits LogMultiplierSet.
     */
    function setMultiplier(
            uint vehicleType,
            uint multiplier)
        public
        onlyOwner
        returns(bool success) 
        {
            require(vehicleType != 0);
            require(multiplier >= 0); // we don't want to be giving away money
            require(multiplierMapping[vehicleType] != multiplier);

            multiplierMapping[vehicleType] = multiplier;
            LogMultiplierSet(msg.sender, vehicleType, multiplier);

            return true;
        }

    /**
     * @param vehicleType The type of vehicle whose multiplier we want
     *     It should accept a vehicle type equal to 0.
     * @return The multiplier for this vehicle type.
     *     A 0 value indicates a non-existent multiplier.
     */
    function getMultiplier(uint vehicleType)
        constant
        public
        returns(uint multiplier) 
        {
            return (multiplierMapping[vehicleType]);
        }
}