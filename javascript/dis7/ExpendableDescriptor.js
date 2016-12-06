/**
 * Burst of chaff or expendible device. Section 6.2.19.4
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


dis.ExpendableDescriptor = function()
{
   /** Type of the object that exploded */
   this.expendableType = new dis.EntityType(); 

   /** Padding */
   this.padding = 0;

  dis.ExpendableDescriptor.prototype.initFromBinary = function(inputStream)
  {
       this.expendableType.initFromBinary(inputStream);
       this.padding = inputStream.readLong();
  };

  dis.ExpendableDescriptor.prototype.encodeToBinary = function(outputStream)
  {
       this.expendableType.encodeToBinary(outputStream);
       outputStream.writeLong(this.padding);
  };
}; // end of class

 // node.js module support
exports.ExpendableDescriptor = dis.ExpendableDescriptor;

// End of ExpendableDescriptor class

