/**
 * Section 5.2.15. Specifies the character set used inthe first byte, followed by 11 characters of text data.
 * The generated Marking class should be augmented with a patch that adds getMarking() and
 * setMarking() methods that convert between arrays and strings, and clamp the length
 * of the string to 11 characters.
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


dis.Marking = function()
{
   /** The character set */
   this.characterSet = 0;

   /** The characters */
   this.characters = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

  dis.Marking.prototype.initFromBinary = function(inputStream)
  {
       this.characterSet = inputStream.readUByte();
       for(var idx = 0; idx < 11; idx++)
       {
          this.characters[ idx ] = inputStream.readByte();
       }
  };

  dis.Marking.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.characterSet);
       for(var idx = 0; idx < 11; idx++)
       {
          outputStream.writeByte(this.characters[ idx ] );
       }
  };
  
  /*
   * Returns the byte array marking, in string format. 
   * @return string format marking characters
   */
  dis.Marking.prototype.getMarking = function()
  {
      var marking = "";
      for(var idx = 0; idx < 11; idx++)
      {
          marking = marking + String.fromCharCode(this.characters[idx]);
      }
      
      return marking;
  };
  
  /**
   * Given a string format marking, sets the bytes of the marking object
   * to the appropriate character values. Clamps the string to no more
   * than 11 characters.
   * 
   * @param {String} newMarking string format marking
   * @returns {nothing}
   */
  dis.Marking.prototype.setMarking = function(newMarking)
  {
      var stringLen = newMarking.length;
      if(stringLen > 11)
          stringLen = 11;
      
      // Copy over up to 11 characters from the string to the array
      var charsCopied = 0;
      while(charsCopied < stringLen)
      {          
          this.characters[charsCopied] = newMarking.charCodeAt( charsCopied );
          charsCopied++;
      }
      
      // Zero-fill the remainer of the character array
      while(charsCopied < 11)
      {
          this.characters[ charsCopied ] = 0;
          charsCopied++;
      }
      
  };
}; // end of class

 // node.js module support
exports.Marking = dis.Marking;

// End of Marking class

