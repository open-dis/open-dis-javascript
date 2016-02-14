/**
 * The unique designation of each entity in an event or exercise that is contained in a Live Entity PDU. Section 6.2.54 
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


dis7.LiveEntityIdentifier = function()
{
   /** Live Simulation Address record (see 6.2.54)  */
   this.liveSimulationAddress = new dis7.LiveSimulationAddress(); 

   /** Live entity number  */
   this.entityNumber = 0;

  dis7.LiveEntityIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.liveSimulationAddress.initFromBinary(inputStream);
       this.entityNumber = inputStream.readUShort();
  };

  dis7.LiveEntityIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       this.liveSimulationAddress.encodeToBinary(outputStream);
       outputStream.writeUShort(this.entityNumber);
  };
}; // end of class

 // node.js module support
exports.LiveEntityIdentifier = dis7.LiveEntityIdentifier;

// End of LiveEntityIdentifier class

