/**
 * Represents the firing or detonation of a munition. Section 6.2.19.2
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


dis.MunitionDescriptor = function()
{
   /** What munition was used in the burst */
   this.munitionType = new dis.EntityType(); 

   /** type of warhead enumeration */
   this.warhead = 0;

   /** type of fuse used enumeration */
   this.fuse = 0;

   /** how many of the munition were fired */
   this.quantity = 0;

   /** rate at which the munition was fired */
   this.rate = 0;

  dis.MunitionDescriptor.prototype.initFromBinary = function(inputStream)
  {
       this.munitionType.initFromBinary(inputStream);
       this.warhead = inputStream.readUShort();
       this.fuse = inputStream.readUShort();
       this.quantity = inputStream.readUShort();
       this.rate = inputStream.readUShort();
  };

  dis.MunitionDescriptor.prototype.encodeToBinary = function(outputStream)
  {
       this.munitionType.encodeToBinary(outputStream);
       outputStream.writeUShort(this.warhead);
       outputStream.writeUShort(this.fuse);
       outputStream.writeUShort(this.quantity);
       outputStream.writeUShort(this.rate);
  };
}; // end of class

 // node.js module support
exports.MunitionDescriptor = dis.MunitionDescriptor;

// End of MunitionDescriptor class

