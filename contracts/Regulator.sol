pragma solidity ^0.4.13;

import { Owned } from './Owned.sol';
import { RegulatorI } from './interfaces/RegulatorI.sol';
import { TollBoothOperatorI } from './interfaces/TollBoothOperatorI.sol';
import { TollBoothOperator } from './TollBoothOperator.sol';

contract Regulator is RegulatorI, Owned {


    mapping(address => uint) vehicleTypeRegistry;
    mapping(address => bool) tollBoothOperatorRegistry;

    /**
     * uint VehicleType:
     * 0: not a vehicle, absence of a vehicle
     * 1 and above: is a vehicle.
     * For instance:
     *   1: motorbike
     *   2: car
     *   3: lorry
     */

    /**
     * Event emitted when a new vehicle has been registered with its type.
     * @param sender The account that ran the action.
     * @param vehicle The address of the vehicle that is registered.
     * @param vehicleType The VehicleType that the vehicle was registered as.
     */
    event LogVehicleTypeSet(
        address indexed sender,
        address indexed vehicle,
        uint indexed vehicleType);

    /**
     * Called by the owner of the regulator to register a new vehicle with its VehicleType.
     *     It should not be possible to change it if no change will be effected.
     *     It should not be possible to pass a 0x vehicle address.
     * @param vehicle The address of the vehicle being registered. This may be an externally
     *   owned account or a contract. The regulator does not care.
     * @param vehicleType The VehicleType of the vehicle being registered.
     *    passing 0 is equivalent to unregistering the vehicle.
     * @return Whether the action was successful.
     * Emits LogVehicleTypeSet
     */
    function setVehicleType(address vehicle, uint vehicleType)
        public
        onlyOwner()
        returns(bool success) 
        {
            require(vehicleType != vehicleTypeRegistry[vehicle]);
            require(vehicle != address(0));

            vehicleTypeRegistry[vehicle] = vehicleType;
            LogVehicleTypeSet(msg.sender, vehicle, vehicleType);
            
            return (vehicleType == vehicleTypeRegistry[vehicle]);
        }

    /**
     * @param vehicle The address of the registered vehicle.
     * @return The VehicleType of the vehicle whose address was passed. 0 means it is not
     *   a registered vehicle.
     */
    function getVehicleType(address vehicle)
        constant
        public
        returns(uint vehicleType) 
        {
            return vehicleTypeRegistry[vehicle];
        }

    /**
     * Event emitted when a new TollBoothOperator has been created and registered.
     * @param sender The account that ran the action.
     * @param newOperator The newly created TollBoothOperator contract.
     * @param owner The rightful owner of the TollBoothOperator.
     * @param depositWeis The initial deposit amount set in the TollBoothOperator.
     */
    event LogTollBoothOperatorCreated(
        address indexed sender,
        address indexed newOperator,
        address indexed owner,
        uint depositWeis);

    /**
     * Called by the owner of the regulator to deploy a new TollBoothOperator onto the network.
     *     It should start the TollBoothOperator in the `true` paused state.
     *     It should not accept as rightful owner the current owner of the regulator.
     * @param owner The rightful owner of the newly deployed TollBoothOperator.
     * @param deposit The initial value of the TollBoothOperator deposit.
     * @return The address of the newly deployed TollBoothOperator.
     * Emits LogTollBoothOperatorCreated.
     */
    function createNewOperator(
            address owner,
            uint deposit)
        public
        onlyOwner()
        returns(TollBoothOperatorI newOperator) 
        {
            require(owner != currentOwner); // currentOwner is owner of the regulator, owner is parameter passed in

            TollBoothOperator tb = new TollBoothOperator(true, deposit, owner);
            tb.setOwner(owner);
            tollBoothOperatorRegistry[tb] = true;
            LogTollBoothOperatorCreated(msg.sender, tb, owner, deposit);
            return TollBoothOperatorI(tb);
        }

    /**
     * Event emitted when a TollBoothOperator has been removed from the list of approved operators.
     * @param sender The account that ran the action.
     * @param operator The removed TollBoothOperator.
     */
    event LogTollBoothOperatorRemoved(
        address indexed sender,
        address indexed operator);

    /**
     * Called by the owner of the regulator to remove a previously deployed TollBoothOperator from
     * the list of approved operators.
     *     It should not accept if the operator is unknown.
     * @param operator The address of the contract to remove.
     * @return Whether the action was successful.
     * Emits LogTollBoothOperatorRemoved.
     */
    function removeOperator(address operator)
        public
        onlyOwner()
        returns(bool success) 
        {
            require(tollBoothOperatorRegistry[operator]); // reverts if operator address is not set
            tollBoothOperatorRegistry[operator] = false;

            LogTollBoothOperatorRemoved(msg.sender, operator);

            return true;
        }

    /**
     * @param operator The address of the TollBoothOperator to test.
     * @return Whether the TollBoothOperator is indeed approved.
     */
    function isOperator(address operator)
        constant
        public
        returns(bool indeed) 
        {
            return tollBoothOperatorRegistry[operator];
        }

    /*
     * You need to create:
     *
     * - a contract named `Regulator` that:
     *     - is `OwnedI` and `RegulatorI`.
     *     - has a constructor that takes no parameter.
     */        
}