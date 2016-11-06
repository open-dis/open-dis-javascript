/**
 * The unique designation of a mine contained in the Minefield Data PDU. No espdus are issued for mine entities.  Section 6.2.55 
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.MineEntityIdentifier = function()
{
   /**  */
   this.simulationAddress = new dis7.SimulationAddress(); 

   /**  */
   this.mineEntityNumber = 0;

  dis7.MineEntityIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.simulationAddress.initFromBinary(inputStream);
       this.mineEntityNumber = inputStream.readUShort();
  };

  dis7.MineEntityIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       this.simulationAddress.encodeToBinary(outputStream);
       outputStream.writeUShort(this.mineEntityNumber);
  };
}; // end of class

 // node.js module support
exports.MineEntityIdentifier = dis7.MineEntityIdentifier;

// End of MineEntityIdentifier class

