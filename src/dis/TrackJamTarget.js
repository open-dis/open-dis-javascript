/**
 * One track/jam target
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


dis.TrackJamTarget = function()
{
   /** track/jam target */
   this.trackJam = new dis.EntityID(); 

   /** Emitter ID */
   this.emitterID = 0;

   /** beam ID */
   this.beamID = 0;

  dis.TrackJamTarget.prototype.initFromBinary = function(inputStream)
  {
       this.trackJam.initFromBinary(inputStream);
       this.emitterID = inputStream.readUByte();
       this.beamID = inputStream.readUByte();
  };

  dis.TrackJamTarget.prototype.encodeToBinary = function(outputStream)
  {
       this.trackJam.encodeToBinary(outputStream);
       outputStream.writeUByte(this.emitterID);
       outputStream.writeUByte(this.beamID);
  };
}; // end of class

 // node.js module support
exports.TrackJamTarget = dis.TrackJamTarget;

// End of TrackJamTarget class

