pragma solidity ^0.4.13;

import { Owned } from './Owned.sol';
import { DepositHolderI } from './interfaces/DepositHolderI.sol';

contract DepositHolder is Owned, DepositHolderI {

    uint currentDeposit;

    function DepositHolder(uint initialDepositWeis) {
        require(initialDepositWeis > 0);
        currentDeposit = initialDepositWeis;
    }
    
    /**
     * Event emitted when the deposit value has been set.
     * @param sender The account that ran the action.
     * @param depositWeis The value of the deposit measured in weis.
     */
    event LogDepositSet(address indexed sender, uint depositWeis);

    /**
     * Called by the owner of the DepositHolder.
     *     It should not accept 0 as a value.
     *     It should not accept the value already set.
     * @param depositWeis The value of the deposit being set, measure in weis.
     * @return Whether the action was successful.
     * Emits LogDepositSet.
     */
    function setDeposit(uint depositWeis)
        public
        onlyOwner()
        returns(bool success) 
        {
            require(depositWeis > 0);
            require(depositWeis != currentDeposit);
            LogDepositSet(msg.sender, depositWeis);
        }

    /**
     * @return The base price, then to be multiplied by the multiplier, a given vehicle
     * needs to deposit to enter the road system.
     */
    function getDeposit()
        constant
        public
        returns(uint weis)
        {
            return currentDeposit;
        }
}