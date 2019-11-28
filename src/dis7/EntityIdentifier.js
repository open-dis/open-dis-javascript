/**
 * Entity Identifier. Unique ID for entities in the world. Consists of an simulation address and a entity number. Section 6.2.28.
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


dis.EntityIdentifier = function()
{
   /** Site and application IDs */
   this.simulationAddress = new dis.SimulationAddress(); 

   /** Entity number */
   this.entityNumber = 0;

  dis.EntityIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.simulationAddress.initFromBinary(inputStream);
       this.entityNumber = inputStream.readUShort();
  };

  dis.EntityIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       this.simulationAddress.encodeToBinary(outputStream);
       outputStream.writeUShort(this.entityNumber);
  };
}; // end of class

 // node.js module support
exports.EntityIdentifier = dis.EntityIdentifier;

// End of EntityIdentifier class

