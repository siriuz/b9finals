pragma solidity ^0.4.13;

import { OwnedI } from './interfaces/OwnedI.sol';

contract Owned is OwnedI {

    address private currentOwner;


    modifier onlyOwner() {
        require(msg.sender == currentOwner);
        _;
    }

    function Owned() {
        currentOwner = msg.sender;
    }

    /**
     * Event emitted when a new owner has been set.
     * @param previousOwner The previous owner, who happened to effect the change.
     * @param newOwner The new, and current, owner the contract.
     */
    event LogOwnerSet(address indexed previousOwner, address indexed newOwner);

    /**
     * Sets the new owner for this contract.
     *   - only the current owner can call this function
     *   - only a new address can be accepted
     *   - only a non-0 address can be accepted
     * @param newOwner The new owner of the contract
     * @return Whether the action was successful.
     * Emits LogOwnerSet.
     */
    function setOwner(address newOwner)
        onlyOwner()
        public 
        returns(bool success) 
    {
        require(newOwner != address(0));
        require(newOwner != currentOwner);

        address previousOwner = currentOwner;
        currentOwner = newOwner;

        LogOwnerSet(previousOwner, newOwner);
        return (currentOwner == newOwner);
    }

    /**
     * @return The owner of this contract.
     */
    function getOwner() 
        constant 
        public 
        returns(address owner) 
    {
        return currentOwner;
    }

    /*
     * You need to create:
     *
     * - a contract named `Owned` that:
     *     - is a `OwnedI`.
     *     - has a modifier named `fromOwner` that rolls back the transaction if the
     * transaction sender is not the owner.
     *     - has a constructor that takes no parameter.
     */
}