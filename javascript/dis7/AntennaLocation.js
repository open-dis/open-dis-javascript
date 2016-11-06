/**
 * Location of the radiating portion of the antenna, specified in world coordinates and entity coordinates. Section 6.2.8
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.AntennaLocation = function()
{
   /** Location of the radiating portion of the antenna in world    coordinates */
   this.antennaLocation = new dis7.Vector3Double(); 

   /** Location of the radiating portion of the antenna     in entity coordinates */
   this.relativeAntennaLocation = new dis7.Vector3Float(); 

  dis7.AntennaLocation.prototype.initFromBinary = function(inputStream)
  {
       this.antennaLocation.initFromBinary(inputStream);
       this.relativeAntennaLocation.initFromBinary(inputStream);
  };

  dis7.AntennaLocation.prototype.encodeToBinary = function(outputStream)
  {
       this.antennaLocation.encodeToBinary(outputStream);
       this.relativeAntennaLocation.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.AntennaLocation = dis7.AntennaLocation;

// End of AntennaLocation class

