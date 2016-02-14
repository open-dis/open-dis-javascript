/**
 * Section 5.2.14.1. A Simulation Address  record shall consist of the Site Identification number and the Application Identification number.
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


null.SimulationAddress = function()
{
   /** The site ID */
   this.site = 0;

   /** The application ID */
   this.application = 0;

  null.SimulationAddress.prototype.initFromBinary = function(inputStream)
  {
       this.site = inputStream.readUShort();
       this.application = inputStream.readUShort();
  };

  null.SimulationAddress.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.site);
       outputStream.writeUShort(this.application);
  };
}; // end of class

 // node.js module support
exports.SimulationAddress = null.SimulationAddress;

// End of SimulationAddress class

