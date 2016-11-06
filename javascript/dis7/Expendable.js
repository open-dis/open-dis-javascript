/**
 * An entity's expendable (chaff, flares, etc) information. Section 6.2.36
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


dis7.Expendable = function()
{
   /** Type of expendable */
   this.expendable = new dis7.EntityType(); 

   this.station = 0;

   this.quantity = 0;

   this.expendableStatus = 0;

   this.padding = 0;

  dis7.Expendable.prototype.initFromBinary = function(inputStream)
  {
       this.expendable.initFromBinary(inputStream);
       this.station = inputStream.readUInt();
       this.quantity = inputStream.readUShort();
       this.expendableStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
  };

  dis7.Expendable.prototype.encodeToBinary = function(outputStream)
  {
       this.expendable.encodeToBinary(outputStream);
       outputStream.writeUInt(this.station);
       outputStream.writeUShort(this.quantity);
       outputStream.writeUByte(this.expendableStatus);
       outputStream.writeUByte(this.padding);
  };
}; // end of class

 // node.js module support
exports.Expendable = dis7.Expendable;

// End of Expendable class

