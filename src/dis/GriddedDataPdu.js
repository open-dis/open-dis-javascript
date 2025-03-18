/**
 * Section 5.3.11.2: Information about globat, spatially varying enviornmental effects. This requires manual cleanup; the grid axis        records are variable sized. UNFINISHED
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
dis.GriddedDataPdu = function()
{
   /**
    * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
    * @type {number}
    * @instance
    */
   this.protocolVersion = 6;

   /**
    * Exercise ID
    * @type {number}
    * @instance
    */
   this.exerciseID = 0;

   /**
    * Type of pdu, unique for each PDU class
    * @type {number}
    * @instance
    */
   this.pduType = 42;

   /**
    * value that refers to the protocol family, eg SimulationManagement, et
    * @type {number}
    * @instance
    */
   this.protocolFamily = 9;

   /**
    * Timestamp value
    * @type {number}
    * @instance
    */
   this.timestamp = 0;

   /**
    * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
    * @type {number}
    * @instance
    */
   this.pduLength = 0;

   /**
    * zero-filled array of padding
    * @type {number}
    * @instance
    */
   this.padding = 0;

   /**
    * environmental simulation application ID
    * @type {EntityID}
    * @instance
    */
   this.environmentalSimulationApplicationID = new dis.EntityID(); 

   /**
    * unique identifier for each piece of enviornmental data
    * @type {number}
    * @instance
    */
   this.fieldNumber = 0;

   /**
    * sequence number for the total set of PDUS used to transmit the data
    * @type {number}
    * @instance
    */
   this.pduNumber = 0;

   /**
    * Total number of PDUS used to transmit the data
    * @type {number}
    * @instance
    */
   this.pduTotal = 0;

   /**
    * coordinate system of the grid
    * @type {number}
    * @instance
    */
   this.coordinateSystem = 0;

   /**
    * number of grid axes for the environmental data
    * @type {number}
    * @instance
    */
   this.numberOfGridAxes = 0;

   /**
    * are domain grid axes identidal to those of the priveious domain update?
    * @type {number}
    * @instance
    */
   this.constantGrid = 0;

   /**
    * type of environment
    * @type {EntityType}
    * @instance
    */
   this.environmentType = new dis.EntityType(); 

   /**
    * orientation of the data grid
    * @type {Orientation}
    * @instance
    */
   this.orientation = new dis.Orientation(); 

   /**
    * valid time of the enviormental data sample, 64 bit unsigned int
    * @type {number}
    * @instance
    */
   this.sampleTime = 0;

   /**
    * total number of all data values for all pdus for an environmental sample
    * @type {number}
    * @instance
    */
   this.totalValues = 0;

   /**
    * total number of data values at each grid point.
    * @type {number}
    * @instance
    */
   this.vectorDimension = 0;

   /**
    * padding
    * @type {number}
    * @instance
    */
   this.padding1 = 0;

   /**
    * padding
    * @type {number}
    * @instance
    */
   this.padding2 = 0;

   /**
    * Grid data ^^^This is wrong
    * @type {Array<GridAxisRecord>}
    * @instance
    */
    this.gridDataList = new Array();
 
  /**
   * @param {InputStream} inputStream
   */
  dis.GriddedDataPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.environmentalSimulationApplicationID.initFromBinary(inputStream);
       this.fieldNumber = inputStream.readUShort();
       this.pduNumber = inputStream.readUShort();
       this.pduTotal = inputStream.readUShort();
       this.coordinateSystem = inputStream.readUShort();
       this.numberOfGridAxes = inputStream.readUByte();
       this.constantGrid = inputStream.readUByte();
       this.environmentType.initFromBinary(inputStream);
       this.orientation.initFromBinary(inputStream);
       this.sampleTime = inputStream.readLong();
       this.totalValues = inputStream.readUInt();
       this.vectorDimension = inputStream.readUByte();
       this.padding1 = inputStream.readUShort();
       this.padding2 = inputStream.readUByte();
       for(var idx = 0; idx < this.numberOfGridAxes; idx++)
       {
           var anX = new dis.GridAxisRecord();
           anX.initFromBinary(inputStream);
           this.gridDataList.push(anX);
       }

  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.GriddedDataPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.environmentalSimulationApplicationID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.fieldNumber);
       outputStream.writeUShort(this.pduNumber);
       outputStream.writeUShort(this.pduTotal);
       outputStream.writeUShort(this.coordinateSystem);
       outputStream.writeUByte(this.numberOfGridAxes);
       outputStream.writeUByte(this.constantGrid);
       this.environmentType.encodeToBinary(outputStream);
       this.orientation.encodeToBinary(outputStream);
       outputStream.writeLong(this.sampleTime);
       outputStream.writeUInt(this.totalValues);
       outputStream.writeUByte(this.vectorDimension);
       outputStream.writeUShort(this.padding1);
       outputStream.writeUByte(this.padding2);
       for(var idx = 0; idx < this.gridDataList.length; idx++)
       {
        this.gridDataList[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.GriddedDataPdu = dis.GriddedDataPdu;

// End of GriddedDataPdu class

