/**
 * discrete ostional relationsihip 
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


dis.NamedLocation = function()
{
   /** station name enumeration */
   this.stationName = 0;

   /** station number */
   this.stationNumber = 0;

  dis.NamedLocation.prototype.initFromBinary = function(inputStream)
  {
       this.stationName = inputStream.readUShort();
       this.stationNumber = inputStream.readUShort();
  };

  dis.NamedLocation.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.stationName);
       outputStream.writeUShort(this.stationNumber);
  };
}; // end of class

 // node.js module support
exports.NamedLocation = dis.NamedLocation;

// End of NamedLocation class

