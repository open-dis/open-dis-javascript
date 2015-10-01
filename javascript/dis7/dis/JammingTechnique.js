/**
 * Jamming technique. Section 6.2.49
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


dis.JammingTechnique = function()
{
   this.kind = 0;

   this.category = 0;

   this.subcategory = 0;

   this.specific = 0;

  dis.JammingTechnique.prototype.initFromBinary = function(inputStream)
  {
       this.kind = inputStream.readUByte();
       this.category = inputStream.readUByte();
       this.subcategory = inputStream.readUByte();
       this.specific = inputStream.readUByte();
  };

  dis.JammingTechnique.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.kind);
       outputStream.writeUByte(this.category);
       outputStream.writeUByte(this.subcategory);
       outputStream.writeUByte(this.specific);
  };
}; // end of class

 // node.js module support
exports.JammingTechnique = dis.JammingTechnique;

// End of JammingTechnique class

