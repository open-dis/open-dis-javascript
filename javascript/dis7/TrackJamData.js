/**
 *  Track-Jam data Section 6.2.89
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


null.TrackJamData = function()
{
   /** the entity tracked or illumated, or an emitter beam targeted with jamming */
   this.entityID = new null.EntityID(); 

   /** Emitter system associated with the entity */
   this.emitterNumber = 0;

   /** Beam associated with the entity */
   this.beamNumber = 0;

  null.TrackJamData.prototype.initFromBinary = function(inputStream)
  {
       this.entityID.initFromBinary(inputStream);
       this.emitterNumber = inputStream.readUByte();
       this.beamNumber = inputStream.readUByte();
  };

  null.TrackJamData.prototype.encodeToBinary = function(outputStream)
  {
       this.entityID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.emitterNumber);
       outputStream.writeUByte(this.beamNumber);
  };
}; // end of class

 // node.js module support
exports.TrackJamData = null.TrackJamData;

// End of TrackJamData class

