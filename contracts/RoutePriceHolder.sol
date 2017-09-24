pragma solidity ^0.4.13;

import { Owned } from './Owned.sol';
import { TollBoothHolderI } from './interfaces/TollBoothHolderI.sol';
import { RoutePriceHolderI } from './interfaces/RoutePriceHolderI.sol';

contract RoutePriceHolder is Owned, TollBoothHolderI, RoutePriceHolderI {

    mapping (address => mapping(address => uint)) routePriceTable;
    
    modifier validTollBooths(address entryTollBooth, address exitTollBooth) {
        require(entryTollBooth != exitTollBooth);

        require(entryTollBooth != address(0));
        require(exitTollBooth != address(0));
        
        require(isTollBooth(entryTollBooth));
        require(isTollBooth(exitTollBooth));

        _;
    }
    /**
     * Event emitted when a new price has been set on a route.
     * @param sender The account that ran the action.
     * @param entryBooth The address of the entry booth of the route set.
     * @param exitBooth The address of the exit booth of the route set.
     * @param priceWeis The price in weis of the new route.
     */
    event LogRoutePriceSet(
        address indexed sender,
        address indexed entryBooth,
        address indexed exitBooth,
        uint priceWeis);

    /**
     * Called by the owner of the RoutePriceHolder.
     *     It can be used to update the price of a route, including to zero.
     *     It should roll back if one of the booths is not a registered booth.
     *     It should roll back if entry and exit booths are the same.
     *     It should roll back if either booth is zero.
     *     It should roll back if there is no change in price.
     *     If relevant, and only when part of TollBoothOperatorI, it will release 1 pending payment
     *       for this route.
     *     It should not roll back if the relevant pending payment is not solvable, if, for
     *       instance the vehicle has had wrongly set values in the interim.
     *     It should be possible to call it even when the contract is in the `true` paused state.
     * @param entryBooth The address of the entry booth of the route set.
     * @param exitBooth The address of the exit booth of the route set.
     * @param priceWeis The price in weis of the new route.
     * @return Whether the action was successful.
     * Emits LogPriceSet.
     */
    function setRoutePrice(
            address entryBooth,
            address exitBooth,
            uint priceWeis)
        public
        onlyOwner()
        validTollBooths(entryBooth, exitBooth)
        returns(bool success)
        {
            require(routePriceTable[entryBooth][exitBooth] != priceWeis);
            
            //TODO: If relevant, and only when part of TollBoothOperatorI, it will release 1 pending payment for this route.
            //TODO: figure out the pending payments thing
            // maybe call this function from TollBoothOperator as part of a function that overrides this

            routePriceTable[entryBooth][exitBooth] = priceWeis;
            LogRoutePriceSet(msg.sender, entryBooth, exitBooth, priceWeis);

            assert(routePriceTable[entryBooth][exitBooth] == priceWeis);

            return true;
        }

    /**
     * @param entryBooth The address of the entry booth of the route.
     * @param exitBooth The address of the exit booth of the route.
     * @return priceWeis The price in weis of the route.
     *     If the route is not known or if any address is not a booth it should return 0.
     *     If the route is invalid, it should return 0.
     */
    function getRoutePrice(
            address entryBooth,
            address exitBooth)
        constant
        public
        returns(uint priceWeis)
        {
            return routePriceTable[entryBooth][exitBooth];
        }

    /*
     * You need to create:
     *
     * - a contract named `RoutePriceHolder` that:
     *     - is `OwnedI`, `TollBoothHolderI`, and `RoutePriceHolderI`.
     *     - has a constructor that takes no parameter.
     */
}