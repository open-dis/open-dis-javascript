/**
 * Section 5.2.15. Specifies the character set used inthe first byte, followed by 11 characters of text data.
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


null.Marking = function()
{
   /** The character set */
   this.characterSet = 0;

   /** The characters */
   this.characters = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

  null.Marking.prototype.initFromBinary = function(inputStream)
  {
       this.characterSet = inputStream.readUByte();
       for(var idx = 0; idx < 11; idx++)
       {
          this.characters[ idx ] = inputStream.readByte();
       }
  };

  null.Marking.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.characterSet);
       for(var idx = 0; idx < 11; idx++)
       {
          outputStream.writeByte(this.characters[ idx ] );
       }
  };
}; // end of class

 // node.js module support
exports.Marking = null.Marking;

// End of Marking class

