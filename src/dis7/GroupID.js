/**
 * Unique designation of a group of entities contained in the isGroupOfPdu. Represents a group of entities rather than a single entity. Section 6.2.43
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


dis.GroupID = function()
{
   /** Simulation address (site and application number) */
   this.simulationAddress = new dis.EntityType(); 

   /** group number */
   this.groupNumber = 0;

  dis.GroupID.prototype.initFromBinary = function(inputStream)
  {
       this.simulationAddress.initFromBinary(inputStream);
       this.groupNumber = inputStream.readUShort();
  };

  dis.GroupID.prototype.encodeToBinary = function(outputStream)
  {
       this.simulationAddress.encodeToBinary(outputStream);
       outputStream.writeUShort(this.groupNumber);
  };
}; // end of class

 // node.js module support
exports.GroupID = dis.GroupID;

// End of GroupID class

