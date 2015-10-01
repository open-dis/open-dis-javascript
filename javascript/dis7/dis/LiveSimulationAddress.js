/**
 * A simulation's designation associated with all Live Entity IDs contained in Live Entity PDUs. Section 6.2.55 
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


dis.LiveSimulationAddress = function()
{
   /** facility, installation, organizational unit or geographic location may have multiple sites associated with it. The Site Number is the first component of the Live Simulation Address, which defines a live simulation. */
   this.liveSiteNumber = 0;

   /** An application associated with a live site is termed a live application. Each live application participating in an event  */
   this.liveApplicationNumber = 0;

  dis.LiveSimulationAddress.prototype.initFromBinary = function(inputStream)
  {
       this.liveSiteNumber = inputStream.readUByte();
       this.liveApplicationNumber = inputStream.readUByte();
  };

  dis.LiveSimulationAddress.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.liveSiteNumber);
       outputStream.writeUByte(this.liveApplicationNumber);
  };
}; // end of class

 // node.js module support
exports.LiveSimulationAddress = dis.LiveSimulationAddress;

// End of LiveSimulationAddress class

