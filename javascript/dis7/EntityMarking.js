/**
 * Specifies the character set used inthe first byte, followed by 11 characters of text data. Section 6.29
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


null.EntityMarking = function()
{
   /** The character set */
   this.characterSet = 0;

   /** The characters */
   this.characters = 0;

  null.EntityMarking.prototype.initFromBinary = function(inputStream)
  {
       this.characterSet = inputStream.readUByte();
       this.characters = inputStream.readByte();
  };

  null.EntityMarking.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.characterSet);
       outputStream.writeByte(this.characters);
  };
}; // end of class

 // node.js module support
exports.EntityMarking = null.EntityMarking;

// End of EntityMarking class

