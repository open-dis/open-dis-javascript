/**
 * A Simulation Address record shall consist of the Site Identification number and the Application Identification number. Section 6.2.79 
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


dis.SimulationAddress = function()
{
   /** A site is defined as a facility, installation, organizational unit or a geographic location that has one or more simulation applications capable of participating in a distributed event.  */
   this.site = 0;

   /** An application is defined as a software program that is used to generate and process distributed simulation data including live, virtual and constructive data. */
   this.application = 0;

  dis.SimulationAddress.prototype.initFromBinary = function(inputStream)
  {
       this.site = inputStream.readUShort();
       this.application = inputStream.readUShort();
  };

  dis.SimulationAddress.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.site);
       outputStream.writeUShort(this.application);
  };
}; // end of class

 // node.js module support
exports.SimulationAddress = dis.SimulationAddress;

// End of SimulationAddress class

