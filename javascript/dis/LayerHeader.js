/**
 * 5.2.47.  Layer header.
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


dis.LayerHeader = function()
{
   /** Layer number */
   this.layerNumber = 0;

   /** Layer speccific information enumeration */
   this.layerSpecificInformaiton = 0;

   /** information length */
   this.length = 0;

  dis.LayerHeader.prototype.initFromBinary = function(inputStream)
  {
       this.layerNumber = inputStream.readUByte();
       this.layerSpecificInformaiton = inputStream.readUByte();
       this.length = inputStream.readUShort();
  };

  dis.LayerHeader.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.layerNumber);
       outputStream.writeUByte(this.layerSpecificInformaiton);
       outputStream.writeUShort(this.length);
  };
}; // end of class

 // node.js module support
exports.LayerHeader = dis.LayerHeader;

// End of LayerHeader class

