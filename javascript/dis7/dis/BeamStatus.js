/**
 * Information related to the status of a beam. This is contained in the beam status field of the electromagnitec emission PDU. The first bit determines whether the beam is active (0) or deactivated (1). Section 6.2.12.
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


dis.BeamStatus = function()
{
   /** First bit zero means beam is active, first bit = 1 means deactivated. The rest is padding. */
   this.beamState = 0;

  dis.BeamStatus.prototype.initFromBinary = function(inputStream)
  {
       this.beamState = inputStream.readUByte();
  };

  dis.BeamStatus.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.beamState);
  };
}; // end of class

 // node.js module support
exports.BeamStatus = dis.BeamStatus;

// End of BeamStatus class

