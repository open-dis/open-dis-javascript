/**
 * discrete ostional relationsihip 
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


null.NamedLocation = function()
{
   /** station name enumeration */
   this.stationName = 0;

   /** station number */
   this.stationNumber = 0;

  null.NamedLocation.prototype.initFromBinary = function(inputStream)
  {
       this.stationName = inputStream.readUShort();
       this.stationNumber = inputStream.readUShort();
  };

  null.NamedLocation.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.stationName);
       outputStream.writeUShort(this.stationNumber);
  };
}; // end of class

 // node.js module support
exports.NamedLocation = null.NamedLocation;

// End of NamedLocation class

