/**
 * Data about one electronic system
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
dis.ElectronicEmissionSystemData = function()
{
   /**
    * This field shall specify the length of this emitter system�s data (including beam data and its track/jam information) in 32-bit words. The length shall include the System Data Length field. 
    * @type {number}
    * @instance
    */
   this.systemDataLength = 0;

   /**
    * This field shall specify the number of beams being described in the current PDU for the system being described. 
    * @type {number}
    * @instance
    */
   this.numberOfBeams = 0;

   /**
    * padding.
    * @type {number}
    * @instance
    */
   this.emissionsPadding2 = 0;

   /**
    * This field shall specify information about a particular emitter system
    * @type {EmitterSystem}
    * @instance
    */
   this.emitterSystem = new dis.EmitterSystem(); 

   /**
    * Location with respect to the entity
    * @type {Vector3Float}
    * @instance
    */
   this.location = new dis.Vector3Float(); 

   /**
    * variable length variablelist of beam data records
    * @type {Array<ElectronicEmissionBeamData>}
    * @instance
    */
    this.beamDataRecords = new Array();
 
  /**
   * @param {InputStream} inputStream
   */
  dis.ElectronicEmissionSystemData.prototype.initFromBinary = function(inputStream)
  {
       this.systemDataLength = inputStream.readUByte();
       this.numberOfBeams = inputStream.readUByte();
       this.emissionsPadding2 = inputStream.readUShort();
       this.emitterSystem.initFromBinary(inputStream);
       this.location.initFromBinary(inputStream);
       for(var idx = 0; idx < this.numberOfBeams; idx++)
       {
           var anX = new dis.ElectronicEmissionBeamData();
           anX.initFromBinary(inputStream);
           this.beamDataRecords.push(anX);
       }

  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.ElectronicEmissionSystemData.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.systemDataLength);
       outputStream.writeUByte(this.numberOfBeams);
       outputStream.writeUShort(this.emissionsPadding2);
       this.emitterSystem.encodeToBinary(outputStream);
       this.location.encodeToBinary(outputStream);
       for(var idx = 0; idx < this.beamDataRecords.length; idx++)
       {
        this.beamDataRecords[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.ElectronicEmissionSystemData = dis.ElectronicEmissionSystemData;

// End of ElectronicEmissionSystemData class

