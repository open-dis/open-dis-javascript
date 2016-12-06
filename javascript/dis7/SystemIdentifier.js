/**
 * The ID of the IFF emitting system. NOT COMPLETE. Section 6.2.87
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


dis.SystemIdentifier = function()
{
   /** general type of emitting system, an enumeration */
   this.systemType = 0;

   /** named type of system, an enumeration */
   this.systemName = 0;

   /** mode of operation for the system, an enumeration */
   this.systemMode = 0;

   /** status of this PDU, see section 6.2.15 */
   this.changeOptions = new dis.ChangeOptions(); 

  dis.SystemIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.systemType = inputStream.readUShort();
       this.systemName = inputStream.readUShort();
       this.systemMode = inputStream.readUShort();
       this.changeOptions.initFromBinary(inputStream);
  };

  dis.SystemIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.systemType);
       outputStream.writeUShort(this.systemName);
       outputStream.writeUShort(this.systemMode);
       this.changeOptions.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.SystemIdentifier = dis.SystemIdentifier;

// End of SystemIdentifier class

