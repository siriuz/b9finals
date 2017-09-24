pragma solidity ^0.4.13;

import { PausableI } from './interfaces/PausableI.sol';
import { Owned } from './Owned.sol';

contract Pausable is PausableI, Owned {
    bool paused;
    
    /**
     * Event emitted when a new paused state has been set.
     * @param sender The account that ran the action.
     * @param newPausedState The new, and current, paused state of the contract.
     */
    event LogPausedSet(address indexed sender, bool indexed newPausedState);

    modifier whenPaused() {
        require(paused);
        _;
    }

    modifier whenNotPaused() {
        require(!paused);
        _;
    }

    function Pausable(bool initialState) {
        paused = initialState;
    }

    /**
     * Sets the new paused state for this contract.
     *   - only the current owner of this contract can call this function.
     *   - only a state different from the current one can be passed.
     * @param newState The new desired "paused" state of the contract.
     * @return Whether the action was successful.
     * Emits LogPausedSet.
     */
    function setPaused(bool newState) 
        onlyOwner
        returns(bool success) 
    {
        require(newState != paused);
        paused = newState;
        LogPausedSet(msg.sender, newState);
        return (paused == newState);
    }

    /**
     * @return Whether the contract is indeed paused.
     */
    function isPaused() public constant returns(bool isIndeed) {
        return paused;
    }

    /*
     * You need to create:
     *
     * - a contract named `Pausable` that:
     *     - is a `OwnedI` and a `PausableI`.
     *     - has a modifier named `whenPaused` that rolls back the transaction if the
     * contract is in the `true` paused state.
     *     - has a modifier named `whenNotPaused` that rolls back the transaction if the
     * contract is in the `false` paused state.
     *     - has a constructor that takes one `bool` parameter, the initial paused state.
     */
}