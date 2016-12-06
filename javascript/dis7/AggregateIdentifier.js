/**
 * The unique designation of each aggrgate in an exercise is specified by an aggregate identifier record. The aggregate ID is not an entity and shall not be treated as such. Section 6.2.3.
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.AggregateIdentifier = function()
{
   /** Simulation address, ie site and application, the first two fields of the entity ID */
   this.simulationAddress = new dis.SimulationAddress(); 

   /** the aggregate ID, an object identifier */
   this.aggregateID = 0;

  dis.AggregateIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.simulationAddress.initFromBinary(inputStream);
       this.aggregateID = inputStream.readUShort();
  };

  dis.AggregateIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       this.simulationAddress.encodeToBinary(outputStream);
       outputStream.writeUShort(this.aggregateID);
  };
}; // end of class

 // node.js module support
exports.AggregateIdentifier = dis.AggregateIdentifier;

// End of AggregateIdentifier class

