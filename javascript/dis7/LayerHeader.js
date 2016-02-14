/**
 * The identification of the additional information layer number, layer-specific information, and the length of the layer. Section 6.2.51
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof null === "undefined")
 null = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


null.LayerHeader = function()
{
   this.layerNumber = 0;

   /** field shall specify layer-specific information that varies by System Type (see 6.2.86) and Layer Number. */
   this.layerSpecificInformation = 0;

   /** This field shall specify the length in octets of the layer, including the Layer Header record */
   this.length = 0;

  null.LayerHeader.prototype.initFromBinary = function(inputStream)
  {
       this.layerNumber = inputStream.readUByte();
       this.layerSpecificInformation = inputStream.readUByte();
       this.length = inputStream.readUShort();
  };

  null.LayerHeader.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.layerNumber);
       outputStream.writeUByte(this.layerSpecificInformation);
       outputStream.writeUShort(this.length);
  };
}; // end of class

 // node.js module support
exports.LayerHeader = null.LayerHeader;

// End of LayerHeader class

