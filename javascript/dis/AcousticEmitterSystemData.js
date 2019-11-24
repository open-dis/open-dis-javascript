/**
 * Used in the UA pdu; ties together an emmitter and a location. This requires manual cleanup; the beam data should not be attached to each emitter system.
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


dis.AcousticEmitterSystemData = function()
{
   /** Length of emitter system data */
   this.emitterSystemDataLength = 0;

   /** Number of beams */
   this.numberOfBeams = 0;

   /** padding */
   this.pad2 = 0;

   /** This field shall specify the system for a particular UA emitter. */
   this.acousticEmitterSystem = new dis.AcousticEmitterSystem(); 

   /** Represents the location wrt the entity */
   this.emitterLocation = new dis.Vector3Float(); 

   /** For each beam in numberOfBeams, an emitter system. This is not right--the beam records need to be at the end of the PDU, rather than attached to each system. */
    this.beamRecords = new Array();
 
  dis.AcousticEmitterSystemData.prototype.initFromBinary = function(inputStream)
  {
       this.emitterSystemDataLength = inputStream.readUByte();
       this.numberOfBeams = inputStream.readUByte();
       this.pad2 = inputStream.readUShort();
       this.acousticEmitterSystem.initFromBinary(inputStream);
       this.emitterLocation.initFromBinary(inputStream);
       for(var idx = 0; idx < this.numberOfBeams; idx++)
       {
           var anX = new dis.AcousticBeamData();
           anX.initFromBinary(inputStream);
           this.beamRecords.push(anX);
       }

  };

  dis.AcousticEmitterSystemData.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.emitterSystemDataLength);
       outputStream.writeUByte(this.numberOfBeams);
       outputStream.writeUShort(this.pad2);
       this.acousticEmitterSystem.encodeToBinary(outputStream);
       this.emitterLocation.encodeToBinary(outputStream);
       for(var idx = 0; idx < this.beamRecords.length; idx++)
       {
           this.beamRecords[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.AcousticEmitterSystemData = dis.AcousticEmitterSystemData;

// End of AcousticEmitterSystemData class

