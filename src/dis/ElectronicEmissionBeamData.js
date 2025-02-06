/**
 * Description of one electronic emission beam
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 var dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


/**
 * @constructor
 * @memberof dis
 */
dis.ElectronicEmissionBeamData = function()
{
   /**
    * This field shall specify the length of this beams data in 32 bit words
    * @type {number}
    * @instance
    */
   this.beamDataLength = 0;

   /**
    * This field shall specify a unique emitter database number assigned to differentiate between otherwise similar or identical emitter beams within an emitter system.
    * @type {number}
    * @instance
    */
   this.beamIDNumber = 0;

   /**
    * This field shall specify a Beam Parameter Index number that shall be used by receiving entities in conjunction with the Emitter Name field to provide a pointer to the stored database parameters required to regenerate the beam.
    * @type {number}
    * @instance
    */
   this.beamParameterIndex = 0;

   /**
    * Fundamental parameter data such as frequency range, beam sweep, etc.
    * @type {FundamentalParameterData}
    * @instance
    */
   this.fundamentalParameterData = new dis.FundamentalParameterData(); 

   /**
    * beam function of a particular beam
    * @type {number}
    * @instance
    */
   this.beamFunction = 0;

   /**
    * Number of track/jam targets
    * @type {number}
    * @instance
    */
   this.numberOfTrackJamTargets = 0;

   /**
    * wheher or not the receiving simulation apps can assume all the targets in the scan pattern are being tracked/jammed
    * @type {number}
    * @instance
    */
   this.highDensityTrackJam = 0;

   /**
    * padding
    * @type {number}
    * @instance
    */
   this.pad4 = 0;

   /**
    * identify jamming techniques used
    * @type {number}
    * @instance
    */
   this.jammingModeSequence = 0;

   /**
    * variable length variablelist of track/jam targets
    * @type {Array<TrackJamTarget>}
    * @instance
    */
    this.trackJamTargets = new Array();
 
  /**
   * @param {InputStream} inputStream
   */
  dis.ElectronicEmissionBeamData.prototype.initFromBinary = function(inputStream)
  {
       this.beamDataLength = inputStream.readUByte();
       this.beamIDNumber = inputStream.readUByte();
       this.beamParameterIndex = inputStream.readUShort();
       this.fundamentalParameterData.initFromBinary(inputStream);
       this.beamFunction = inputStream.readUByte();
       this.numberOfTrackJamTargets = inputStream.readUByte();
       this.highDensityTrackJam = inputStream.readUByte();
       this.pad4 = inputStream.readUByte();
       this.jammingModeSequence = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfTrackJamTargets; idx++)
       {
           var anX = new dis.TrackJamTarget();
           anX.initFromBinary(inputStream);
           this.trackJamTargets.push(anX);
       }

  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.ElectronicEmissionBeamData.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.beamDataLength);
       outputStream.writeUByte(this.beamIDNumber);
       outputStream.writeUShort(this.beamParameterIndex);
       this.fundamentalParameterData.encodeToBinary(outputStream);
       outputStream.writeUByte(this.beamFunction);
       outputStream.writeUByte(this.numberOfTrackJamTargets);
       outputStream.writeUByte(this.highDensityTrackJam);
       outputStream.writeUByte(this.pad4);
       outputStream.writeUInt(this.jammingModeSequence);
       for(var idx = 0; idx < this.trackJamTargets.length; idx++)
       {
        this.trackJamTargets[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.ElectronicEmissionBeamData = dis.ElectronicEmissionBeamData;

// End of ElectronicEmissionBeamData class

